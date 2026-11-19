import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { discoverAgents, formatUnknownAgentError, unknownAgentDiagnosticContext } from "../agents/agents.js";
import { normalizeSkillInput } from "../agents/skills.js";
import { normalizeOutputOverride } from "../runs/shared/child-launch-plan.js";
import { CHAIN_RUNS_DIR } from "./types.js";
const CHAIN_DIR_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const INITIAL_PROGRESS_CONTENT = "# Progress\n\n## Status\nIn Progress\n\n## Tasks\n\n## Files Changed\n\n## Notes\n";
export { planChildLaunch, resolveStepBehavior, resolveTaskTextForFileUpdatePolicy, suppressProgressForReadOnlyTask, taskDisallowsFileUpdates, } from "../runs/shared/child-launch-plan.js";
export function isParallelStep(step) {
    return "parallel" in step && Array.isArray(step.parallel);
}
export function isDynamicParallelStep(step) {
    return "expand" in step && "collect" in step && "parallel" in step && !Array.isArray(step.parallel);
}
export function getStepAgents(step) {
    if (isParallelStep(step)) {
        return step.parallel.map((t) => t.agent);
    }
    if (isDynamicParallelStep(step)) {
        return [step.parallel.agent];
    }
    return [step.agent];
}
export function createChainDir(runId, baseDir) {
    const chainDir = path.join(baseDir ? path.resolve(baseDir) : CHAIN_RUNS_DIR, runId);
    fs.mkdirSync(chainDir, { recursive: true });
    return chainDir;
}
export function removeChainDir(chainDir) {
    try {
        fs.rmSync(chainDir, { recursive: true });
    }
    catch {
        // Chain cleanup is best-effort. Runs can already have cleaned their temp dir.
    }
}
export function cleanupOldChainDirs() {
    if (!fs.existsSync(CHAIN_RUNS_DIR))
        return;
    const now = Date.now();
    let dirs;
    try {
        dirs = fs.readdirSync(CHAIN_RUNS_DIR);
    }
    catch {
        // Startup cleanup is best-effort. If the scoped temp root is unreadable,
        // skip cleanup instead of failing extension startup.
        return;
    }
    for (const dir of dirs) {
        try {
            const dirPath = path.join(CHAIN_RUNS_DIR, dir);
            const stat = fs.statSync(dirPath);
            if (stat.isDirectory() && now - stat.mtimeMs > CHAIN_DIR_MAX_AGE_MS) {
                fs.rmSync(dirPath, { recursive: true });
            }
        }
        catch {
            // Skip directories that can't be processed; continue with others
        }
    }
}
export function resolveChainTemplates(steps) {
    return steps.map((step, i) => {
        if (isParallelStep(step)) {
            return step.parallel.map((task) => {
                if (task.task)
                    return task.task;
                return "{previous}";
            });
        }
        if (isDynamicParallelStep(step)) {
            return step.parallel.task ?? "{previous}";
        }
        const seq = step;
        if (seq.task)
            return seq.task;
        return i === 0 ? "{task}" : "{previous}";
    });
}
/**
 * Expand a leading `~`/`~/` to the user's home directory. Other forms (relative,
 * absolute, `~user/`) pass through unchanged.
 */
export function expandHomePath(filePath) {
    if (filePath === "~")
        return os.homedir();
    if (filePath.startsWith("~/"))
        return path.join(os.homedir(), filePath.slice(2));
    return filePath;
}
/**
 * Resolve a file path: `~`/`~/` expand to home first, then absolute paths pass
 * through and relative paths get chainDir prepended.
 */
