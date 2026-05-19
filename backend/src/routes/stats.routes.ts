import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middlewares/require-auth.js";

const statsRouter = Router();

statsRouter.use(requireAuth);

function getLocalDateKey(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

function countStreakFrom(startDate: Date, uniqueFocusDays: Set<string>) {
    let streakDays = 0
    const cursor = new Date(startDate)
    cursor.setHours(0, 0, 0, 0)

    while (true) {
        const dayKey = getLocalDateKey(cursor)

        if(!uniqueFocusDays.has(dayKey)) {
            break
        }

        streakDays += 1
        cursor.setDate(cursor.getDate() - 1)
    }
    
    return streakDays
}

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

        const completedTasksThisWeek = await prisma.taskCompletionHistory.findMany({
            where: {
                userId: req.user!.id,
                completedAt: {
                    gte: weekStart,
                    lt: weekEnd,
                },
            },
            select: {
                completedAt: true
            },
        });

        const weeklyCompletions = Array.from({ length: 7 }, (_, day) => ({
            day,
            value: 0
        }));

        for (const task of completedTasksThisWeek) {

            const jsDay = task.completedAt.getDay();
            const weekDayIndex = jsDay === 0 ? 6 : jsDay - 1;

            const bucket = weeklyCompletions[weekDayIndex];

            if (!bucket) continue;

            bucket.value += 1;
        }

        const completedTasksCount = completedTasksThisWeek.length;


        const focusMinutesTotal = Math.floor(
            weeklyFocusSessions.reduce((total, session) => total + session.actualElapsedMs, 0) / 60000,
        );

        const uniqueFocusDays = new Set(
            focusSessions.map((session) => getLocalDateKey(session.startedAt)),
        );

        let streakDays = 0
        let streakStatus: 'completed_today' | 'pending_today' | 'broken' = 'broken'

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        const todayKey = getLocalDateKey(today)
        const yesterdayKey = getLocalDateKey(yesterday)

        if(uniqueFocusDays.has(todayKey)) {
            streakStatus = 'completed_today'
            streakDays = countStreakFrom(today, uniqueFocusDays)
        } else if (uniqueFocusDays.has(yesterdayKey)) {
            streakStatus = 'pending_today'
            streakDays = countStreakFrom(yesterday, uniqueFocusDays)
        }

        return res.status(200).json({
            ok: true,
            data: {
                completedTasksCount,
                focusMinutesTotal,
                streakDays,
                streakStatus,
                currentStreakDays: streakDays,
                weeklyCompletions,
            },
        });
    } catch (error) {
        return next(error);
    }
})

export default statsRouter;
