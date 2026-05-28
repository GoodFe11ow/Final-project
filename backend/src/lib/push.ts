import webpush from "web-push";
import { env } from "../config/env.js";
import { prisma } from "./prisma.js";
import type { PushSubscription as PrismaPushSubscription } from "../generated/prisma/client.js";

webpush.setVapidDetails(
    env.VAPID_SUBJECT,
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY
)

function toWebPushSubscription(subscription: PrismaPushSubscription) {
    return {
        endpoint: subscription.endpoint,
        keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
        }
    };
}

export async function sendPushToSubscription(subscription: PrismaPushSubscription, payload: PushNotificationPayload) {
    return webpush.sendNotification(
        toWebPushSubscription(subscription),
        JSON.stringify(payload)
    );
}

export async function sendPushToUser(userId: string, payload: PushNotificationPayload) {
    const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId }
    });

    for (const subscription of subscriptions) {
        try {
            await sendPushToSubscription(subscription, payload);
        } catch (error) {
            const statusCode = typeof error === 'object' &&
                error !== null &&
                'statusCode' in error
                ? error.statusCode
                : undefined;
            if (statusCode === 404 || statusCode === 410) {
                await prisma.pushSubscription.delete({
                    where: { endpoint: subscription.endpoint }
                })
                continue;
            }
            console.error(`Failed to send push notification`, error); 
        }
    }
}

export type PushNotificationPayload = {
    title: string;
    body: string;
    tag?: string;
    url?: string;
}