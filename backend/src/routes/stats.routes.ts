import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middlewares/require-auth.js";

const statsRouter = Router();

statsRouter.use(requireAuth);

statsRouter.get("/stats/summary", async (req, res, next) => {
    try {
        const completedTasksCount = await prisma.task.count({
            where: {
                userId: req.user!.id,
                isCompleted: true,
            },
        });

        const focusSession = await prisma.focusSession.findMany({
            where: {
                userId: req.user!.id,
                mode: "focus",
            },
            select: {
                actualElapsedMs: true,
                startedAt: true,
            },
            orderBy: {
                startedAt: "desc",
            },
        });

        const focusMinutesTotal = Math.floor(
            focusSession.reduce((total, session) => total + session.actualElapsedMs, 0) / 60000,
        );

        const uniqueFocusDays = new Set(
            focusSession.map((session) => session.startedAt.toISOString().slice(0, 10)),
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
            },
        });
    } catch (error) {
        return next(error);
    }
})

export default statsRouter;