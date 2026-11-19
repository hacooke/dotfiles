# Architecture Plan: Herdr Co-Agent Nodes for Pi Workflows

**Status:** Draft — not approved for implementation  
**Scope:** Requirements and high-level plan; not an implementation handoff.

## Objective

Add a first-class `co-agent` node to `@osolmaz/pi-workflows`. Node launches a native Pi worker in a Herdr TUI pane, gives it a role-specific skill and task, accepts scoped progress updates from worker, and returns validated result to graph. Workflow graph remains source of truth for stage transitions and final outcomes.

Target experience: one orchestrator accepts project requirements, selects a workflow variant, dispatches roles such as scoper/planner/dev/QA/reviewer across repository worktrees, and shows project and worker state.

## Review summary

- Use `pi-workflows` as graph/state engine; add `co-agent` to core node model. Current node types are a closed discriminated union; no public custom-node registry exists.
- Keep Herdr worker lifecycle in an adapter owned by `pi-workflows`; do not treat terminal text or agent status alone as verified task success.
- Give child Pi a small reporting extension/tool. A skill can instruct worker to report, but cannot create that capability.
- Store worker identity and progress durably, scoped to workflow run + node attempt. Treat launch and prompt submission as uncertain external effects until reconciliation exists.
- Start with local Herdr TUI and native Pi only. Do not conflate TUI with separate Herdr desktop app or `project.open` peer sessions.
- Keep `pi-subagents` as an alternative/possible execution component: it already handles specialist child Pi sessions and skills, but its scripted workflow model is not a first-class status-routed graph.

## Requirements

### Functional

1. **Workflow selection and context**
   - Orchestrator can select named workflow definitions (for example `standard`: planner → dev → reviewer; `full`: scoper → planner → dev → QA → reviewer).
   - Workflow receives requirements, project/repo identity, worktree path, and workflow/build version.
   - Graph can route on validated result and declared outcomes: success, failure, timeout, blocked, cancelled, unknown.

2. **Co-agent execution**
   - Node accepts role/profile, task/prompt template, skill path(s), explicit project cwd/worktree, and declared tool/model policy.
   - Node creates or selects an available Herdr shell pane and starts native Pi agent there.
   - Node tracks returned Herdr workspace/pane/agent identifiers; never depend on ambient focus or guessed IDs.
   - Node submits task, waits for task-correlated completion, gathers structured result, and hands result to downstream nodes.
   - Node can run sequentially or concurrently when graph permits; writing agents must have an explicit shared-worktree or isolated-worktree policy.

3. **Worker progress/status channel**
   - Spawned Pi exposes a `workflow_status` tool through a child-side extension. Skill instructs agent when/how to use tool.
   - Reporter accepts only bounded, typed fields such as phase, state, short message, and optional milestone/progress value.
   - Every event binds to one workflow run, node ID, attempt, and worker identity. Child cannot choose another workflow/node or alter graph edges.
   - Progress is visible on the workflow run/node and persisted. Progress is advisory telemetry; only node's validated terminal result controls graph routing.
   - Blocked/question/approval state pauses workflow or requests human action; extension never approves dialogs on worker's behalf.

4. **Lifecycle and recovery**
   - Node supports start, prompt, wait, result read, cancel/interrupt attempt, timeout, and pane cleanup policy.
   - Persist `(workflowRunId, nodeId, attemptId) -> Herdr session/workspace/pane/agent/session identity` before or during launch.
   - On restart or ambiguous action, inspect/reconcile existing worker before retry. Do not claim exactly-once launch or prompt delivery.
   - Distinguish worker process readiness from completion of specific task. `idle` alone is not proof that submitted task completed.
   - Retain pane on success/failure only under configured policy; never close pane not proven owned by workflow.

5. **Status overview**
   - Workflow viewer shows project, workflow name/version, node state, role, worker/pane identity, latest progress event, duration, and recovery/blocked state.
   - Provide active-project summary across workflows in the shared workflow store. This is separate from Herdr pane list and must not imply it can inspect unrelated Pi sessions.

### Non-functional and safety

- Native Pi worker and Herdr TUI are initial supported backend; no guarantee for external CLI agents or Herdr app backend.
- Worker tools, credentials, project context, extensions, and approval policies are configured for child Pi explicitly. Parent graph node's `allowedTools` does not automatically constrain separately spawned Pi.
- Status reporter uses scoped capability (prefer local authenticated IPC or equivalent); do not put broad workflow-server credentials in task prompt.
- Validate result/status schemas and bound event size/rate. Do not allow arbitrary workflow-state mutation through reporter.
- Side effects declare recovery policy. Use manual/operator recovery on ambiguous launch or prompt until safe adoption/idempotency mechanism exists.
- Worktree creation is explicit. Herdr pane launch does not itself create Git worktree. Initial node may require an existing worktree path.
- Support single host/session first; fail clearly when workflow runner cannot reach intended Herdr endpoint.

## Research findings

### Package identity

