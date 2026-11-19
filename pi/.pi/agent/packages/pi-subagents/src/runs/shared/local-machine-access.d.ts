import type { PlacementMachineAccess } from "./placement-host.ts";
/**
 * Machine access for the parent's own machine: the same quoted `sh -c` scripts the SSH access sends, run directly through /bin/sh.
 * They keep this process's PATH instead of the fixed remote one, which lacks coreutils on hosts such as NixOS.
 */
export declare function localMachineAccess(options?: {
    env?: NodeJS.ProcessEnv;
}): PlacementMachineAccess;
