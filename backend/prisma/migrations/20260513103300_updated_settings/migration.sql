/*
  Warnings:

  - You are about to drop the column `focusReminderTime` on the `UserSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserSettings" DROP COLUMN "focusReminderTime",
ADD COLUMN     "focusRemindersTime" TEXT NOT NULL DEFAULT '09:00',
ALTER COLUMN "timezone" SET DEFAULT 'Europe/Tallinn';