- Target graph package is [`@osolmaz/pi-workflows`](https://github.com/osolmaz/pi-workflows).
- [`nicobailon/pi-subagents`](https://github.com/nicobailon/pi-subagents) is separate. Its JS workflow scripts coordinate child agents; `runs.run`, `runs.all`, and `runs.lanes` support sequence/fanout/lanes, with agent definitions and skills. Useful comparison, not the same package.
- Other repositories named `pi-subagents` exist; do not conflate them.

### Pi Workflows architecture

- Node types (`agent`, `compute`, `notify`, `action`, `checkpoint`) form a closed union. Schema rejects unknown node kinds. A first-class `co-agent` requires core changes, not merely a workflow module or executor override.
- Existing extension point for `AgentStepExecutor` changes execution of existing `agent` steps; it does not register new node kinds.
- Core touch points include node types/constructors, schema validation, graph validation, engine dispatch/recovery, snapshots/persisted node state, renderer/viewer, and tests/docs.
- `action`/`shell` nodes can call Herdr today, but remain action nodes and inherit effect recovery semantics.
- `WorkflowActionContext.publishUpdate` and workflow progress contracts provide a likely path to persist node progress after co-agent adapter observes it.
- Compute nodes are for pure TypeScript transforms; action/shell nodes perform external side effects and must declare idempotent/manual recovery behavior.

### Herdr Pi worker lifecycle

- Herdr TUI documents workspace/tab/pane creation; `agent start` requires an existing available shell pane and returns identifiers to use.
- `herdr agent start <name> --kind pi --pane <pane-id> -- <Pi args...>` passes Pi args after `--`; Pi supports repeatable `--skill <path>`.
- `agent prompt --wait`, `agent wait`, and `agent read` support task delivery, lifecycle observation, and terminal text capture.
- Herdr docs warn that prompt timeout/stall does not prove prompt was not delivered. Wait observes lifecycle, not necessarily a particular model turn; idle is not task success. Read/validate result before retry or graph routing.
- No documented exactly-once token for Herdr start/prompt, no direct structured Pi result API, and no guarantee that workflow cancellation stops independent worker. Pane/process can outlive workflow runner.
- Worker may report progress via a new child Pi extension/tool; skill is guidance, not transport or authorization.

### Comparison with pi-subagents

- `pi-subagents` has stronger existing native child-agent lifecycle, roles/skills, Herdr child placement, and same-session FleetView.
- Its workflow scripts are code-driven orchestration, not a first-class persistent status graph; raw scripts lack filesystem/shell/arbitrary tool access. It offers constrained trusted host-command resources.
- Neither package supplies complete cross-project live status aggregation of all independent sessions out of box.

## Proposed design

| Contract | Responsibility | Fields / invariants | Ownership / storage |
|---|---|---|---|
| `CoAgentNodeDefinition` | Declarative worker request and policy | role/profile; skill refs; prompt/input; project cwd/worktree; tool policy; timeout; result schema; pane retention; blocked/recovery policy | Workflow source; included in definition snapshot by safe serializable fields |
| `CoAgentAttempt` | Durable external-worker identity | run ID, node ID, attempt ID, Herdr session/workspace/pane/agent IDs, Pi session identity, launch state, last observed sequence | Workflow store; unique to one node attempt |
| `CoAgentProgressEvent` | Child-to-workflow status contract | attempt ID; sequence; state/phase; bounded message; timestamp; optional milestone | Validated through scoped reporter; persisted as node updates |
| `CoAgentResult` | Terminal output consumed by graph | typed outcome + schema-validated structured data + artifact references | Persisted node result; graph edges route from this, not free-form progress |
| Herdr adapter | Start, prompt, observe, read, interrupt/cleanup | explicit endpoint and IDs; no focus-based targeting; ownership check before close | Workflow runner service; no arbitrary commands from workflow input |
| Worker reporter extension | Expose `workflow_status` tool in child Pi | capability scoped to one attempt; rejects stale/foreign attempts; no graph editing or approval authority | Loaded into child Pi through approved extension/config path |

### Call flow

1. Engine reserves node attempt and records effect/recovery state.
2. Adapter verifies workflow host can reach intended Herdr session; creates/selects workspace and shell pane for declared worktree; persists returned IDs.
3. Adapter starts Pi with role skill and reporter extension; waits for readiness; submits task with workflow/build/node context.
4. Worker calls reporter tool for progress/block requests. Reporter authenticates attempt and writes bounded event via workflow service; engine publishes and persists update.
5. Adapter waits for task-correlated terminal signal, reads result, validates schema and outcome, persists node result, then engine follows matching graph edge.
6. On blocked/unknown/timeout/cancel, engine pauses or fails according to node policy; adapter attempts only verified cleanup and records unresolved worker for reconciliation.

### MVP boundaries

- Local Herdr TUI, native Pi, one workflow runner host.
- Existing worktree path supplied to node; no automated worktree creation/merge in first slice.
- One co-agent attempt per node; sequential stages first. Parallel workers can follow after recovery behavior is tested.
- Fixed role/skill configuration from trusted workflow source; no arbitrary skill paths or shell command from user prompt.
- Typed reporter events + structured result file/tool output. Manual recovery for ambiguous launch/prompt. Human handles blocked state.
- Viewer displays active project/workflow/node/worker state; no universal dashboard for unrelated Herdr sessions.

## High-level plan

1. **Lifecycle spike:** Existing `action` node creates a Herdr pane, launches Pi with one skill, prompts, reads/validates output. Test runner-to-Herdr reachability and interruption points. Do not build generalized co-agent API yet.
2. **Node contract/core plumbing:** Add discriminant/constructor, validation, graph semantics, effect reservation, snapshot/storage projection, node type display, and success/failure/blocked outcomes.
3. **Worker adapter:** Add Herdr session/pane ownership, launch/prompt/wait/read/cancel behavior, stable attempt registry, and manual recovery path.
4. **Status reporter:** Add child Pi extension/tool with attempt-scoped authentication, bounded events, workflow `publishUpdate` integration, stale-attempt rejection, and UI progress projection.
5. **Hardening:** Add recovery/cancel/restart tests, ambiguous launch and prompt tests, schema migrations, docs, and operator inspection/reconciliation commands. Then consider parallel agents and managed worktree lifecycle.

## Effort estimate

Judgment for one experienced TypeScript developer; verify with a lifecycle spike.

- **2–4 days:** Herdr launch/prompt/read spike using current `action` node.
- **3–6 weeks:** First-class sequential MVP including core node support, worker adapter, status reporter, persistence/viewer, conservative recovery, and focused tests.
- **6–10+ weeks:** Production-grade crash reconciliation, safe worker adoption, cancellation/cleanup, concurrent co-agents, permission policy, worktree provisioning/merge, and broader integration tests.

Major uncertainty: Herdr task completion correlation and safe recovery after uncertain prompt delivery. Do not reduce estimate until spike proves those paths.

## Assumptions and open questions

- Is target Herdr TUI only, or must Herdr desktop app also work?
- Does one project share one worktree across planner/dev/QA, or does each writing worker get an isolated worktree?
- Which progress states are required (`planning`, `implementing`, `testing`, `blocked`, custom), and which are labels versus actual graph outcomes?
- Should reporter accept only fixed status enums, or also structured checklist/test evidence?
- What is task completion authority: Pi final result, explicit reporter event, validated result file, or combination?
- Who owns pane lifetime after node ends: workflow, operator, or retention policy?
- What child tools/models/credentials may each role receive? Which approvals always require a person?
- Is global status across all active projects a hard MVP requirement or a follow-up dashboard?

## Risks and compatibility

- Core node addition is a breaking surface for exhaustive validators/renderers; snapshot/storage migrations and old workflow compatibility need tests.
- Workflow process and Herdr worker are separate lifecycle domains. Crash between external side effect and workflow receipt can duplicate agent or prompt unless reconciled.
- `agent wait` state does not alone identify completion of exact submitted task; output extraction can be incomplete/terminal-oriented.
- Status reporter is a trust boundary. Skill-only instructions are insufficient; token leakage or unscoped writes could corrupt unrelated workflow state.
- Workflow cancellation does not automatically own/terminate child process; untracked panes can leak.
- `manualEffect` protects against blind retries but forces operator recovery in ambiguous cases; automation should be added only with tested adoption/idempotency.
- New node kind must be understood by graph validation, engine, persistence, CLI, viewer, and any host integrations; node plugin registry could be a separate future architecture if third-party co-agent backends are expected.

## Sources

- [`pi-workflows` README](https://github.com/osolmaz/pi-workflows/blob/main/README.md)
- [`WORKFLOWS.md`](https://github.com/osolmaz/pi-workflows/blob/main/docs/WORKFLOWS.md)
- [`WORKFLOW_UPDATES.md`](https://github.com/osolmaz/pi-workflows/blob/main/docs/WORKFLOW_UPDATES.md)
- [`src/workflows/types.ts`](https://github.com/osolmaz/pi-workflows/blob/main/src/workflows/types.ts)
- [`src/workflows/schema.ts`](https://github.com/osolmaz/pi-workflows/blob/main/src/workflows/schema.ts)
- [`src/workflows/graph.ts`](https://github.com/osolmaz/pi-workflows/blob/main/src/workflows/graph.ts)
- [`src/workflows/engine.ts`](https://github.com/osolmaz/pi-workflows/blob/main/src/workflows/engine.ts)
- [`src/workflows/store.ts`](https://github.com/osolmaz/pi-workflows/blob/main/src/workflows/store.ts)
- [`src/render/node-type.ts`](https://github.com/osolmaz/pi-workflows/blob/main/src/render/node-type.ts)
- [Herdr Agent automation](https://herdr.dev/tui/docs/agent-automation/)
- [Herdr CLI reference](https://herdr.dev/tui/docs/cli-reference/)
- [Herdr Pi integration](https://herdr.dev/tui/docs/integrations/)
- [Pi CLI `--skill`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/cli.md#resources)
- [`pi-subagents` workflows](https://github.com/nicobailon/pi-subagents/blob/main/docs/workflows.md)
