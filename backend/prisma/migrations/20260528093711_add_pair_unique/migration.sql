/*
  Warnings:

  - A unique constraint covering the columns `[userId,sessionKey]` on the table `ActiveFocusTimer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "ActiveFocusTimer_status_scheduledEndAt_idx" ON "ActiveFocusTimer"("status", "scheduledEndAt");

-- CreateIndex
CREATE UNIQUE INDEX "ActiveFocusTimer_userId_sessionKey_key" ON "ActiveFocusTimer"("userId", "sessionKey");

-- CreateIndex
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");
