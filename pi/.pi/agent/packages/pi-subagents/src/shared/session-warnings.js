import { withCachedUiContext } from "./extension-context.js";
const reportedWarnings = new WeakMap();
/**
 * Reports a warning once per extension runtime and key. Console output while the TUI owns the terminal is drawn
 * over the editor, so a session with a UI gets a TUI warning; a headless session gets the line on stderr.
 * Pass `key` when the message varies between occurrences (for example, an elapsed time).
 */
export function reportSessionWarning(state, message, key = message) {
    let reported = reportedWarnings.get(state);
    if (!reported)
        reportedWarnings.set(state, reported = new Set());
    if (reported.has(key))
        return;
    reported.add(key);
    const text = `[pi-subagents] ${message}`;
    const cached = state.lastUiContext;
    const notified = withCachedUiContext(cached, () => {
        if (state.lastUiContext === cached)
            state.lastUiContext = null;
    }, (ctx) => {
        ctx.ui.notify(text, "warning");
        return true;
    });
    if (!notified)
        console.warn(text);
}
