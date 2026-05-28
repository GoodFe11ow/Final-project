-- CreateEnum
CREATE TYPE "ActiveFocusTimerStatus" AS ENUM ('active', 'paused', 'cancelled', 'completed', 'notified');

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActiveFocusTimer" (
    "id" TEXT NOT NULL,
    "sessionKey" TEXT NOT NULL,
    "task" TEXT NOT NULL,
    "plannedDurationMs" INTEGER NOT NULL,
    "remainingMs" INTEGER NOT NULL,
    "scheduledEndAt" TIMESTAMP(3) NOT NULL,
    "status" "ActiveFocusTimerStatus" NOT NULL DEFAULT 'active',
    "notifiedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActiveFocusTimer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- CreateIndex
CREATE UNIQUE INDEX "ActiveFocusTimer_sessionKey_key" ON "ActiveFocusTimer"("sessionKey");

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActiveFocusTimer" ADD CONSTRAINT "ActiveFocusTimer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
