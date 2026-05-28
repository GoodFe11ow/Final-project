import { Router } from "express";
import { requireAuth } from "../middlewares/require-auth.js";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import {
    pushSubscriptionSchema,
    deletePushSubscriptionsSchema,
    upsertActiveFocusSchema,
} from "../validations/push.validation.js";
import { sendPushToUser } from "../lib/push.js";
import { z } from "zod";

const pushRouter = Router()
pushRouter.use(requireAuth)

const testPushSchema = z.object({
    title: z.string().trim().min(1).optional(),
    body: z.string().trim().min(1).optional(),
    tag: z.string().trim().min(1).optional(),
    url: z.string().trim().min(1).optional(),
});

pushRouter.get("/push/public-key", async (_req, res, next) => {
    try {
        return res.status(200).json({
            ok: true,
            data: {
                publicKey: env.VAPID_PUBLIC_KEY,
            },
        })
    } catch (error) {
        return next(error);
    }
});

pushRouter.post("/push-subscriptions", async (req, res, next) => {
    try {
        const result = pushSubscriptionSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                ok: false,
                message: "Invalid request body",
                errors: result.error.flatten().fieldErrors,
            });
        }

        const { endpoint, p256dh, auth } = result.data;

        const subscription = await prisma.pushSubscription.upsert({
            where: { endpoint },
            update: { p256dh, auth, userId: req.user!.id },
            create: { endpoint, p256dh, auth, userId: req.user!.id },
        });

        return res.status(200).json({
            ok: true,
            data: subscription,
        });
    } catch (error) {
        return next(error);
    }
});

pushRouter.delete("/push-subscriptions", async (req, res, next) => {
    try {
        const result = deletePushSubscriptionsSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                ok: false,
                message: "Invalid request body",
                errors: result.error.flatten().fieldErrors,
            });
        }

        const { endpoint } = result.data;

        await prisma.pushSubscription.deleteMany({
            where: {
                endpoint,
                userId: req.user!.id,
            },
        });

        return res.status(200).json({
            ok: true,
            data: null,
        });
    } catch (error) {
        return next(error);
    }
});

pushRouter.put("/active-focus-timers/:sessionKey", async (req, res, next) => {
    try {
        const sessionKey = req.params.sessionKey;

        if (!sessionKey) {
            return res.status(400).json({
                ok: false,
                message: "Session key is required",
            });
        }

        const result = upsertActiveFocusSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                ok: false,
                message: "Invalid request body",
                errors: result.error.flatten().fieldErrors,
            });
        }

        const {
            task,
            plannedDurationMs,
            remainingMs,
            scheduledEndAt,
            status,
        } = result.data;

        const activeFocusTimer = await prisma.activeFocusTimer.upsert({
            where: {
                userId_sessionKey: {
                    userId: req.user!.id,
                    sessionKey,
                },
            },
            update: {
                task,
                plannedDurationMs,
                remainingMs,
                scheduledEndAt: new Date(scheduledEndAt),
                status,
                notifiedAt: null,
            },
            create: {
                userId: req.user!.id,
                sessionKey,
                task,
                plannedDurationMs,
                remainingMs,
                scheduledEndAt: new Date(scheduledEndAt),
                status,
            },
        });

        return res.status(200).json({
            ok: true,
            data: activeFocusTimer,
        });
    } catch (error) {
        return next(error);
    }
});

pushRouter.delete("/active-focus-timers/:sessionKey", async (req, res, next) => {
    try {
        const sessionKey = req.params.sessionKey;

        if (!sessionKey) {
            return res.status(400).json({
                ok: false,
                message: "Session key is required",
            });
        }

        await prisma.activeFocusTimer.deleteMany({
            where: {
                userId: req.user!.id,
                sessionKey,
            },
        });

        return res.status(200).json({
            ok: true,
            data: null,
        });
    } catch (error) {
        return next(error);
    }
});

pushRouter.post("/push/test", async (req, res, next) => {
    try {
        const result = testPushSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                ok: false,
                message: "Invalid request body",
                errors: result.error.flatten().fieldErrors,
            });
        }

        const payload = {
            title: result.data.title ?? "Focus session completed",
            body: result.data.body ?? "This is a test push notification",
            tag: result.data.tag ?? "focus-test",
            url: result.data.url ?? "/focus",
        };

        await sendPushToUser(req.user!.id, payload);

        return res.status(200).json({
            ok: true,
            data: {
                sent: true,
            },
        });
    } catch (error) {
        return next(error);
    }
});

export default pushRouter;