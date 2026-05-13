import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middlewares/require-auth.js";
import { updateSettingsSchema } from "../validations/settings.validation.js";
import { Prisma } from "../generated/prisma/client.js";

const settingsRouter = Router();

settingsRouter.use(requireAuth);

const settingsSelect = {
  themeMode: true,
  focusDurationSeconds: true,
  breakDurationSeconds: true,
  focusRemindersEnabled: true,
  focusRemindersTime: true,
  focusRemindersEveryDay: true,
  focusRemindersWeekdays: true,
  dailySummaryEnabled: true,
  dailySummaryTime: true,
  timezone: true,
};

const defaultSettings = {
    themeMode: "light",
    focusDurationSeconds: 2100,
    breakDurationSeconds: 300,
    focusRemindersEnabled: true,
    focusRemindersTime: "09:00",
    focusRemindersEveryDay: false,
    focusRemindersWeekdays: true,
    dailySummaryEnabled: true,
    dailySummaryTime: "20:00",
    timezone: "Europe/Tallinn"
};


// GET all settings
settingsRouter.get('/settings', async (req, res, next) => {
    try {
        const settings = await prisma.userSettings.findUnique({
            where: {
                userId: req.user!.id,
            },
            select: settingsSelect
        });

        return res.status(200).json({
            ok: true,
            data: settings ?? defaultSettings,
        })
    } catch (error) {
        return next(error)
    }
})

//UPDATE settings
settingsRouter.patch("/settings", async (req, res, next) => {
    try {
        const result = updateSettingsSchema.safeParse(req.body);

        if(!result.success) {
            return res.status(400).json({
                ok: false,
                message: "Invalid request body",
                errors: result.error.flatten().fieldErrors,
            });
        }

        if(Object.keys(result.data).length === 0) {
            return res.status(400).json({
                ok: false,
                message: "At least one setting is required",
            });
        }

        const settingsData = Object.fromEntries(
            Object.entries(result.data).filter(([, value]) => value !== undefined),
        )

        const settings = await prisma.userSettings.upsert({
            where: {
                userId: req.user!.id,
            },
            create: {
                userId: req.user!.id,
                ...settingsData,
            } satisfies Prisma.UserSettingsUncheckedUpdateInput, 
            update: settingsData satisfies Prisma.UserSettingsUncheckedUpdateInput,
            select: settingsSelect,
        })

        return res.status(200).json({
            ok: true,
            data: settings,
        });
    } catch (error) {
        return next(error)
    }
})

export default settingsRouter;