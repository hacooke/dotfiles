// Pi's manual compaction (/compact, RPC, ctx.compact()) aborts the active run before any hook runs, and its
// events do not say whether it interrupted one. Record that in AgentSession.compact, their shared entry point.
const stateSymbol = Symbol.for("pi-subagents.compaction-interruption.v1");
const wrappedSymbol = Symbol.for("pi-subagents.compaction-interruption.v1.wrapped");
// Shared with the wrapper an earlier extension instance installed before a reload.
const globalStore = globalThis;
const compactions = globalStore[stateSymbol] ??= new WeakMap();
export function installCompactionInterruptionCapture(sessionClass) {
    const prototype = sessionClass.prototype;
    const original = prototype.compact;
    if (original[wrappedSymbol])
        return;
    const compact = async function (...args) {
        const manager = this.sessionManager;
        const compaction = compactions.get(manager) ?? { calls: 0, interrupted: false, abortPending: false };
        compactions.set(manager, compaction);
        compaction.calls += 1;
        // Overlapping calls share the record: a later idle call must not erase an earlier interruption.
        if (this.isStreaming)
            compaction.interrupted = compaction.abortPending = true;
        try {
            return await original.apply(this, args);
        }
        finally {
            if (--compaction.calls === 0)
                compactions.delete(manager);
        }
    };
    compact[wrappedSymbol] = true;
    prototype.compact = compact;
}
/** A manual compaction of this session is in progress, until compact() returns. */
export function compactionInProgress(sessionManager) {
    return compactions.has(sessionManager);
}
/** A manual compaction of this session that aborted an active run is in progress. */
export function compactionInterruptedRun(sessionManager) {
    return compactions.get(sessionManager)?.interrupted === true;
}
/** True once, for the aborted end of the run the compaction interrupted; a later run's abort is the user's. */
export function takeCompactionAbort(sessionManager) {
    const compaction = compactions.get(sessionManager);
    if (!compaction?.abortPending)
        return false;
    compaction.abortPending = false;
    return true;
}
