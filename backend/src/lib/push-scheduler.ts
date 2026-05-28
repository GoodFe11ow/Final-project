import { prisma } from "./prisma.js";
import { sendPushToUser } from "./push.js";

const PUSH_SCHEDULER_INTERVAL_MS = 15_000;

let isSchedulerRunning = false;

async function processDueFocusTimers() {
    if(isSchedulerRunning) return;

    isSchedulerRunning = true;

    try {
        const now = new Date();

        const dueTimers = await prisma.activeFocusTimer.findMany({
            where: {
                status: "active",
                scheduledEndAt: {
                    lte: now,
                },
                notifiedAt: null,
            },
            orderBy: {
                scheduledEndAt: "asc",
            },
            take: 50,
        });

        for (const timer of dueTimers) {
            const plannedMinutes = Math.max(1, Math.round(timer.plannedDurationMs / 60000));

            const payload = {
                title: "Focus session complete",
                body: `${plannedMinutes} min session for "${timer.task}" is over.`,
                tag: "focus-complete",
                url: "/focus",
            };

            try {
                await sendPushToUser(timer.userId, payload);

                await prisma.activeFocusTimer.update({
                    where: {
                        id: timer.id,
                    },
                    data: {
                        status: "notified",
                        notifiedAt: new Date(),
                    },
                });
            } catch (error) {
                console.error("Failed to process active focus timer", {
                    timerId: timer.id,
                    sessionKey: timer.sessionKey,
                    error,
                });
            }
        }
    } finally {
        isSchedulerRunning = false;
    }
}

export function startPushScheduler() {
    void processDueFocusTimers();

    return setInterval(() => {
        void processDueFocusTimers();
    }, PUSH_SCHEDULER_INTERVAL_MS);
}