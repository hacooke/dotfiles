/** A child making one of these calls is blocked on its supervisor's reply, not working. */
export declare function isBlockingSupervisorTool(toolName: string | undefined, args: unknown): boolean;
/** A one-shot timer whose countdown stops while any key holds it paused. */
export interface PausableTimer {
    pause(key: string): void;
    resume(key: string): void;
    remainingMs(): number;
    clear(): void;
}
export declare function startPausableTimer(delayMs: number, onFire: () => void): PausableTimer;
export declare function pauseForSupervisorWait(timer: PausableTimer | undefined, event: {
    type?: string;
    toolCallId?: unknown;
    toolName?: string;
    args?: unknown;
}): void;
