import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middlewares/require-auth.js";

const statsRouter = Router();

statsRouter.use(requireAuth);

statsRouter.get("/stats/summary", async (req, res, next) => {
    const now = new Date();
    const weekStart = new Date(now);
    const day = weekStart.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;

    weekStart.setDate(weekStart.getDate() - diffToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    try {
        // const completedTasksCount = await prisma.task.count({
        //     where: {
        //         userId: req.user!.id,
        //         isCompleted: true,
        //         completedAt: {
        //             gte: weekStart,
        //             lt: weekEnd,
        //         }
        //     },
        // });

        const weeklyFocusSessions = await prisma.focusSession.findMany({
            where: {
                userId: req.user!.id,
                mode: "focus",
                startedAt: {
                    gte: weekStart,
                    lt: weekEnd,
                }
            },
            select: {
                actualElapsedMs: true,
            },
            orderBy: {
                startedAt: "desc",
            },
        });

        const focusSessions = await prisma.focusSession.findMany({
            where: {
                userId: req.user!.id,
                mode: "focus",
            },
            select: {
                startedAt: true,
            },
            orderBy: {
                startedAt: "desc",
            },
        });

        const completedTasksThisWeek = await prisma.task.findMany({
            where: {
                userId: req.user!.id,
                isCompleted: true,
                completedAt: {
                    gte: weekStart,
                    lt: weekEnd,
                },
            },
            select: {
                completedAt: true
            },
        });

        const weeklyCompletions = Array.from({ length: 7}, (_, day) => ({
            day,
            value: 0
        }));

        for (const task of completedTasksThisWeek) {
            if(!task.completedAt) continue;

            const jsDay = task.completedAt.getDay();
            const weekDayIndex = jsDay === 0 ? 6 : jsDay - 1;

            const bucket = weeklyCompletions[weekDayIndex];

            if(!bucket) continue;

            bucket.value += 1;
        }

        const completedTasksCount = completedTasksThisWeek.length;


        const focusMinutesTotal = Math.floor(
            weeklyFocusSessions.reduce((total, session) => total + session.actualElapsedMs, 0) / 60000,
        );

        const uniqueFocusDays = new Set(
            focusSessions.map((session) => session.startedAt.toISOString().slice(0, 10)),
        );

        let currentStreakDays = 0;
        const cursor = new Date();
        cursor.setHours(0, 0, 0, 0);

        while (true) {
            const dayKey = cursor.toISOString().slice(0, 10);

            if (!uniqueFocusDays.has(dayKey)) {
                break;
            }

            currentStreakDays += 1;
            cursor.setDate(cursor.getDate() - 1);
        }

        return res.status(200).json({
            ok: true,
            data: {
                completedTasksCount,
                focusMinutesTotal,
                currentStreakDays,
                weeklyCompletions,
            },
        });
    } catch (error) {
        return next(error);
    }
})

export default statsRouter;
