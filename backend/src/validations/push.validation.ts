import { z } from 'zod';

export const pushSubscriptionSchema = z.object({
    endpoint: z.string().url(),
    p256dh: z.string().trim().min(1, "p256dh is required"),
    auth: z.string().trim().min(1, "auth is required"),
});

export const deletePushSubscriptionsSchema = z.object({
    endpoint: z.url(),
});

export const upsertActiveFocusSchema = z.object({
    task: z.string().trim().min(1, "Task is required"),
    plannedDurationMs: z.number().int().positive(),
    remainingMs: z.number().int().positive(),
    scheduledEndAt: z.iso.datetime(),
    status: z.enum(["active", "paused"]),
});