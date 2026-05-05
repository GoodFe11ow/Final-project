import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middlewares/require-auth.js";
import { createFocusSessionSchema } from "../validations/focus-session.validation.js";

const focusSessionRouter = Router();

focusSessionRouter.use(requireAuth);

focusSessionRouter.get("/focus-sessions", async (req, res, next) => {
    try {
        const focusSession = await prisma.focusSession.findMany({
            where: {
                userId: req.user!.id,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json({
            ok: true,
            data: focusSession,
        })
    } catch (error) {
        return next(error)
    }
})

focusSessionRouter.post("/focus-sessions", async(req, res, next) => {
    try {
        const result = createFocusSessionSchema.safeParse(req.body);

        if(!result.success) {
            return res.status(400).json({
                ok: false,
                message: "Ivalid request body",
                errors: result.error.flatten().fieldErrors,
            })
        }

        const focusSession = await prisma.focusSession.create({
            data: {
                mode: result.data.mode,
                completionType: result.data.completionType,
                plannedDurationMs: result.data.plannedDurationMs,
                actualElapsedMs: result.data.actualElapsedMs,
                task: result.data.task,
                startedAt: new Date(result.data.startedAt),
                endedAt: new Date(result.data.endedAt),
                userId: req.user!.id, 
            },
        });

        return res.status(201).json({
            ok: true,
            data: focusSession,
        })
    } catch (error) {
        return next(error);
    }
})

export default focusSessionRouter;