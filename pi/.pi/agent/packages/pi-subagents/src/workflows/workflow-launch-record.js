import * as fs from "node:fs";
import * as path from "node:path";
import { parseSubagentCapabilityCeiling } from "../runs/shared/capability-ceiling.js";
import { runLaunchDir } from "../runs/shared/run-launch-folder.js";
import { writeAtomicJson } from "../shared/atomic-json.js";
const WORKFLOW_LAUNCH_RECORD_FILE = "launch.json";
function launchRecordPath(asyncDirRoot, runId) {
    return path.join(runLaunchDir(asyncDirRoot, runId), WORKFLOW_LAUNCH_RECORD_FILE);
}
/** Throws on a write failure; the launch must fail rather than start a run it cannot relaunch. */
export function writeWorkflowLaunchRecord(asyncDirRoot, runId, record) {
    writeAtomicJson(launchRecordPath(asyncDirRoot, runId), record);
}
function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function invalid(error) {
    return { ok: false, missing: false, error };
}
export function readWorkflowLaunchRecord(asyncDirRoot, runId) {
    let text;
    try {
        text = fs.readFileSync(launchRecordPath(asyncDirRoot, runId), "utf-8");
    }
    catch (error) {
        if (error.code === "ENOENT")
            return { ok: false, missing: true, error: "launch.json is missing" };
        return invalid(`could not be read: ${error instanceof Error ? error.message : String(error)}`);
    }
    let value;
    try {
        value = JSON.parse(text);
    }
    catch (error) {
        return invalid(`not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
    if (!isPlainObject(value))
        return invalid("not a JSON object");
    if (value.version !== 2)
        return invalid("version must be 2");
    if (typeof value.scriptDigest !== "string" || !value.scriptDigest)
        return invalid("scriptDigest must be a non-empty string");
    if (typeof value.sessionId !== "string" || !value.sessionId)
        return invalid("sessionId must be a non-empty string");
    let admissionCapabilityCeiling;
    try {
        if (value.admissionCapabilityCeiling !== undefined)
            admissionCapabilityCeiling = parseSubagentCapabilityCeiling(value.admissionCapabilityCeiling, "admissionCapabilityCeiling");
    }
    catch (error) {
        return invalid(error instanceof Error ? error.message : String(error));
    }
    const owner = {
        version: 2,
        scriptDigest: value.scriptDigest,
        sessionId: value.sessionId,
        ...(admissionCapabilityCeiling ? { admissionCapabilityCeiling } : {}),
    };
    if (value.source === "structured" || value.source === "internal")
        return { ok: true, record: { ...owner, source: value.source } };
    if (value.source !== "script" && value.source !== "resource")
        return invalid("source must be \"script\", \"resource\", \"structured\", or \"internal\"");
    if (!isPlainObject(value.params))
        return invalid("params must be an object");
    return { ok: true, record: { ...owner, source: value.source, params: value.params } };
}
