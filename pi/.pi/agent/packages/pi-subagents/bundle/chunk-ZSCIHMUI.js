import {
  CODE_OWNED_EXTERNAL_CLI_ADAPTER_IDS,
  REX_LOCAL_MACHINE,
  getAgentDir,
  getProjectConfigDir,
  resolveLocalLaunchCwd,
  resolveRexLocalPlacement
} from "./chunk-GHJ6BH5U.js";

// src/runs/shared/herdr-machine.ts
import { spawnSync as spawnSync2 } from "node:child_process";
import * as fs2 from "node:fs";
import * as path2 from "node:path";

// src/runs/shared/herdr-connection.ts
import { spawn, spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as net from "node:net";
import * as os from "node:os";
import * as path from "node:path";
var MAX_DISCOVERY_BYTES = 256 * 1024;
var MAX_RPC_BYTES = 4 * 1024 * 1024;
var SUBSCRIPTION_ACK_TIMEOUT_MS = 15e3;
var HERDR_REMOTE_PATH = "$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin";
var HERDR_SSH_BASE = ["-T", "-o", "BatchMode=yes", "-o", "NumberOfPasswordPrompts=0", "-o", "StrictHostKeyChecking=yes", "-o", "ConnectTimeout=10", "-o", "ConnectionAttempts=1", "-o", "ForwardAgent=no", "-o", "ExitOnForwardFailure=yes", "-o", "ServerAliveInterval=15", "-o", "ServerAliveCountMax=4", "-o", "SendEnv=-*", "-o", "SetEnv=PI_SUBAGENTS_SSH_GUARD="];
function hardenedSshEnv(source = process.env) {
  return { PATH: process.platform === "win32" ? source.PATH : "/usr/bin:/bin:/usr/sbin:/sbin", ...source.SystemRoot ? { SystemRoot: source.SystemRoot } : {}, ...source.WINDIR ? { WINDIR: source.WINDIR } : {} };
}
function herdrSshArgs(source = process.env) {
  return [...HERDR_SSH_BASE, ...source.SSH_AUTH_SOCK ? ["-o", `IdentityAgent=${source.SSH_AUTH_SOCK}`] : []];
}
var HerdrRpcError = class extends Error {
  code;
  requestId;
  constructor(message, requestId, code) {
    super(message);
    this.name = "HerdrRpcError";
    this.requestId = requestId;
    this.code = code;
  }
};
var HerdrTransportError = class extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = "HerdrTransportError";
  }
};
function decodeHerdrJsonLine(line) {
  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(line));
  } catch {
    throw new Error("Herdr emitted malformed JSON or UTF-8.");
  }
}
function shellQuoteRemote(value) {
  return `'${value.replaceAll("'", "'\\''")}'`;
}
function shellScriptCommand(script, args = []) {
  return `sh -c ${shellQuoteRemote(script)} sh${args.map((arg) => ` ${shellQuoteRemote(arg)}`).join("")}`;
}
function remoteShellCommand(script, args = []) {
  return shellScriptCommand(`PATH="${HERDR_REMOTE_PATH}"; export PATH; ${script}`, args);
}
function canonicalHerdrSession(session) {
  return session && session !== "default" ? session : null;
}
function herdrLocalEnv(socket, session, source) {
  const { HERDR_SESSION: _session, HERDR_CLIENT_SOCKET_PATH: _client, HERDR_PANE_ID: _pane, HERDR_ENV: _env, HERDR_SOCKET_PATH: _socket, ...env } = source;
  const selected = canonicalHerdrSession(session);
  return { ...env, HERDR_SOCKET_PATH: socket, ...selected ? { HERDR_SESSION: selected } : {} };
}
function sshEnvCommand(session, command) {
  const selected = canonicalHerdrSession(session), assignment = selected ? ` HERDR_SESSION=${shellQuoteRemote(selected)}` : "";
  return `/usr/bin/env -u HERDR_SOCKET_PATH -u HERDR_SESSION${assignment} ${remoteShellCommand(command)}`;
}
function runHerdrRemoteCommand(machine, command, options = {}) {
  return spawnSync(options.sshBin ?? "ssh", [...herdrSshArgs(options.env), machine.target, command], { encoding: "utf8", env: hardenedSshEnv(options.env), timeout: options.timeout ?? 15e3, maxBuffer: options.maxBuffer ?? MAX_DISCOVERY_BYTES, windowsHide: true });
}
function runHerdrRemoteCommandAsync(machine, command, options = {}) {
  return runBoundedCommand(options.sshBin ?? "ssh", [...herdrSshArgs(options.env), machine.target, command], { env: hardenedSshEnv(options.env), timeout: options.timeout, maxBuffer: options.maxBuffer });
}
function runBoundedCommand(file, args, options) {
  return new Promise((resolve2) => {
    const child = spawn(file, args, { env: options.env, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
    const stdout = [], stderr = [], maxBuffer = options.maxBuffer ?? MAX_DISCOVERY_BYTES;
    let stdoutBytes = 0, stderrBytes = 0, error, settled = false, escalation;
    const finish = (status, spawnError = error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (escalation) clearTimeout(escalation);
      resolve2({ status, stdout: Buffer.concat(stdout).toString("utf8"), stderr: Buffer.concat(stderr).toString("utf8"), ...spawnError ? { error: spawnError } : {} });
    };
    const terminate = () => {
      child.kill("SIGTERM");
      escalation ??= setTimeout(() => {
        if (!settled) {
          child.kill("SIGKILL");
          finish(child.exitCode ?? null);
        }
      }, 1e3);
      escalation.unref?.();
    };
    const collect = (target, stream) => (chunk) => {
      const bytes = stream === "stdout" ? stdoutBytes += chunk.byteLength : stderrBytes += chunk.byteLength;
      if (bytes > maxBuffer) {
        error ??= new Error(`${stream} maxBuffer length exceeded`);
        terminate();
      } else target.push(chunk);
    };
    child.stdout.on("data", collect(stdout, "stdout"));
    child.stderr.on("data", collect(stderr, "stderr"));
    child.once("error", (spawnError) => finish(null, spawnError));
    child.once("close", (status) => finish(status));
    const timer = setTimeout(terminate, options.timeout ?? 15e3);
    timer.unref?.();
  });
}
function parseHerdrEndpoint(value, expectedSession) {
  let parsed;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("Remote Herdr endpoint discovery returned malformed JSON.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Remote Herdr endpoint discovery returned no endpoint.");
  const p = parsed;
  if (typeof p.socket !== "string" || !path.posix.isAbsolute(p.socket) || typeof p.version !== "string" || typeof p.protocol !== "number") throw new Error("Remote Herdr endpoint discovery returned incomplete identity.");
  const session = canonicalHerdrSession(typeof p.session === "string" ? p.session : null), expected = canonicalHerdrSession(expectedSession);
  if (expected !== session) throw new Error(`Remote Herdr session identity mismatch: expected ${expected ?? "default"}, received ${session ?? "default"}.`);
  if (p.running !== true || p.compatible !== true || p.endpoint_compatible === false) throw new Error("The selected remote Herdr session is stopped or incompatible.");
  return { socket: p.socket, session, version: p.version, protocol: p.protocol, compatible: true, running: true };
}
async function discoverHerdrEndpoint(machine, options = {}) {
  const discovery = 'herdr_path=$(command -v herdr) || exit 127; case "$herdr_path" in /*/herdr) ;; *) exit 126;; esac; exec "$herdr_path" status server --json';
  const result = await runHerdrRemoteCommandAsync(machine, sshEnvCommand(machine.session, discovery), { ...options, timeout: 15e3, maxBuffer: MAX_DISCOVERY_BYTES });
  if (result.error) throw new Error(`Remote Herdr discovery failed: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`Remote Herdr discovery failed with code ${result.status}: ${(result.stderr || result.stdout).trim()}`);
  return parseHerdrEndpoint(result.stdout, machine.session);
}
var SocketRpcClient = class {
  #socketPath;
  #subscriptionAckTimeoutMs;
  #next = 0;
  constructor(socketPath, subscriptionAckTimeoutMs = SUBSCRIPTION_ACK_TIMEOUT_MS) {
    this.#socketPath = socketPath;
    this.#subscriptionAckTimeoutMs = subscriptionAckTimeoutMs;
  }
  call(method, params = {}, timeoutMs = 15e3) {
    return new Promise((resolve2, reject) => {
      const socket = net.createConnection(this.#socketPath);
      let bytes = 0;
      let data = Buffer.alloc(0);
      let finished = false;
      const id = String(++this.#next);
      const timer = setTimeout(() => finish(new HerdrTransportError(`Herdr RPC '${method}' timed out.`)), timeoutMs);
      timer.unref?.();
      const finish = (error, value) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        socket.destroy();
        error ? reject(error) : resolve2(value);
      };
      socket.on("connect", () => socket.write(`${JSON.stringify({ id, method, params })}
`));
      socket.on("data", (chunk) => {
        bytes += chunk.byteLength;
        if (bytes > MAX_RPC_BYTES) {
          finish(new Error("Herdr RPC response exceeded its byte bound."));
          return;
        }
        data = Buffer.concat([data, chunk]);
        const newline = data.indexOf(10);
        if (newline < 0) return;
        let frame;
        try {
          frame = decodeHerdrJsonLine(data.subarray(0, newline));
        } catch {
          finish(new Error("Herdr RPC returned malformed JSON or UTF-8."));
          return;
        }
        const record = frame;
        if (record.id !== id) {
          finish(new Error("Herdr RPC response identity mismatch."));
          return;
        }
        if (record.error) finish(new HerdrRpcError(String(record.error.message ?? "Herdr RPC failed."), id, typeof record.error.code === "string" ? record.error.code : void 0));
        else finish(void 0, record.result);
      });
      socket.on("error", (error) => finish(new HerdrTransportError(error.message, { cause: error })));
      socket.on("close", () => finish(new HerdrTransportError(`Herdr RPC '${method}' ended before a response.`)));
    });
  }
  async subscribe(subscriptions, listener, onDisconnect) {
    const socket = net.createConnection(this.#socketPath);
    const id = String(++this.#next);
    let buffer = Buffer.alloc(0), bytes = 0, acknowledged = false, intentional = false, notified = false, settled = false;
    let resolveAck, rejectAck;
    const acknowledgement = new Promise((resolve2, reject) => {
      resolveAck = resolve2;
      rejectAck = reject;
    });
    const failHandshake = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.destroy();
      rejectAck(error);
    };
    const disconnect = (error) => {
      if (intentional || notified) return;
      notified = true;
      if (!acknowledged) failHandshake(error);
      else onDisconnect?.(error);
    };
    const timer = setTimeout(() => failHandshake(new Error("Herdr subscription acknowledgement timed out.")), this.#subscriptionAckTimeoutMs);
    timer.unref?.();
    socket.on("data", (chunk) => {
      bytes += chunk.byteLength;
      if (bytes > (acknowledged ? MAX_RPC_BYTES * 32 : MAX_RPC_BYTES)) {
        disconnect(new Error("Herdr subscription exceeded its byte bound."));
        socket.destroy();
        return;
      }
      buffer = Buffer.concat([buffer, chunk]);
      for (; ; ) {
        const i = buffer.indexOf(10);
        if (i < 0) break;
        const line = buffer.subarray(0, i);
        buffer = buffer.subarray(i + 1);
        let value;
        try {
          value = decodeHerdrJsonLine(line);
        } catch {
          disconnect(new Error("Herdr subscription emitted malformed JSON or UTF-8."));
          socket.destroy();
          return;
        }
        const record = value;
        if (!acknowledged) {
          if (record.id === id) {
            if (record.error) {
              failHandshake(new HerdrRpcError(String(record.error.message ?? "Herdr subscription failed."), id, typeof record.error.code === "string" ? record.error.code : void 0));
              return;
            }
            if (record.result?.type !== "subscription_started") {
              failHandshake(new Error("Herdr subscription returned an invalid acknowledgement."));
              return;
            }
            acknowledged = true;
            settled = true;
            clearTimeout(timer);
            resolveAck();
            continue;
          }
          if (record.id === "" && record.error && record.error.code === "invalid_request") {
            failHandshake(new HerdrRpcError(String(record.error.message ?? "Herdr subscription request was invalid."), "", "invalid_request"));
            return;
          }
          failHandshake(new Error("Herdr subscription emitted an event before acknowledgement."));
          return;
        }
        if (record.error) {
          disconnect(new HerdrRpcError(String(record.error.message ?? "Herdr subscription failed."), typeof record.id === "string" ? record.id : "", typeof record.error.code === "string" ? record.error.code : void 0));
          socket.destroy();
          return;
        }
        listener(value);
      }
    });
    socket.on("error", (error) => disconnect(error));
    socket.on("close", () => disconnect(new Error("Herdr subscription connection was lost.")));
    socket.on("connect", () => socket.write(`${JSON.stringify({ id, method: "events.subscribe", params: { subscriptions } })}
`));
    await acknowledgement;
    return () => {
      intentional = true;
      clearTimeout(timer);
      socket.destroy();
    };
  }
};
async function waitForSocket(socketPath, child) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null) throw new Error(`SSH StreamLocal forwarding exited with code ${child.exitCode}.`);
    try {
      const stat = fs.lstatSync(socketPath);
      if (stat.isSocket()) {
        fs.chmodSync(socketPath, 384);
        return;
      }
    } catch {
    }
    await new Promise((resolve2) => setTimeout(resolve2, 25));
  }
  throw new Error("SSH StreamLocal forwarding did not create its local socket.");
}
async function terminateChild(child) {
  const wait = (ms) => child.exitCode !== null || child.signalCode !== null ? Promise.resolve() : Promise.race([new Promise((resolve2) => child.once("exit", () => resolve2())), new Promise((resolve2) => setTimeout(resolve2, ms))]);
  if (child.exitCode === null && child.signalCode === null) child.kill("SIGTERM");
  await wait(1e3);
  if (child.exitCode === null && child.signalCode === null) {
    child.kill("SIGKILL");
    await wait(1e3);
  }
}
function openSshSockets(machine, options) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pi-subagents-herdr-"));
  fs.chmodSync(dir, 448);
  const children = /* @__PURE__ */ new Set();
  const forward = async (remotePath, name) => {
    if (!path.posix.isAbsolute(remotePath)) throw new Error("Remote socket path must be absolute.");
    const local = path.join(dir, `${name}.sock`);
    const child = spawn(options.sshBin ?? "ssh", [...herdrSshArgs(options.env), "-o", "StreamLocalBindUnlink=yes", "-L", `${local}:${remotePath}`, machine.target, remoteShellCommand("exec cat >/dev/null")], { env: hardenedSshEnv(options.env), stdio: ["pipe", "ignore", "ignore"], windowsHide: true });
    children.add(child);
    const stop = async () => {
      await terminateChild(child);
      children.delete(child);
      try {
        fs.rmSync(local, { force: true });
      } catch {
      }
    };
    try {
      await waitForSocket(local, child);
    } catch (error) {
      await stop();
      throw error;
    }
    return { socketPath: local, close: stop };
  };
  return { forwardRemoteSocket: forward, close: async () => {
    await Promise.all([...children].map(terminateChild));
    children.clear();
    fs.rmSync(dir, { recursive: true, force: true });
  } };
}
function sshMachineAccess(machine, options = {}) {
  return { shellCommand: remoteShellCommand, run: (command, limits = {}) => runHerdrRemoteCommand(machine, command, { ...options, ...limits }), runAsync: (command, limits = {}) => runHerdrRemoteCommandAsync(machine, command, { ...options, ...limits }), openSockets: () => openSshSockets(machine, options) };
}
async function connectHerdrMachine(machine, options = {}) {
  if (process.platform === "win32") throw new Error("Pane-native Herdr placement requires OpenSSH StreamLocal forwarding and is not supported on Windows.");
  const endpoint = await discoverHerdrEndpoint(machine, options);
  const sockets = sshMachineAccess(machine, options).openSockets();
  const primary = await sockets.forwardRemoteSocket(endpoint.socket, "herdr").catch(async (error) => {
    await sockets.close();
    throw error;
  });
  return { endpoint, socketPath: primary.socketPath, client: new SocketRpcClient(primary.socketPath), forwardRemoteSocket: sockets.forwardRemoteSocket, close: sockets.close };
}

// src/runs/shared/herdr-machine.ts
var MAX_MACHINE_NAME_LENGTH = 128;
var HERDR_MACHINE_LIST_TIMEOUT_MS = 7500;
var MAX_HERDR_MACHINE_LIST_BYTES = 1024 * 1024;
var CONTROL_CHARS = /[\u0000-\u001f\u007f]/u;
var SUPPORTED_MACHINE_ADAPTERS = new Set(CODE_OWNED_EXTERNAL_CLI_ADAPTER_IDS);
function validateMachineName(value) {
  const trimmed = value.trim();
  if (!trimmed) throw new Error("Herdr machine id or label is required.");
  if (trimmed.length > MAX_MACHINE_NAME_LENGTH) throw new Error(`Herdr machine '${trimmed.slice(0, 24)}\u2026' exceeds ${MAX_MACHINE_NAME_LENGTH} characters.`);
  if (CONTROL_CHARS.test(trimmed)) throw new Error("Herdr machine id or label contains control characters.");
  return trimmed;
}
function validateTarget(value, requested) {
  const target = value.trim();
  if (!target || target.startsWith("-") || /[\s\u0000-\u001f\u007f]/u.test(target)) {
    throw new Error(`Herdr machine '${requested}' has an ssh target that cannot be passed safely: ${JSON.stringify(target)}.`);
  }
  return target;
}
function isRemoteAbsolute(value) {
  return value.startsWith("/") || value === "~" || value.startsWith("~/");
}
function validateRemoteCwd(value, requested) {
  const cwd = value.trim();
  if (!isRemoteAbsolute(cwd)) throw new Error(`Herdr machine '${requested}' cwd must be an absolute POSIX path or start with '~': ${JSON.stringify(cwd)}.`);
  if (CONTROL_CHARS.test(cwd)) throw new Error(`Herdr machine '${requested}' cwd contains control characters.`);
  return cwd.length > 1 ? cwd.replace(/\/+$/u, "") : cwd;
}
function parseMachineCatalog(json) {
  let parsed;
  try {
    parsed = JSON.parse(json);
  } catch (error) {
    throw new Error(`Failed to parse herdr machine list --json: ${error instanceof Error ? error.message : String(error)}`);
  }
  const entries = Array.isArray(parsed) ? parsed : parsed && typeof parsed === "object" && Array.isArray(parsed.machines) ? parsed.machines : void 0;
  if (!entries) throw new Error("herdr machine list --json returned no machine list.");
  return entries.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
    const record = entry;
    if (typeof record.id !== "string" || !record.id.trim() || typeof record.target !== "string") return [];
    return [{
      id: record.id.trim(),
      ...typeof record.label === "string" && record.label.trim() ? { label: record.label.trim() } : {},
      target: record.target,
      ...typeof record.session === "string" && record.session.trim() ? { session: record.session.trim() } : {},
      enabled: record.enabled !== false
    }];
  });
}
function readHerdrMachineCatalog(env, herdrBin) {
  return parseMachineCatalog(runLocalHerdr(herdrBin, ["machine", "list", "--json"], env, `Herdr CLI '${herdrBin}' was not found on PATH. Saved-machine placement needs Herdr installed locally.`));
}
function runLocalHerdr(bin, args, env, notFound) {
  const result = spawnSync2(bin, args, { env, encoding: "utf-8", maxBuffer: MAX_HERDR_MACHINE_LIST_BYTES, timeout: HERDR_MACHINE_LIST_TIMEOUT_MS, windowsHide: true });
  if (result.error) throw new Error(result.error.code === "ENOENT" ? notFound : `Failed to run herdr ${args.join(" ")}: ${result.error.message}`, { cause: result.error });
  if (result.status !== 0) throw new Error(`herdr ${args.join(" ")} exited with code ${result.status}: ${(result.stderr || result.stdout).trim().slice(0, 512)}`);
  return result.stdout;
}
function selectMachine(catalog, requested) {
  const byId = catalog.find((entry) => entry.id === requested);
  const matches = byId ? [byId] : catalog.filter((entry) => entry.label === requested);
  if (matches.length > 1) throw new Error(`Machine label '${requested}' is ambiguous; use its profile ID.`);
  const machine = matches[0];
  if (!machine) {
    const saved = catalog.filter((entry) => entry.enabled).map((entry) => entry.label ?? entry.id);
    throw new Error(`Herdr machine '${requested}' was not found. Saved machines: ${saved.length ? saved.join(", ") : "none"}. Add one with herdr machine add <target> --label <name>.`);
  }
  if (!machine.enabled) throw new Error(`Machine '${requested}' is disabled. Run herdr machine enable ${machine.id}.`);
  return machine;
}
function readJsonObject(filePath) {
  if (!fs2.existsSync(filePath)) return {};
  let parsed;
  try {
    parsed = JSON.parse(fs2.readFileSync(filePath, "utf-8"));
  } catch (error) {
    throw new Error(`Failed to read settings file '${filePath}': ${error instanceof Error ? error.message : String(error)}`);
  }
  return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
}
function machineSettingsFrom(settings, keys, filePath) {
  const subagents = settings.subagents;
  if (!subagents || typeof subagents !== "object" || Array.isArray(subagents)) return void 0;
  const machines = subagents.machines;
  if (machines === void 0) return void 0;
  if (!machines || typeof machines !== "object" || Array.isArray(machines)) throw new Error(`Subagent settings in '${filePath}' have invalid 'machines'; expected an object keyed by machine label or id.`);
  const key = keys.find((candidate) => candidate in machines);
  if (key === void 0) return void 0;
  const value = machines[key];
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`Subagent settings in '${filePath}' have invalid 'machines.${key}'; expected an object with 'cwd' and optional 'env'.`);
  const record = value;
  const entry = {};
  if (record.cwd !== void 0) {
    if (typeof record.cwd !== "string" || !record.cwd.trim()) throw new Error(`Subagent settings in '${filePath}' have invalid 'machines.${key}.cwd'; expected a non-empty string.`);
    entry.cwd = validateRemoteCwd(record.cwd, key);
  }
  if (record.env !== void 0) {
    if (!record.env || typeof record.env !== "object" || Array.isArray(record.env) || Object.entries(record.env).some(([name, item]) => !/^[A-Za-z_][A-Za-z0-9_]*$/u.test(name) || typeof item !== "string")) {
      throw new Error(`Subagent settings in '${filePath}' have invalid 'machines.${key}.env'; expected an object of string values keyed by variable name.`);
    }
    entry.env = { ...record.env };
    if (Object.keys(entry.env).length > 0) {
      throw new Error(`Subagent settings in '${filePath}' set 'machines.${key}.env'. Saved-machine runs use the remote Herdr/Pi environment; configure credentials and environment on '${key}' and remove the local env map.`);
    }
  }
  if (record.rex !== void 0) {
    const rex = record.rex, ssh = rex && typeof rex === "object" && !Array.isArray(rex) && Object.keys(rex).every((field) => field === "ssh") ? rex.ssh : void 0;
    if (typeof ssh !== "string") throw new Error(`Subagent settings in '${filePath}' have invalid 'machines.${key}.rex'; expected { "ssh": "<ssh target>" }.`);
    entry.rex = { ssh: validateTarget(ssh, key) };
  }
  return entry;
}
function readMachineSettings(cwd, keys) {
  const userPath = path2.join(getAgentDir(), "settings.json");
  const projectPath = path2.join(getProjectConfigDir(findProjectRootForSettings(cwd)), "settings.json");
  const user = machineSettingsFrom(readJsonObject(userPath), keys, userPath);
  const project = projectPath === userPath ? void 0 : machineSettingsFrom(readJsonObject(projectPath), keys, projectPath);
  if (project?.rex) throw new Error(`Project settings '${projectPath}' set a Rex SSH host in 'machines'. Move the rex entry to your user settings '${userPath}'; only user settings choose which host a task runs on.`);
  if (!user && !project) return void 0;
  return { ...user, ...project };
}
function userRexMachine(machine) {
  const userPath = path2.join(getAgentDir(), "settings.json");
  return machineSettingsFrom(readJsonObject(userPath), [machine], userPath)?.rex !== void 0;
}
function findProjectRootForSettings(cwd) {
  let current = path2.resolve(cwd);
  while (true) {
    if (fs2.existsSync(path2.join(getProjectConfigDir(current), "settings.json"))) return current;
    const parent = path2.dirname(current);
    if (parent === current) return path2.resolve(cwd);
    current = parent;
  }
}
function remoteMachineCwd(stepCwd, root, name) {
  const step = stepCwd?.trim();
  if (step && isRemoteAbsolute(step)) return step;
  if (!root) throw new Error(`No root for ${name} in this repo. Set subagents.machines.${name}.cwd in .pi/settings.json or pass an absolute cwd on that machine.`);
  return step ? path2.posix.join(root, step) : root;
}
function resolveHerdrMachinePlacement(input) {
  const requested = validateMachineName(input.machine);
  const catalog = input.catalogJson !== void 0 ? parseMachineCatalog(input.catalogJson) : readHerdrMachineCatalog(input.env ?? process.env, input.herdrBin ?? process.env.HERDR_BIN ?? "herdr");
  const selected = selectMachine(catalog, requested);
  const name = selected.label ?? selected.id;
  const keys = [.../* @__PURE__ */ new Set([requested, ...selected.label ? [selected.label] : [], selected.id])];
  const settings = input.settings ?? readMachineSettings(input.cwd, keys);
  if (settings?.env && Object.keys(settings.env).length > 0) {
    throw new Error(`Saved-machine environment for '${name}' must be configured remotely. Remove machines.${name}.env and configure the remote Herdr/Pi session instead.`);
  }
  const cwd = remoteMachineCwd(input.stepCwd, settings?.cwd, name);
  return {
    machine: {
      provider: "herdr",
      id: selected.id,
      ...selected.label ? { label: selected.label } : {},
      target: validateTarget(selected.target, requested),
      ...selected.session && selected.session !== "default" ? { session: selected.session } : {},
      cwd: validateRemoteCwd(cwd, requested)
    },
    ...settings?.env ? { env: settings.env } : {}
  };
}
function resolveHerdrLocalPlacement(input) {
  if (process.platform === "win32") throw new Error("Machine 'local' runs the child in a Herdr pane, which is not supported on Windows.");
  const env = input.env, paneId = env.HERDR_PANE_ID.trim(), bin = input.herdrBin ?? env.HERDR_BIN ?? "herdr", notFound = `Machine 'local' needs the Herdr CLI, but '${bin}' was not found on PATH.`;
  let endpoint;
  try {
    endpoint = parseHerdrEndpoint(runLocalHerdr(bin, ["status", "server", "--json"], env, notFound), env.HERDR_SESSION);
  } catch (error) {
    throw new Error(`Machine 'local' could not confirm this pane's Herdr server: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  }
  let pane;
  try {
    pane = JSON.parse(runLocalHerdr(bin, ["pane", "get", paneId], herdrLocalEnv(endpoint.socket, endpoint.session, env), notFound));
  } catch (error) {
    throw new Error(`Machine 'local' needs this Pi's Herdr pane ${paneId}, but the Herdr server at ${endpoint.socket} did not return it: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  }
  const result = pane?.result;
  if (result?.type !== "pane_info" || result.pane?.pane_id !== paneId) throw new Error(`The Herdr server at ${endpoint.socket} did not confirm pane ${paneId}.`);
  return { provider: "herdr", id: REX_LOCAL_MACHINE, socket: endpoint.socket, ...endpoint.session ? { session: endpoint.session } : {}, cwd: resolveLocalLaunchCwd(input.cwd, input.stepCwd) };
}
function resolveMachinePlacement(input) {
  const requested = validateMachineName(input.machine);
  const settings = input.settings ?? readMachineSettings(input.cwd, [requested]);
  if (requested === REX_LOCAL_MACHINE) {
    if (settings?.rex) throw new Error("Machine 'local' is reserved for a new tab on this machine; give the Rex SSH host in subagents.machines.local.rex another name.");
    const env = input.env ?? process.env;
    if (env.HERDR_ENV === "1" && env.HERDR_PANE_ID?.trim()) return { machine: resolveHerdrLocalPlacement({ cwd: input.cwd, stepCwd: input.stepCwd, env, herdrBin: input.herdrBin }) };
    if (env.REX_SESSION?.trim()) return { machine: resolveRexLocalPlacement({ cwd: input.cwd, stepCwd: input.stepCwd, env }) };
    throw new Error("Machine 'local' opens the child in a new tab of the terminal this Pi runs in, but this Pi is running in neither Herdr (HERDR_ENV=1 with HERDR_PANE_ID) nor Rex (REX_SESSION).");
  }
  if (settings?.rex) return { machine: { provider: "rex", id: requested, target: settings.rex.ssh, cwd: validateRemoteCwd(remoteMachineCwd(input.stepCwd, settings.cwd, requested), requested) } };
  return resolveHerdrMachinePlacement(input);
}
var PLACED_RESTORE_UNSUPPORTED = "Pane-native remote Pi does not support fork, resume, or revival; use fresh context.";
function formatHerdrMachineRunnerUnsupported(input) {
  if (input.machine === void 0) return void 0;
  const name = input.machine.trim();
  const local = name === REX_LOCAL_MACHINE;
  let rex;
  try {
    rex = local || userRexMachine(name);
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  if (rex) {
    if (input.runnerType !== void 0 && input.runnerType !== "pi") return `Agent '${input.agentName}' requested machine '${name}', but ${local ? "machine 'local' runs" : "Rex supports"} native Pi children only. Remove the machine or use a native Pi agent.`;
    if (input.worktree === true) return `Agent '${input.agentName}' requested machine '${name}', but managed worktrees cannot be combined with machine placement.`;
    if (process.platform === "win32") return `Machine '${name}' runs the child in ${local ? "a Herdr or Rex pane" : "a Rex pane"}, which is not supported on Windows.`;
    return void 0;
  }
  if (input.runnerType !== void 0 && input.runnerType !== "pi" && input.runnerType !== "external-cli") {
    return `Agent '${input.agentName}' requested machine '${input.machine}', but this runner cannot use pane-native Herdr placement. Use native Pi or a built-in Claude, Codex, or Cursor profile.`;
  }
  if (input.runnerType === "external-cli" && (input.adapter === void 0 || !SUPPORTED_MACHINE_ADAPTERS.has(input.adapter))) {
    return `Agent '${input.agentName}' requested machine '${input.machine}', but generic external-cli commands cannot be remote-wrapped safely. Use claude-code, claude-code-writer, codex-exec, codex-exec-writer, cursor-agent, or cursor-agent-writer.`;
  }
  if (input.worktree === true) return `Agent '${input.agentName}' requested machine '${input.machine}', but managed worktrees are local git operations and cannot be combined with a Herdr saved machine.`;
  if (process.platform === "win32") return "Herdr saved-machine pane transport requires hardened OpenSSH StreamLocal forwarding, which is not supported from a Windows host yet.";
  return void 0;
}

export {
  shellScriptCommand,
  herdrLocalEnv,
  runBoundedCommand,
  parseHerdrEndpoint,
  SocketRpcClient,
  sshMachineAccess,
  connectHerdrMachine,
  resolveMachinePlacement,
  PLACED_RESTORE_UNSUPPORTED,
  formatHerdrMachineRunnerUnsupported
};
