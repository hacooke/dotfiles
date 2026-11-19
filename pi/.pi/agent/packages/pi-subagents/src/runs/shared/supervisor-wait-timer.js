/** A child making one of these calls is blocked on its supervisor's reply, not working. */
export function isBlockingSupervisorTool(toolName, args) {
    if (!args || typeof args !== "object")
        return false;
    const call = args;
    if (toolName === "contact_supervisor")
        return call.reason === "need_decision" || call.reason === "interview_request";
    return toolName === "intercom" && call.action === "ask";
}
export function startPausableTimer(delayMs, onFire) {
    let remaining = Math.max(0, delayMs);
    // Monotonic clock: a system clock change must not shorten or extend the budget.
    let runningSince;
    let timer;
    let done = false;
    const pausedBy = new Set();
    const remainingMs = () => runningSince === undefined ? remaining : Math.max(0, remaining - (performance.now() - runningSince));
    const run = () => {
        runningSince = performance.now();
        timer = setTimeout(() => {
            done = true;
            runningSince = undefined;
            remaining = 0;
            onFire();
        }, remaining);
        timer.unref?.();
    };
    const stop = () => {
        clearTimeout(timer);
        remaining = remainingMs();
        runningSince = undefined;
    };
    run();
    return {
        pause(key) {
            if (done)
                return;
            if (pausedBy.size === 0)
                stop();
            pausedBy.add(key);
        },
        resume(key) {
            if (done || !pausedBy.delete(key) || pausedBy.size > 0)
                return;
            run();
        },
        remainingMs,
        clear() {
            done = true;
            stop();
        },
    };
}
export function pauseForSupervisorWait(timer, event) {
    if (!timer || typeof event.toolCallId !== "string")
        return;
    if (event.type === "tool_execution_start" && isBlockingSupervisorTool(event.toolName, event.args))
        timer.pause(event.toolCallId);
    else if (event.type === "tool_execution_end")
        timer.resume(event.toolCallId);
}
