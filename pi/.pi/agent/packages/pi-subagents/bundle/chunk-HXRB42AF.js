// src/shared/session-succession.ts
var SUCCESSION_KEY = /* @__PURE__ */ Symbol.for("pi-subagents.session-succession");
var MAX_INHERITED_SESSIONS = 8;
var MAX_RECORDED_SESSIONS = 64;
var KEPT_WORK_KEY = /* @__PURE__ */ Symbol.for("pi-subagents.sessions-keeping-work");
function successions() {
  const runtime = globalThis;
  runtime[SUCCESSION_KEY] ??= /* @__PURE__ */ new Map();
  return runtime[SUCCESSION_KEY];
}
function keptWork() {
  const runtime = globalThis;
  runtime[KEPT_WORK_KEY] ??= /* @__PURE__ */ new Set();
  return runtime[KEPT_WORK_KEY];
}
function keepSessionWork(sessionId) {
  keptWork().delete(sessionId);
  keptWork().add(sessionId);
  while (keptWork().size > MAX_RECORDED_SESSIONS) keptWork().delete(keptWork().values().next().value);
}
function releaseSessionWork(sessionId) {
  keptWork().delete(sessionId);
}
function recordSessionReplacement(sessionId, previousSessionId) {
  const inherited = keptWork().has(previousSessionId) ? [] : [previousSessionId, ...successions().get(previousSessionId) ?? []];
  const own = keptWork().has(sessionId) ? successions().get(sessionId) ?? [] : [];
  const chain = [.../* @__PURE__ */ new Set([...inherited, ...own])].filter((id) => id !== sessionId);
  successions().delete(sessionId);
  successions().set(sessionId, chain.slice(0, MAX_INHERITED_SESSIONS));
  while (successions().size > MAX_RECORDED_SESSIONS) successions().delete(successions().keys().next().value);
}
function recordSessionStart(sessionId, startup) {
  if (startup) {
    successions().delete(sessionId);
    keptWork().delete(sessionId);
  }
  for (const [id, chain] of successions()) {
    if (chain.includes(sessionId)) successions().set(id, chain.filter((inherited) => inherited !== sessionId));
  }
}
function inheritedSessionIds(sessionId) {
  return successions().get(sessionId) ?? [];
}

// src/shared/extension-context.ts
var MODEL_ONLY_TOOL = { exposure: "model-only" };
function isStaleExtensionContextError(error) {
  return error instanceof Error && /extension ctx is stale|extension context no longer active|stale after session replacement or reload/i.test(error.message);
}
function canRenderComponents(ctx) {
  return ctx.mode === "tui" || process.env.PI_SUBAGENTS_COMPONENT_UI === "1";
}
function isUnboundExtensionRuntimeError(error) {
  return error instanceof Error && /extension runtime not initialized/i.test(error.message);
}
function withCachedUiContext(ctx, onStale, run) {
  if (!ctx) return void 0;
  try {
    if (!ctx.hasUI) return void 0;
    return run(ctx);
  } catch (error) {
    if (!isStaleExtensionContextError(error)) throw error;
    onStale();
    return void 0;
  }
}

// src/shared/session-warnings.ts
var reportedWarnings = /* @__PURE__ */ new WeakMap();
function reportSessionWarning(state, message, key = message) {
  let reported = reportedWarnings.get(state);
  if (!reported) reportedWarnings.set(state, reported = /* @__PURE__ */ new Set());
  if (reported.has(key)) return;
  reported.add(key);
  const text = `[pi-subagents] ${message}`;
  const cached = state.lastUiContext;
  const notified = withCachedUiContext(cached, () => {
    if (state.lastUiContext === cached) state.lastUiContext = null;
  }, (ctx) => {
    ctx.ui.notify(text, "warning");
    return true;
  });
  if (!notified) console.warn(text);
}

// src/runs/shared/run-ownership.ts
function ownerSessionIds(sessionId) {
  return /* @__PURE__ */ new Set([sessionId, ...inheritedSessionIds(sessionId)]);
}
function ownsRun(currentSessionId, runSessionId) {
  return currentSessionId ? ownerSessionIds(currentSessionId).has(runSessionId) : false;
}

export {
  keepSessionWork,
  releaseSessionWork,
  recordSessionReplacement,
  recordSessionStart,
  inheritedSessionIds,
  ownerSessionIds,
  ownsRun,
  MODEL_ONLY_TOOL,
  isStaleExtensionContextError,
  canRenderComponents,
  isUnboundExtensionRuntimeError,
  withCachedUiContext,
  reportSessionWarning
};
