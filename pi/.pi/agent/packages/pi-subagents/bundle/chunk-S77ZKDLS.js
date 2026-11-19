import {
  createAtomicJsonWriter,
  getAgentDir,
  readStatus
} from "./chunk-GHJ6BH5U.js";
import {
  DIRS,
  TEMP_ARTIFACTS_DIR,
  TEMP_ROOT_DIR
} from "./chunk-JEZOSEWG.js";

// src/shared/artifacts.ts
import * as fs2 from "node:fs";
import * as path2 from "node:path";

// src/runs/shared/session-lease.ts
import { createHash, randomUUID } from "node:crypto";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
var SESSION_LEASES_DIR = path.join(TEMP_ROOT_DIR, "session-leases");
var SessionLeaseConflictError = class extends Error {
  owner;
  constructor(message, owner) {
    super(message);
    this.name = "SessionLeaseConflictError";
    this.owner = owner;
  }
};
function getProcessStartIdentity(pid) {
  if (process.platform === "linux") {
    try {
      const stat = fs.readFileSync(`/proc/${pid}/stat`, "utf-8");
      const commandEnd = stat.lastIndexOf(")");
      if (commandEnd === -1) return void 0;
      const fields = stat.slice(commandEnd + 1).trim().split(/\s+/);
      const startTicks = fields[19];
      return startTicks ? `linux:${startTicks}` : void 0;
    } catch {
      return void 0;
    }
  }
  return void 0;
}
function processIsAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    const code = error.code;
    if (code === "ESRCH") return false;
    if (code === "EPERM") return true;
    return void 0;
  }
}
function canonicalSessionFilePath(sessionFile) {
  return fs.realpathSync.native(path.resolve(sessionFile));
}
function canonicalSessionId(sessionFile) {
  const canonical = canonicalSessionFilePath(sessionFile);
  const key = process.platform === "win32" ? canonical.toLowerCase() : canonical;
  return createHash("sha256").update(key).digest("hex");
}
function sessionLeaseDir(sessionFile, rootDir = SESSION_LEASES_DIR) {
  return path.join(rootDir, canonicalSessionId(sessionFile));
}
function inspectSessionLease(sessionFile, rootDir = SESSION_LEASES_DIR) {
  const canonicalSessionFile = canonicalSessionFilePath(sessionFile);
  const canonicalSessionIdValue = canonicalSessionId(canonicalSessionFile);
  const leaseDir = path.join(rootDir, canonicalSessionIdValue);
  if (!fs.existsSync(leaseDir)) return { state: "free", canonicalSessionFile, canonicalSessionId: canonicalSessionIdValue };
  const owner = readLeaseOwner(leaseDir);
  return owner ? { state: "owned", canonicalSessionFile, canonicalSessionId: canonicalSessionIdValue, owner } : { state: "unreadable", canonicalSessionFile, canonicalSessionId: canonicalSessionIdValue };
}
function parseOwner(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const owner = value;
  if (owner.version !== 1 || typeof owner.token !== "string" || typeof owner.canonicalSessionFile !== "string" || typeof owner.runId !== "string" || typeof owner.sourceRunId !== "string" || typeof owner.pid !== "number" || !Number.isInteger(owner.pid) || owner.pid <= 0 || typeof owner.hostname !== "string" || owner.writerState !== "none" && owner.writerState !== "spawning" && owner.writerState !== "running" || typeof owner.acquiredAt !== "string" || typeof owner.acquiredAtMs !== "number" || typeof owner.updatedAtMs !== "number") return void 0;
  if (owner.parentSessionId !== void 0 && typeof owner.parentSessionId !== "string") return void 0;
  if (owner.processStartIdentity !== void 0 && typeof owner.processStartIdentity !== "string") return void 0;
  if (owner.writerPid !== void 0 && (typeof owner.writerPid !== "number" || !Number.isInteger(owner.writerPid) || owner.writerPid <= 0)) return void 0;
  if (owner.writerProcessStartIdentity !== void 0 && typeof owner.writerProcessStartIdentity !== "string") return void 0;
  if (owner.writerState === "running" && owner.writerPid === void 0) return void 0;
  if (owner.writerState !== "running" && (owner.writerPid !== void 0 || owner.writerProcessStartIdentity !== void 0)) return void 0;
  return owner;
}
function readLeaseOwner(leaseDir) {
  try {
    return parseOwner(JSON.parse(fs.readFileSync(path.join(leaseDir, "owner.json"), "utf-8")));
  } catch {
    return void 0;
  }
}
function conflictMessage(canonicalSessionFile, owner) {
  if (!owner) {
    return `Direct revival of session '${canonicalSessionFile}' is blocked by an existing lease with unreadable owner metadata. Refusing to reclaim it without proof that the owner is stale.`;
  }
  const parent = owner.parentSessionId ? `, parent session '${owner.parentSessionId}'` : "";
  return `Direct revival of session '${canonicalSessionFile}' is already owned by run '${owner.runId}' (source run '${owner.sourceRunId}'${parent}, pid ${owner.pid} on ${owner.hostname}). Wait for that revival to finish or start a separate continuation without reusing this session file.`;
}
function processDemonstrablyGone(pid, startIdentity, options) {
  const alive = options.isProcessAlive(pid);
  if (alive === false) return true;
  if (alive !== true || !startIdentity) return false;
  const currentIdentity = options.getProcessStartIdentity(pid);
  return currentIdentity !== void 0 && currentIdentity !== startIdentity;
}
function demonstrablyStale(owner, options) {
  if (owner.hostname !== options.hostname) return false;
  if (!processDemonstrablyGone(owner.pid, owner.processStartIdentity, options)) return false;
  if (owner.writerState === "spawning") return false;
  if (owner.writerState === "none") return true;
  return owner.writerPid !== void 0 && processDemonstrablyGone(owner.writerPid, owner.writerProcessStartIdentity, options);
}
function createLeaseDirectory(leaseDir, owner) {
  const tempDir = `${leaseDir}.candidate-${owner.token}`;
  fs.mkdirSync(path.dirname(leaseDir), { recursive: true, mode: 448 });
  fs.rmSync(tempDir, { recursive: true, force: true });
  fs.mkdirSync(tempDir, { mode: 448 });
  try {
    fs.writeFileSync(path.join(tempDir, "owner.json"), JSON.stringify(owner, null, 2), { encoding: "utf-8", mode: 384 });
    try {
      fs.renameSync(tempDir, leaseDir);
      return true;
    } catch (error) {
      if (fs.existsSync(leaseDir)) return false;
      throw error;
    }
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}
function acquireSessionLease(request, options = {}) {
  const canonicalSessionFile = canonicalSessionFilePath(request.sessionFile);
  const rootDir = options.rootDir ?? SESSION_LEASES_DIR;
  const leaseDir = sessionLeaseDir(canonicalSessionFile, rootDir);
  const now = options.now ?? Date.now;
  const pid = options.pid ?? process.pid;
  const hostname2 = options.hostname ?? os.hostname();
  const getIdentity = options.getProcessStartIdentity ?? getProcessStartIdentity;
  const processStartIdentity = options.processStartIdentity ?? getIdentity(pid) ?? (pid === process.pid ? `runtime:${Math.round(Date.now() - process.uptime() * 1e3)}` : void 0);
  const acquiredAtMs = now();
  const owner = {
    version: 1,
    token: options.token?.() ?? randomUUID(),
    canonicalSessionFile,
    runId: request.runId,
    sourceRunId: request.sourceRunId,
    ...request.parentSessionId ? { parentSessionId: request.parentSessionId } : {},
    pid,
    hostname: hostname2,
    ...processStartIdentity ? { processStartIdentity } : {},
    writerState: "none",
    acquiredAt: new Date(acquiredAtMs).toISOString(),
    acquiredAtMs,
    updatedAtMs: acquiredAtMs
  };
  const staleOptions = {
    hostname: hostname2,
    isProcessAlive: options.isProcessAlive ?? processIsAlive,
    getProcessStartIdentity: getIdentity
  };
  for (let attempt = 0; attempt < 4; attempt++) {
    if (createLeaseDirectory(leaseDir, owner)) {
      const writeOwner = createAtomicJsonWriter();
      return {
        leaseDir,
        owner,
        updateWriter(writer) {
          const currentOwner = readLeaseOwner(leaseDir);
          if (!currentOwner || currentOwner.token !== owner.token) {
            throw new Error(`Session revival lease ownership changed for run '${owner.runId}'.`);
          }
          const writerProcessStartIdentity = writer.state === "running" ? getIdentity(writer.pid) : void 0;
          const nextOwner = {
            ...owner,
            writerState: writer.state,
            ...writer.state === "running" ? { writerPid: writer.pid } : {},
            ...writerProcessStartIdentity ? { writerProcessStartIdentity } : {},
            updatedAtMs: now()
          };
          delete nextOwner.writerPid;
          delete nextOwner.writerProcessStartIdentity;
          if (writer.state === "running") {
            nextOwner.writerPid = writer.pid;
            if (writerProcessStartIdentity) nextOwner.writerProcessStartIdentity = writerProcessStartIdentity;
          }
          writeOwner(path.join(leaseDir, "owner.json"), nextOwner);
          delete owner.writerPid;
          delete owner.writerProcessStartIdentity;
          Object.assign(owner, nextOwner);
        },
        release() {
          const currentOwner = readLeaseOwner(leaseDir);
          if (!currentOwner || currentOwner.token !== owner.token) return false;
          fs.rmSync(leaseDir, { recursive: true, force: true });
          return !fs.existsSync(leaseDir);
        }
      };
    }
    const existingOwner2 = readLeaseOwner(leaseDir);
    if (!existingOwner2 || !demonstrablyStale(existingOwner2, staleOptions)) {
      throw new SessionLeaseConflictError(conflictMessage(canonicalSessionFile, existingOwner2), existingOwner2);
    }
    const tombstone = `${leaseDir}.stale-${existingOwner2.token.replace(/[^A-Za-z0-9._-]/g, "-")}`;
    try {
      fs.renameSync(leaseDir, tombstone);
    } catch (error) {
      const code = error.code;
      if (code === "ENOENT" || fs.existsSync(tombstone)) continue;
      throw error;
    }
  }
  const existingOwner = readLeaseOwner(leaseDir);
  throw new SessionLeaseConflictError(conflictMessage(canonicalSessionFile, existingOwner), existingOwner);
}

// src/shared/artifacts.ts
var CLEANUP_MARKER_FILE = ".last-cleanup";
var FORK_CLEANUP_MARKER_FILE = ".pi-subagents-fork-cleanup";
var DAY_MS = 24 * 60 * 60 * 1e3;
var RETAINED_ARTIFACT_DIRS = /* @__PURE__ */ new Set(["handoffs", "worktree-diffs"]);
var PROJECT_SUBAGENTS_RELATIVE_DIR = ".pi/subagents";
var PROJECT_ARTIFACT_PATHS = [
  `${PROJECT_SUBAGENTS_RELATIVE_DIR}/artifacts/output.md`,
  `${PROJECT_SUBAGENTS_RELATIVE_DIR}/artifacts/run_worker_input.md`,
  `${PROJECT_SUBAGENTS_RELATIVE_DIR}/artifacts/run_worker_output.md`,
  `${PROJECT_SUBAGENTS_RELATIVE_DIR}/artifacts/run_worker.jsonl`,
  `${PROJECT_SUBAGENTS_RELATIVE_DIR}/artifacts/run_worker_transcript.jsonl`,
  `${PROJECT_SUBAGENTS_RELATIVE_DIR}/artifacts/run_worker_meta.json`,
  `${PROJECT_SUBAGENTS_RELATIVE_DIR}/artifacts/progress/run/progress.md`,
  `${PROJECT_SUBAGENTS_RELATIVE_DIR}/artifacts/outputs/output.md`,
  `${PROJECT_SUBAGENTS_RELATIVE_DIR}/artifacts/outputs/run/output.md`,
  `${PROJECT_SUBAGENTS_RELATIVE_DIR}/chain-runs/run.json`
];
function globMatchesPath(pattern, filePath) {
  let expression = "^";
  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern[index];
    if (character === void 0) break;
    if (character === "*" && pattern[index + 1] === "*") {
      index += 1;
      if (pattern[index + 1] === "/") {
        index += 1;
        expression += "(?:.*/)?";
      } else {
        expression += ".*";
      }
    } else if (character === "*") {
      expression += "[^/]*";
    } else if (character === "?") {
      expression += "[^/]";
    } else if (character === "[") {
      const end = pattern.indexOf("]", index + 1);
      if (end === -1) expression += "\\[";
      else {
        expression += pattern.slice(index, end + 1);
        index = end;
      }
    } else {
      expression += character.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
    }
  }
  try {
    return new RegExp(`${expression}$`).test(filePath);
  } catch {
    return false;
  }
}
function normalizePattern(pattern) {
  return pattern.replace(/^\.\//, "").replace(/^\//, "").replace(/\/+$/, "");
}
function patternMatchesArtifactPath(pattern, artifactPath) {
  const normalized = normalizePattern(pattern);
  return normalized === PROJECT_SUBAGENTS_RELATIVE_DIR || normalized === "*" || artifactPath.startsWith(`${normalized}/`) || globMatchesPath(normalized, artifactPath);
}
function ignoreFileExcludesProjectArtifacts(filePath) {
  if (!fs2.existsSync(filePath)) return false;
  try {
    const excluded = /* @__PURE__ */ new Set();
    for (const rawLine of fs2.readFileSync(filePath, "utf-8").split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const negated = line.startsWith("!");
      const pattern = negated ? line.slice(1) : line;
      for (const artifactPath of PROJECT_ARTIFACT_PATHS) {
        if (!patternMatchesArtifactPath(pattern, artifactPath)) continue;
        if (negated) excluded.delete(artifactPath);
        else excluded.add(artifactPath);
      }
    }
    return excluded.size === PROJECT_ARTIFACT_PATHS.length;
  } catch {
    return false;
  }
}
function filesIncludeProjectArtifacts(files) {
  if (!Array.isArray(files)) return void 0;
  const included = /* @__PURE__ */ new Set();
  for (const entry of files) {
    if (typeof entry !== "string") continue;
    const negated = entry.startsWith("!");
    const pattern = negated ? entry.slice(1) : entry;
    for (const artifactPath of PROJECT_ARTIFACT_PATHS) {
      if (!patternMatchesArtifactPath(pattern, artifactPath)) continue;
      if (negated) included.delete(artifactPath);
      else included.add(artifactPath);
    }
  }
  return included.size > 0;
}
function getProjectArtifactPackagingWarning(cwd) {
  const packagePath = path2.join(cwd, "package.json");
  if (!fs2.existsSync(packagePath)) return void 0;
  let packageJson;
  try {
    const parsed = JSON.parse(fs2.readFileSync(packagePath, "utf-8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return void 0;
    packageJson = parsed;
  } catch {
    return void 0;
  }
  const filesIncludeArtifacts = filesIncludeProjectArtifacts(packageJson.files);
  if (filesIncludeArtifacts === false) return void 0;
  const npmIgnorePath = path2.join(cwd, ".npmignore");
  const ignorePath = fs2.existsSync(npmIgnorePath) ? npmIgnorePath : path2.join(cwd, ".gitignore");
  if (filesIncludeArtifacts === void 0 && ignoreFileExcludesProjectArtifacts(ignorePath)) return void 0;
  return "Project-scoped subagent artifacts can be included when this package is published. Add '.pi/subagents/' to .npmignore, restrict package.json files, or set artifactDir to 'session' or 'temp'.";
}
function getProjectSubagentsDir(cwd) {
  return path2.join(cwd, PROJECT_SUBAGENTS_RELATIVE_DIR);
}
function getProjectArtifactsDir(cwd) {
  return path2.join(getProjectSubagentsDir(cwd), "artifacts");
}
function getArtifactsDir(sessionFile, projectCwd, dirPreference = "session") {
  switch (dirPreference) {
    case "session":
      if (sessionFile) {
        const sessionDir = path2.dirname(sessionFile);
        return path2.join(sessionDir, "subagent-artifacts");
      }
      return TEMP_ARTIFACTS_DIR;
    case "temp":
      return TEMP_ARTIFACTS_DIR;
    case "project":
      if (projectCwd) return getProjectArtifactsDir(projectCwd);
      if (sessionFile) {
        const sessionDir = path2.dirname(sessionFile);
        return path2.join(sessionDir, "subagent-artifacts");
      }
      return TEMP_ARTIFACTS_DIR;
    default:
      throw new Error(`Unsupported artifactDir ${JSON.stringify(dirPreference)}; expected "project", "session", or "temp".`);
  }
}
function getArtifactPaths(artifactsDir, runId, agent, index) {
  const suffix = index !== void 0 ? `_${index}` : "";
  const safeAgent = agent.replace(/[^\w.-]/g, "_");
  const base = `${runId}_${safeAgent}${suffix}`;
  return {
    inputPath: path2.join(artifactsDir, `${base}_input.md`),
    outputPath: path2.join(artifactsDir, `${base}_output.md`),
    jsonlPath: path2.join(artifactsDir, `${base}.jsonl`),
    transcriptPath: path2.join(artifactsDir, `${base}_transcript.jsonl`),
    metadataPath: path2.join(artifactsDir, `${base}_meta.json`)
  };
}
function ensureArtifactsDir(dir) {
  fs2.mkdirSync(dir, { recursive: true });
}
function writeArtifact(filePath, content) {
  fs2.mkdirSync(path2.dirname(filePath), { recursive: true });
  fs2.writeFileSync(filePath, content, "utf-8");
}
function formatOutputArtifactContent(input) {
  if (input.output.trim() || !input.error) return input.output;
  const lines = ["Subagent run failed before producing output.", "", "Error:", input.error];
  if (input.transcriptPath) lines.push("", `Transcript: ${input.transcriptPath}`);
  if (input.metadataPath) lines.push(`Metadata: ${input.metadataPath}`);
  return lines.join("\n");
}
function writeMetadata(filePath, metadata) {
  fs2.mkdirSync(path2.dirname(filePath), { recursive: true });
  fs2.writeFileSync(filePath, JSON.stringify(metadata, null, 2), "utf-8");
}
function appendJsonl(filePath, line) {
  fs2.appendFileSync(filePath, `${line}
`);
}
function cleanupOldArtifacts(dir, maxAgeDays) {
  if (maxAgeDays <= 0 || !fs2.existsSync(dir)) return;
  const markerPath = path2.join(dir, CLEANUP_MARKER_FILE);
  const now = Date.now();
  if (ranWithinDay(markerPath, now)) return;
  const cutoff = now - maxAgeDays * DAY_MS;
  for (const entry of fs2.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === CLEANUP_MARKER_FILE || entry.isDirectory() && RETAINED_ARTIFACT_DIRS.has(entry.name)) continue;
    removeOldEntry(path2.join(dir, entry.name), cutoff);
  }
  fs2.writeFileSync(markerPath, String(now));
}
function removeOldEntry(entryPath, cutoff) {
  try {
    const stat = fs2.lstatSync(entryPath);
    const old = stat.mtimeMs < cutoff;
    if (!stat.isDirectory()) {
      if (old) fs2.unlinkSync(entryPath);
      return;
    }
    for (const name of fs2.readdirSync(entryPath)) removeOldEntry(path2.join(entryPath, name), cutoff);
    if (old && fs2.readdirSync(entryPath).length === 0) fs2.rmdirSync(entryPath);
  } catch {
  }
}
function cleanupAllArtifactDirs(maxAgeDays) {
  cleanupOldArtifacts(TEMP_ARTIFACTS_DIR, maxAgeDays);
  const sessionsBase = path2.join(getAgentDir(), "sessions");
  if (!fs2.existsSync(sessionsBase)) return;
  let dirs;
  try {
    dirs = fs2.readdirSync(sessionsBase);
  } catch {
    return;
  }
  const forkMarkerPath = path2.join(sessionsBase, FORK_CLEANUP_MARKER_FILE);
  const now = Date.now();
  const pruneForks = maxAgeDays > 0 && !ranWithinDay(forkMarkerPath, now);
  for (const dir of dirs) {
    const artifactsDir = path2.join(sessionsBase, dir, "subagent-artifacts");
    try {
      cleanupOldArtifacts(artifactsDir, maxAgeDays);
    } catch {
    }
    if (pruneForks) removeOldForkCopies(path2.join(sessionsBase, dir), now - maxAgeDays * DAY_MS);
  }
  if (!pruneForks) return;
  try {
    fs2.writeFileSync(forkMarkerPath, String(now));
  } catch {
  }
}
function ranWithinDay(markerPath, now) {
  try {
    return now - fs2.statSync(markerPath).mtimeMs < DAY_MS;
  } catch {
    return false;
  }
}
function removeOldForkCopies(projectDir, cutoff) {
  let sessions;
  try {
    sessions = fs2.readdirSync(projectDir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const session of sessions) {
    if (!session.isDirectory()) continue;
    const forksDir = path2.join(projectDir, session.name, "forks");
    let runIds;
    try {
      if (!fs2.lstatSync(forksDir).isDirectory()) continue;
      runIds = fs2.readdirSync(forksDir);
    } catch {
      continue;
    }
    for (const runId of runIds) {
      const runDir = path2.join(forksDir, runId);
      const leases = [];
      try {
        const sessionFiles = idleSessionFiles(runDir, cutoff);
        if (!sessionFiles || asyncRunActive(runId)) continue;
        for (const file of sessionFiles) leases.push(acquireSessionLease({ sessionFile: file, runId: "fork-cleanup", sourceRunId: runId }));
        fs2.rmSync(runDir, { recursive: true, force: true });
      } catch {
      } finally {
        for (const lease of leases) lease.release();
      }
    }
  }
}
function idleSessionFiles(entryPath, cutoff, files = []) {
  const stat = fs2.lstatSync(entryPath);
  if (stat.mtimeMs >= cutoff) return void 0;
  if (!stat.isDirectory()) {
    if (stat.isFile() && entryPath.endsWith(".jsonl")) files.push(entryPath);
    return files;
  }
  for (const name of fs2.readdirSync(entryPath)) {
    if (!idleSessionFiles(path2.join(entryPath, name), cutoff, files)) return void 0;
  }
  return files;
}
function asyncRunActive(runId) {
  try {
    const state = readStatus(path2.join(DIRS.async, runId))?.state;
    return state === "queued" || state === "running";
  } catch {
    return true;
  }
}
function missingForkCopyNote(sessionFile) {
  if (path2.basename(path2.dirname(path2.dirname(sessionFile))) !== "forks") return "";
  return ". It was a forked child's copy of the parent session; such copies are deleted once nothing has written to them for artifactConfig.cleanupDays days (default 7).";
}

export {
  canonicalSessionId,
  inspectSessionLease,
  PROJECT_SUBAGENTS_RELATIVE_DIR,
  getProjectArtifactPackagingWarning,
  getProjectSubagentsDir,
  getArtifactsDir,
  getArtifactPaths,
  ensureArtifactsDir,
  writeArtifact,
  formatOutputArtifactContent,
  writeMetadata,
  appendJsonl,
  cleanupOldArtifacts,
  cleanupAllArtifactDirs,
  missingForkCopyNote
};
