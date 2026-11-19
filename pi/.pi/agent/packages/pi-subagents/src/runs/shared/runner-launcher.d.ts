import type { AgentConfig } from "../../agents/agents.ts";
import type { RequiredRunnerLauncher, RunnerLauncher } from "../../shared/types.ts";
export declare const REQUIRE_LAUNCHER_SHAPE_ERROR = "requireLauncher is supported only on a top-level single-agent call (agent + task); it cannot be combined with tasks, chain, workflow, an action, resume, or a workflow child.";
/** Own-property lookup, so an inherited object key can never select a command. */
export declare function lookupRunnerLauncher(runnerLaunchers: Record<string, string[]> | undefined, name: string): RunnerLauncher | undefined;
/** A launcher wraps the local Pi background runner, so it cannot combine with machine placement or an external runner. */
export declare function runnerLauncherPlacementError(agent: Pick<AgentConfig, "name" | "launcher" | "runner">, machine: string | undefined): string | undefined;
/** The launcher an agent launch runs under, or the reason it cannot launch. */
export declare function resolveAgentRunnerLauncher(agent: Pick<AgentConfig, "name" | "launcher" | "runner">, runnerLaunchers: Record<string, string[]> | undefined, machine: string | undefined): {
    launcher?: RunnerLauncher;
    error?: string;
};
/**
 * Checks a call's launcher requirement against the agent and launcher a launch resolved. On a match it returns the
 * digest it checked, so the launch can record that digest instead of hashing the agent file again.
 */
export declare function checkRequiredRunnerLauncher(agent: AgentConfig, launcherName: string | undefined, required: RequiredRunnerLauncher): {
    definitionDigest: string;
    error?: undefined;
} | {
    error: string;
};
