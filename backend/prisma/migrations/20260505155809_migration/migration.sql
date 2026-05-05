-- CreateTable
CREATE TABLE "FocusSession" (
    "id" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "completionType" TEXT NOT NULL,
    "plannedDurationMs" INTEGER NOT NULL,
    "actualElapsedMs" INTEGER NOT NULL,
    "task" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "FocusSession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FocusSession" ADD CONSTRAINT "FocusSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
