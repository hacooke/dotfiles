/**
 * Package-owned workflow scripts for the data-only `tasks` and `chain` inputs.
 * Callers supply only data; every caller string is embedded with JSON.stringify
 * and never becomes code. Scripts run on the ordinary workflow runtime.
 */
export type StructuredWorkflowKind = "tasks" | "chain";
/** Recovery advice per rejected field, so a retry keeps the caller's intent instead of dropping the field. */
export declare function unsupportedChildFieldAdvice(fields: readonly string[], scripts: boolean): string;
export declare function isPlainRecord(value: unknown): value is Record<string, unknown>;
/** Validate exact data shapes and expand them into a package-owned workflow script. `scripts` is true only for the named `parallel` workflow; top-level tasks and chain exist only when workflow scripts are disabled. */
export declare function buildStructuredWorkflowScript(kind: StructuredWorkflowKind, steps: unknown, originalTask: string | undefined, scripts: boolean): string;
