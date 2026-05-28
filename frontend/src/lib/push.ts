import { apiRequest } from "./api";

type PushPublicKeyResponse = {
    ok: true;
    data: {
        publicKey: string;
    };
}

type SavePushSubscriptionResponse = {
    ok: true;
    data: {
        id: string;
        endpoint: string;
        p256dh: string;
        auth: string;
        userId: string;
        createdAt: string;
        updatedAt: string;
    };
}

type PushSubscriptionPayload = {
    endpoint: string;
    p256dh: string;
    auth: string;
}

type EnsurePushSubscriptionResult =
    | { status: "unsupported" }
    | { status: "permission-denied" }
    | { status: "subscribed" }

function isPushSupported() {
    return (
        typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window
    )
}

function urlBase64ToUint8Array(base64string: string) {
    const padding = "=".repeat((4 - (base64string.length % 4)) % 4)
    const normalizedBase64 = (base64string + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/")

    const rawData = window.atob(normalizedBase64)
    const outputArray = new Uint8Array(rawData.length)

    for (let index = 0; index < rawData.length; index += 1) {
        outputArray[index] = rawData.charCodeAt(index)
    }

    return outputArray
}

async function getPushPublicKey(token: string) {
    const response = await apiRequest<PushPublicKeyResponse>("/push/public-key", {
        token,
    })

    return response.data.publicKey
}

function getSubscriptionPayload(subscription: PushSubscription): PushSubscriptionPayload {
    const subscriptionJson = subscription.toJSON()

    const endpoint = subscriptionJson.endpoint
    const p256dh = subscriptionJson.keys?.p256dh
    const auth = subscriptionJson.keys?.auth

    if (!endpoint || !p256dh || !auth) {
        throw new Error("Push subscription keys are missing")
    }

    return {
        endpoint,
        p256dh,
        auth
    }
}

async function savePushSubscription(token: string, subscription: PushSubscription) {
    const payload = getSubscriptionPayload(subscription)

    await apiRequest<SavePushSubscriptionResponse>("/push-subscriptions", {
        method: "POST",
        token,
        body: JSON.stringify(payload),
    })
}

export async function ensurePushSubscription(token: string): Promise<EnsurePushSubscriptionResult> {
    if (!isPushSupported()) {
        return { status: "unsupported" }
    }

    if (Notification.permission === "denied") {
        return { status: "permission-denied" }
    }

    const permission =
        Notification.permission === "granted"
            ? "granted"
            : await Notification.requestPermission()

    if (permission !== "granted") {
        return { status: "permission-denied" }
    }

    const publicKey = await getPushPublicKey(token)
    const registration = await navigator.serviceWorker.ready

    let subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
        })
    }

    await savePushSubscription(token, subscription)

    return { status: "subscribed" }
}
