/*
  Warnings:

  - You are about to drop the column `on_fridays` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `on_mondays` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `on_saturdays` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `on_sundays` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `on_thursdays` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `on_tuesdays` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `on_wednesdays` on the `subscriptions` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ScheduleSlot" AS ENUM ('slot_0000', 'slot_0900', 'slot_0930', 'slot_1000', 'slot_1030', 'slot_1100', 'slot_1130', 'slot_1200', 'slot_1230', 'slot_1300', 'slot_1330', 'slot_1400', 'slot_1430', 'slot_1500', 'slot_1530', 'slot_1600', 'slot_1630', 'slot_1700', 'slot_1730', 'slot_1800', 'slot_1830', 'slot_1900', 'slot_1930', 'slot_2000', 'slot_2030', 'slot_2100');

-- AlterTable
ALTER TABLE "subscription_items" ADD COLUMN     "on_fridays" "ScheduleSlot"[],
ADD COLUMN     "on_mondays" "ScheduleSlot"[],
ADD COLUMN     "on_saturdays" "ScheduleSlot"[],
ADD COLUMN     "on_sundays" "ScheduleSlot"[],
ADD COLUMN     "on_thursdays" "ScheduleSlot"[],
ADD COLUMN     "on_tuesdays" "ScheduleSlot"[],
ADD COLUMN     "on_wednesdays" "ScheduleSlot"[];

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "on_fridays",
DROP COLUMN "on_mondays",
DROP COLUMN "on_saturdays",
DROP COLUMN "on_sundays",
DROP COLUMN "on_thursdays",
DROP COLUMN "on_tuesdays",
DROP COLUMN "on_wednesdays",
ADD COLUMN     "is_approved" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "is_active" SET DEFAULT false;
