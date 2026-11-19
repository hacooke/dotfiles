import type { RecordedPid } from "./stale-run-reconciler.ts";
/**
 * Identity of the current machine boot, read once per process. A pid recorded under a
 * different boot id cannot still be running. Undefined when the platform has none.
 */
export declare function currentBootId(): string | undefined;
export declare function currentRecordedPid(): RecordedPid;
/** Runners take Pi's value from their config. */
export declare function primeBootId(value: string | undefined): void;
export declare function resetBootIdForTesting(nextReader?: () => string | undefined): void;
