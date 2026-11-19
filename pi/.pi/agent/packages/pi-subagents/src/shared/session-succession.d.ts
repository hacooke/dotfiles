/**
 * The operator switched away from sessionId and chose to leave its work there: its successor inherits nothing, and
 * sessionId keeps its own chain when it is reopened. The mark lasts until sessionId shuts down again without it,
 * so a repeated start of the same replacement (RPC rebind) sees it too.
 */
export declare function keepSessionWork(sessionId: string): void;
/** sessionId shut down without leaving its work there, so whoever replaces it next inherits as usual. */
export declare function releaseSessionWork(sessionId: string): void;
/** Records that sessionId replaced previousSessionId in this process, inheriting its chain unless its work was kept there. */
export declare function recordSessionReplacement(sessionId: string, previousSessionId: string): void;
/**
 * A session starting in this process is live again, so no other session inherits its runs any more.
 * pi-web keeps a forked-from session listed and can reopen it while its fork is still live.
 * A startup replaces no session, so the session also drops what it inherited before: whoever
 * replaced it took those runs over and keeps them.
 */
export declare function recordSessionStart(sessionId: string, startup: boolean): void;
/** Sessions this process replaced on the way to sessionId, newest first; their runs belong to sessionId. */
export declare function inheritedSessionIds(sessionId: string): readonly string[];
