---
name: agent-reporting
description: Send task-scoped status reports to an orchestrator from a managed child-agent session. Use when launch instructions provide an orchestrator terminal ID, task ID, and report trigger.
---

# Agent reporting

Use this skill only when the launch prompt supplies a task ID, literal orchestrator terminal ID, and reporting instructions. Standalone role work without that context has no orchestration-reporting requirement.

## Rules

- Report only to the exact orchestrator terminal ID supplied in the launch prompt. Never use your own `$HC_TERMINAL_ID` as the destination, guess an ID, or leave a placeholder.
- The launch prompt defines which event to send, when to send it, expected status, and relevant artifacts. Follow that contract exactly; do not invent events or send premature/duplicate reports.
- In an orchestrated session, communication is one-way to the orchestrator. Never contact or launch peer agents.
- Send one JSON object on one line with `hc send <orchestrator-terminal-id> <json>`. Use safe JSON and shell quoting; use `jq` when values need escaping.
- Standard event names: `human_gate_ready`, `plan_ready`, `implementation_complete`, `review_complete`, `blocked`, and `failed`. Use only events authorized by the launch prompt.
- Required report keys: `version` (`1`), `task_id`, `event`, `status`, `artifacts` (absolute paths within the task workspace; empty array if none), and concise `summary`.
- Use `done` only for completed work, `waiting_for_user` for `human_gate_ready`, and `blocked` or `failed` with a `reason` when applicable. `done`, file presence, process exit, or agent status does not imply user approval.
- `human_gate_ready` means pause and wait for the orchestrator's explicit resume. It is never approval. Report approval only when the user explicitly made that decision through the requested workflow.
- If an orchestrated launch omits or makes the task ID, destination, event trigger, or required status ambiguous, do not guess; ask the orchestrator for clarification.

Example envelope (use actual launch values, not these sample values):

```json
{"version":1,"task_id":"task-123","event":"implementation_complete","status":"done","artifacts":["/workspace/.agents/PLAN.md"],"summary":"Implementation complete; checks passed: ..."}
```
