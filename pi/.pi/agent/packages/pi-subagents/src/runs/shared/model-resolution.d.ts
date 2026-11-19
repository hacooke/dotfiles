import { splitKnownThinkingSuffix as splitThinkingSuffix, type ModelInfo as AvailableModelInfo } from "../../shared/model-info.ts";
import { type ModelScopeCheckRule, type ModelScopeViolation, type ModelSource } from "./model-scope.ts";
export type { AvailableModelInfo };
export interface ModelSelectionEvidence {
    model?: string;
    requestedModel?: string;
}
export { splitThinkingSuffix };
/**
 * Aliases apply only to the resolved launch candidate (without its thinking suffix) and the exact raw response ID.
 * When the child's live selection is a Pi virtual model, assistant messages name the physical model it dispatched
 * to, so the virtual selection's provider/id is compared exactly with the launch candidate instead.
 */
export declare function formatSubagentModelVerificationError(expectedModel: string, observedModel: string, availableModels: AvailableModelInfo[] | undefined, modelResponseAliases?: Record<string, string[]>, observedVirtualModel?: string): string | undefined;
export declare const INHERIT_MODEL = "inherit";
/** Minimal shape of the parent session's in-memory model (`ctx.model`). */
export interface ParentModel {
    provider: string;
    id: string;
}
export declare function normalizeParentModel(model: unknown): ParentModel | undefined;
/**
 * Provider/id ids of the host session's scoped-model snapshot (`ctx.scopedModels`).
 * Pi reports an empty set when the session is unscoped (nothing configured, or no
 * pattern matched), and then allows every model; `scoped` narrows that to `inherit`.
 */
export declare function scopedModelIdsFromContext(ctx: {
    scopedModels?: ReadonlyArray<{
        model?: unknown;
    }>;
}): string[];
/**
 * Normalize a model id or provider segment for fuzzy comparison: case-fold,
 * treat dots/underscores as dashes (so `4.5` matches `4-5`), and collapse
 * repeated separators.
 */
export declare function normalizeModelSegment(segment: string): string;
/**
 * Every provider in Pi's full catalog, signed in or not, read only when a query's prefix is not an available
 * provider. Without it, a query naming a provider the user is not signed in to would be read as an `owner/name` id
 * and could match that id under another provider (OpenRouter's `anthropic/...` copies), running and billing a
 * different account.
 */
export type KnownProviders = () => readonly string[];
/** {@link KnownProviders} for one launch; the full catalog is copied at most once. */
export declare function knownModelProviders(registry: {
    getAll(): ReadonlyArray<{
        provider: string;
    }>;
}): KnownProviders;
/**
 * Fuzzy-resolve a base model id (thinking suffix already stripped) against the
 * registry, tolerating separator, case, and optional date-stamp differences so
 * users do not have to spell provider/model exactly. A slash is a provider
 * prefix only when that prefix is a known provider; otherwise the whole
 * string is the model id (Hugging Face `owner/name`). A qualified provider
 * query only matches within the named provider — this never silently switches
 * providers for security/cost-sensitive configs. Returns the matched `fullId`,
 * or `undefined` when there is no match or the match is ambiguous across
 * providers (and no `preferredProvider` disambiguates).
 */
export declare function fuzzyResolveModel(baseModel: string, availableModels: AvailableModelInfo[], preferredProvider?: string, knownProviders?: KnownProviders): string | undefined;
/**
 * Resolve a possibly-loose model id to a canonical `provider/id` (plus any
 * thinking suffix). Exact registry matches win; fuzzy normalization
 * (separator/case/date-stamp via {@link fuzzyResolveModel}) is a fallback so
 * spelling differences still resolve. Never switches providers for a qualified
 * query.
 */
export declare function resolveModelCandidate(model: string | undefined, availableModels: AvailableModelInfo[] | undefined, preferredProvider?: string, knownProviders?: KnownProviders): string | undefined;
/** A configured pin that launch refuses because the registry cannot resolve it. An empty registry checks nothing. */
export declare function isUnavailableSubagentModel(model: string | undefined, availableModels: AvailableModelInfo[] | undefined, preferredProvider?: string, knownProviders?: KnownProviders): boolean;
export interface ResolveSubagentModelOverrideOptions {
    /** When set with `enforce: true`, out-of-scope models are rejected. */
    scope?: ModelScopeCheckRule | ModelScopeCheckRule[];
    /** Origin of the requested model: explicit caller-supplied (hard error) vs inherited (warn). Defaults to `"inherited"`. */
    source?: ModelSource;
    /** Called for warn-severity violations instead of `console.warn`. */
    onWarn?: (violation: ModelScopeViolation) => void;
    knownProviders?: KnownProviders;
}
/**
 * Resolve the `--model` override passed to a spawned subagent.
 *
 * When no model is requested (`undefined`, `false`, empty, or the `"inherit"`
 * sentinel), the child must inherit the parent session's *in-memory* model
 * (`provider/id`) instead of being left to resolve its own model. Without an
 * explicit `provider/id`, the child falls back to the global
 * `~/.pi/agent/settings.json` default, which is shared across every open PI
 * session — so a different session that last changed its model in the TUI would
 * silently contaminate this session's subagents (see issue #266). Passing an
 * explicit `provider/id` keeps each session's children isolated to that
 * session's model.
 *
 * An explicitly requested model string is resolved via {@link resolveModelCandidate}.
 * When `options.scope.enforce` is on, an out-of-scope resolved model throws for
 * an explicit (`source: "explicit"`) request and warns for an inherited one,
 * unless strict scope enforcement makes inherited violations hard errors.
 */
export declare function resolveSubagentModelOverride(requestedModel: string | boolean | undefined, parentModel: ParentModel | undefined, availableModels: AvailableModelInfo[] | undefined, preferredProvider?: string, options?: ResolveSubagentModelOverrideOptions): string | undefined;
export declare function resolveEffectiveSubagentModel(explicitModel: string | boolean | undefined, agentModel: string | boolean | undefined, parentModel: ParentModel | undefined, availableModels: AvailableModelInfo[] | undefined, preferredProvider?: string, options?: ResolveSubagentModelOverrideOptions): string | undefined;
export type ModelOrigin = ModelSource | "configured";
export interface ResolveModelSelectionOptions {
    scope?: ModelScopeCheckRule | ModelScopeCheckRule[];
    onWarn?: (violation: ModelScopeViolation) => void;
    /** The primary model came from the running parent session, not configuration. */
    primaryModelFromParent?: boolean;
    origin?: ModelOrigin;
    knownProviders?: KnownProviders;
}
export declare function resolveModelOrigin(input: {
    explicitModel?: string | boolean;
    agentModel?: string | boolean;
    parentModel?: ParentModel;
    fromParent?: boolean;
    storedOrigin?: ModelOrigin;
}): ModelOrigin;
export declare function inheritsParentModel(explicitModel: string | boolean | undefined, agentModel: string | boolean | undefined, parentModel: ParentModel | undefined): boolean;
export declare function resolveModelSelection(model: string | undefined, availableModels: AvailableModelInfo[] | undefined, preferredProvider?: string, options?: ResolveModelSelectionOptions): ModelSelectionEvidence;
/** Separates an error from the reply text appended to it; classification reads only the part before it. */
export declare const ERROR_REPLY_TEXT_SEPARATOR = "\nReply text: ";
/** The part of a child error that a classifier may read: everything before any appended reply text. */
export declare function errorWithoutReplyText(error: string | undefined): string | undefined;
export declare function isContextOverflow(fullError: string | undefined): boolean;
