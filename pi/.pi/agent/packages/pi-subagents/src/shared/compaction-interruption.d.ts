export declare function installCompactionInterruptionCapture(sessionClass: {
    prototype: object;
}): void;
/** A manual compaction of this session is in progress, until compact() returns. */
export declare function compactionInProgress(sessionManager: object): boolean;
/** A manual compaction of this session that aborted an active run is in progress. */
export declare function compactionInterruptedRun(sessionManager: object): boolean;
/** True once, for the aborted end of the run the compaction interrupted; a later run's abort is the user's. */
export declare function takeCompactionAbort(sessionManager: object): boolean;
