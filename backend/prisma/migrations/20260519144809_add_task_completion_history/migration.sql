-- CreateTable
CREATE TABLE "TaskCompletionHistory" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "taskTitleSnapshot" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TaskCompletionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaskCompletionHistory_taskId_key" ON "TaskCompletionHistory"("taskId");

-- AddForeignKey
ALTER TABLE "TaskCompletionHistory" ADD CONSTRAINT "TaskCompletionHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
