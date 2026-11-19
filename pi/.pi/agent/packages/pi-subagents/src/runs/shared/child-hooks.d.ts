import type { ChildRuntimeConfig } from "./child-runtime-config.ts";
import type { ChildToolDiagnostic } from "./tool-availability.ts";
import type { ChildHookExtension, ChildSessionLaunch } from "./child-session.ts";
import type { ChildTranscriptWriter } from "../../shared/child-transcript.ts";
/** The host's mandatory transcript reporting, owned by the existing hook certificate. */
export declare function withChildSessionErrorReporting(session: Omit<ChildSessionLaunch, "onExtensionError">, transcriptWriter: ChildTranscriptWriter | undefined): ChildSessionLaunch;
export declare function isReadonlyChildSessionReporting(launch: ChildSessionLaunch): boolean;
/** Internal proof of the captured closure/config, not its caller-controlled display name. */
export declare function isReadonlyChildHookProfile(hooks: ChildHookExtension[], config: ChildRuntimeConfig): boolean;
/** Arm just the next installation; ordinary installations retain the original API/handlers. */
export declare function observeReadonlyChildHookDrain(hooks: ChildHookExtension[], enabled: boolean, sessionFile: string): void;
export declare function captureReadonlyChildDrain(hooks: ChildHookExtension[]): (() => boolean);
/**
 * The child-side hooks pi-subagents installs in every child, keyed off the
 * launch config. The registrations live in `subagent-prompt-runtime.ts`,
 * `fast-mode-extension.ts`, and `fanout-child.ts`.
 */
export declare function createChildHooks(config: ChildRuntimeConfig): ChildHookExtension[];
/** Launch-owned bookkeeping, paired with the same private hook certificate (no callback registration API). */
export declare function createCapturedChildHooks(config: ChildRuntimeConfig): {
    hooks: ChildHookExtension[];
    toolDiagnostic: () => ChildToolDiagnostic | undefined;
    runtimeAcknowledgedExtensions: () => import("../../shared/types.ts").RuntimeAcknowledgedChildExtensions | undefined;
    finalDrainHeld: () => boolean;
};
