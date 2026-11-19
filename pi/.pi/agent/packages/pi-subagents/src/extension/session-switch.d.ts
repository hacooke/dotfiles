import type { ExtensionContext, SessionShutdownEvent } from "@earendil-works/pi-coding-agent";
import type { SubagentState } from "../shared/types.ts";
type SwitchReason = "new" | "resume" | "fork";
export type SessionSwitchContext = Pick<ExtensionContext, "mode" | "hasUI"> & {
    ui: Pick<ExtensionContext["ui"], "select" | "notify">;
};
interface SessionSwitchDeps {
    state: SubagentState;
    asyncDirRoot: string;
    resultsDir: string;
    hasPendingResults(): boolean;
    hasPendingSupervisorRequest(): boolean;
}
/**
 * Asks what happens to this session's outstanding background work when a UI session switches away. Without a UI or
 * outstanding work the switch proceeds and the next session inherits the work. The prompt never enters model history.
 */
export declare function createSessionSwitchGuard(deps: SessionSwitchDeps): {
    beforeSwitch(reason: SwitchReason, ctx: SessionSwitchContext): Promise<{
        cancel: true;
    } | undefined>;
    sessionShutdown(event: SessionShutdownEvent): void;
    dispose(): void;
};
export {};
