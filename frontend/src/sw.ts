/// <reference lib="webworker" />

import { clientsClaim } from "workbox-core";
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";

declare let self: ServiceWorkerGlobalScope;

clientsClaim();
self.skipWaiting();

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

type PushPayload = {
    title?: string;
    body?: string;
    tag?: string;
    url?: string;
}

function getPushPayload(event: PushEvent) {
    const fallbackPayload = {
        title: 'Focus session complete',
        body: 'Your focus session is over',
        tag: 'focus-complete',
        url: '/focus',
    }

    if (!event.data) {
        return fallbackPayload;
    }

    try {
        const parsedPayload = event.data.json() as PushPayload;

        return {
            title: parsedPayload.title ?? fallbackPayload.title,
            body: parsedPayload.body ?? fallbackPayload.body,
            tag: parsedPayload.tag ?? fallbackPayload.tag,
            url: parsedPayload.url ?? fallbackPayload.url,
        }
    } catch {
        return fallbackPayload;
    }
}

self.addEventListener('push', (event) => {
    const payload = getPushPayload(event);

    event.waitUntil(
        self.registration.showNotification(payload.title, {
            body: payload.body,
            icon: '/IconObject.svg',
            tag: payload.tag,
            data: {
                url: payload.url,
            },
        })
    );
});

async function openNotificationTarget(targetUrl: string) {
    const windowClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
    });

    for (const client of windowClients) {
        const windowClient = client as WindowClient;

        if ('navigate' in windowClient) {
            await windowClient.navigate(targetUrl);
        }

        return windowClient.focus();
    }

    if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
    }

    return undefined;
}

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const rawUrl = event.notification.data?.url ?? '/focus'
    const targetUrl = new URL(rawUrl, self.location.origin).toString()

    event.waitUntil(openNotificationTarget(targetUrl))
});