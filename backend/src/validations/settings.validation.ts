import { z } from "zod";

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const updateSettingsSchema = z.object({
    themeMode: z.enum(["light", "dark"]).optional(),

    focusDurationSeconds: z
        .number()
        .int()
        .positive("focusDurationSeconds must be positive")
        .optional(),

    breakDurationSeconds: z
        .number()
        .int()
        .positive("breakDurationSeconds must be positive")
        .optional(),

    focusRemindersEnabled: z.boolean().optional(),
    focusRemindersTime: z
        .string()
        .regex(timePattern, "focusRemindersTime must be in HH:MM format")
        .optional(),
    focusRemindersEveryDay: z.boolean().optional(),
    focusRemindersWeekdays: z.boolean().optional(),

    dailySummaryEnabled: z.boolean().optional(),
    dailySummaryTime: z
        .string()
        .regex(timePattern, "dailySummaryTime must be in HH:MM format")
        .optional(),

    timezone: z.string().trim().min(1, "timezone is required").optional(),
});