export function resolveChainPath(filePath, chainDir) {
    const expanded = expandHomePath(filePath);
    return path.isAbsolute(expanded) ? expanded : path.join(chainDir, expanded);
}
export function resolveExistingReadInstructionPaths(reads, instructionCwd, existenceCwd = instructionCwd) {
    return reads.flatMap((filePath) => {
        const instructionPath = resolveChainPath(filePath, instructionCwd);
        const existencePath = resolveChainPath(filePath, existenceCwd);
        return fs.existsSync(existencePath) ? [instructionPath] : [];
    });
}
export function resolveExistingReadPaths(reads, cwd) {
    return resolveExistingReadInstructionPaths(reads, cwd);
}
export function writeInitialProgressFile(progressDir) {
    fs.mkdirSync(progressDir, { recursive: true });
    fs.writeFileSync(path.join(progressDir, "progress.md"), INITIAL_PROGRESS_CONTENT);
}
export function buildChainInstructions(behavior, chainDir, isFirstProgressAgent, previousSummary, readExistenceDir = chainDir) {
    const prefixParts = [];
    const suffixParts = [];
    // READS - prepend to override any hardcoded filenames in task text
    if (behavior.reads && behavior.reads.length > 0) {
        const files = resolveExistingReadInstructionPaths(behavior.reads, chainDir, readExistenceDir);
        if (files.length > 0)
            prefixParts.push(`[Read from: ${files.join(", ")}]`);
    }
    // OUTPUT - prepend so agent knows where to write
    if (behavior.output) {
        const outputPath = resolveChainPath(behavior.output, chainDir);
        prefixParts.push(`[Write to: ${outputPath}]`);
    }
    // Progress instructions in suffix (less critical)
    if (behavior.progress) {
        const progressPath = path.join(chainDir, "progress.md");
        if (isFirstProgressAgent) {
            suffixParts.push(`Create and maintain progress at: ${progressPath}`);
        }
        else {
            suffixParts.push(`Update progress at: ${progressPath}`);
        }
    }
    if (previousSummary && previousSummary.trim()) {
        suffixParts.push(`Previous step output:\n${previousSummary.trim()}`);
    }
    const prefix = prefixParts.length > 0
        ? prefixParts.join("\n") + "\n\n"
        : "";
    const suffix = suffixParts.length > 0
        ? "\n\n---\n" + suffixParts.join("\n")
        : "";
    return { prefix, suffix };
}
export function resolveParallelBehaviors(tasks, agentConfigs, stepIndex, chainSkills, diagnostics) {
    return tasks.map((task, taskIndex) => {
        const config = agentConfigs.find((a) => a.name === task.agent);
        if (!config) {
            if (!diagnostics)
                throw new Error("resolveParallelBehaviors requires unknown-agent diagnostic context or fallback discovery input.");
            const context = "directories" in diagnostics
                ? diagnostics
                : unknownAgentDiagnosticContext(discoverAgents(path.resolve(diagnostics.cwd), diagnostics.scope ?? "both"));
            throw new Error(formatUnknownAgentError(task.agent, context));
        }
        const subdir = path.join(`parallel-${stepIndex}`, `${taskIndex}-${task.agent}`);
        // Output: task override > agent default (namespaced) > false
        // Absolute paths pass through unchanged; relative paths get namespaced under subdir
        let output = false;
        const taskOutput = normalizeOutputOverride(task.output);
        const configOutput = normalizeOutputOverride(config.output);
        if (taskOutput !== undefined) {
            if (taskOutput === false) {
                output = false;
            }
            else if (path.isAbsolute(taskOutput)) {
                output = taskOutput;
            }
            else {
                output = path.join(subdir, taskOutput);
            }
        }
        else if (configOutput) {
            // Agent defaults are always relative, so namespace them
            output = path.join(subdir, configOutput);
        }
        const reads = task.reads !== undefined ? task.reads : config.defaultReads ?? false;
        const progress = task.progress !== undefined
            ? task.progress
            : config.defaultProgress ?? false;
        const taskSkillInput = normalizeSkillInput(task.skill);
        let skills;
        if (taskSkillInput === false) {
            skills = false;
        }
        else if (taskSkillInput !== undefined) {
            skills = [...taskSkillInput];
            if (chainSkills && chainSkills.length > 0) {
                skills = [...new Set([...skills, ...chainSkills])];
            }
        }
        else {
            skills = config.skills ? [...config.skills] : [];
            if (chainSkills && chainSkills.length > 0) {
                skills = [...new Set([...skills, ...chainSkills])];
            }
        }
        const outputMode = task.outputMode ?? config.outputMode ?? "inline";
        const model = task.model ?? config.model;
        return { output, outputMode, reads, progress, skills, model };
    });
}
export function createParallelDirs(chainDir, stepIndex, taskCount, agentNames) {
    for (let i = 0; i < taskCount; i++) {
        const subdir = path.join(chainDir, `parallel-${stepIndex}`, `${i}-${agentNames[i]}`);
        fs.mkdirSync(subdir, { recursive: true });
    }
}
export { aggregateParallelOutputs } from "../runs/shared/parallel-utils.js";
