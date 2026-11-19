import type { SubagentState } from "./types.ts";
/**
 * Reports a warning once per extension runtime and key. Console output while the TUI owns the terminal is drawn
 * over the editor, so a session with a UI gets a TUI warning; a headless session gets the line on stderr.
 * Pass `key` when the message varies between occurrences (for example, an elapsed time).
 */
export declare function reportSessionWarning(state: SubagentState, message: string, key?: string): void;
