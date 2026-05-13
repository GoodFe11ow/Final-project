import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middlewares/require-auth.js";

const settingsRouter = Router();

settingsRouter.use(requireAuth);

const defaultSettings = {
    themeMode: "light",
    focusDurationSeconds: 2100,
    breakDurationSeconds: 300,
    focusRemindersEnabled: true,
    focuseRemindersTime: "09:00",
    focusRemindersEveryDay: false,
    focusRemindersWeekdays: true,
    dailySummaryEnabled: true,
    dailySummaryTime: "20:00",
    timezone: "Europe/Tallinn"
};

settingsRouter.get('/settings', async (req, res, next) => {
    try {
        const settings = await prisma.userSettings.findUnique({
            where: {
                userId: req.user!.id,
            },
            select: {
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
            }
        });

        return res.status(200).json({
            ok: true,
            data: settings ?? defaultSettings,
        })
    } catch (error) {
        return next(error)
    }
})

export default settingsRouter;