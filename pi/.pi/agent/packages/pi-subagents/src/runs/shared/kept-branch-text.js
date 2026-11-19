const KEPT_BRANCH_LINE = /^Kept branch (\S+) at ([0-9a-f]+): its commits are on no other branch\.$/;
/** Kept branches from a saved handoff reference, which is read back from disk. */
export function readKeptBranches(value) {
    if (!Array.isArray(value))
        return [];
    return value.filter((entry) => typeof entry?.branch === "string" && typeof entry?.tip === "string");
}
export function formatKeptBranchLines(keptBranches) {
    return keptBranches.map(({ branch, tip }) => `Kept branch ${branch} at ${tip.slice(0, 12)}: its commits are on no other branch.`);
}
/** The kept-branch lines follow the handoff line directly: `parseKeptBranchLines` reads them back from there. */
export function formatParallelHandoffLines(handoffPath, keptBranches) {
    return [`Parallel handoff: ${handoffPath}`, ...formatKeptBranchLines(readKeptBranches(keptBranches))];
}
export function parseKeptBranchLines(lines) {
    const kept = [];
    for (const line of lines) {
        const match = line.match(KEPT_BRANCH_LINE);
        if (!match)
            break;
        kept.push({ branch: match[1], tip: match[2] });
    }
    return kept;
}
