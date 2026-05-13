-- CreateTable
CREATE TABLE "UserSettings" (
    "userId" TEXT NOT NULL,
    "themeMode" TEXT NOT NULL DEFAULT 'light',
    "focusDurationSeconds" INTEGER NOT NULL DEFAULT 2100,
    "breakDurationSeconds" INTEGER NOT NULL DEFAULT 300,
    "focusRemindersEnabled" BOOLEAN NOT NULL DEFAULT true,
    "focusReminderTime" TEXT NOT NULL DEFAULT '09:00',
    "focusRemindersEveryDay" BOOLEAN NOT NULL DEFAULT false,
    "focusRemindersWeekdays" BOOLEAN NOT NULL DEFAULT true,
    "dailySummaryEnabled" BOOLEAN NOT NULL DEFAULT true,
    "dailySummaryTime" TEXT NOT NULL DEFAULT '20:00',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Tallin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
