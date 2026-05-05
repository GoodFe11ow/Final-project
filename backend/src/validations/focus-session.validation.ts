import { z } from "zod";

export const createFocusSessionSchema = z.object({
    mode: z.enum(["focus", "break"]),
    completionType: z.enum(["completed-normally", "stopped-early"]),
    plannedDurationMs: z.number().int().positive("plannedDurationMs nust be positive"),
    actualElapsedMs: z.number().int().min(0, "actualElapsedMs cannot be negative"),
    task: z.string().trim().min(1, "task is required"),
    startedAt: z.string().datetime("startedAt must be a valid ISO datetime"),
    endedAt: z.string().datetime("endedAt must be a valid ISO datetime"),
});