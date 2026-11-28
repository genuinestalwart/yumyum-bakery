/*
  Warnings:

  - The values [slot_0000] on the enum `ScheduleSlot` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ScheduleSlot_new" AS ENUM ('slot_0900', 'slot_0930', 'slot_1000', 'slot_1030', 'slot_1100', 'slot_1130', 'slot_1200', 'slot_1230', 'slot_1300', 'slot_1330', 'slot_1400', 'slot_1430', 'slot_1500', 'slot_1530', 'slot_1600', 'slot_1630', 'slot_1700', 'slot_1730', 'slot_1800', 'slot_1830', 'slot_1900', 'slot_1930', 'slot_2000', 'slot_2030', 'slot_2100');
ALTER TABLE "subscription_items" ALTER COLUMN "on_mondays" TYPE "ScheduleSlot_new"[] USING ("on_mondays"::text::"ScheduleSlot_new"[]);
ALTER TABLE "subscription_items" ALTER COLUMN "on_tuesdays" TYPE "ScheduleSlot_new"[] USING ("on_tuesdays"::text::"ScheduleSlot_new"[]);
ALTER TABLE "subscription_items" ALTER COLUMN "on_wednesdays" TYPE "ScheduleSlot_new"[] USING ("on_wednesdays"::text::"ScheduleSlot_new"[]);
ALTER TABLE "subscription_items" ALTER COLUMN "on_thursdays" TYPE "ScheduleSlot_new"[] USING ("on_thursdays"::text::"ScheduleSlot_new"[]);
ALTER TABLE "subscription_items" ALTER COLUMN "on_fridays" TYPE "ScheduleSlot_new"[] USING ("on_fridays"::text::"ScheduleSlot_new"[]);
ALTER TABLE "subscription_items" ALTER COLUMN "on_saturdays" TYPE "ScheduleSlot_new"[] USING ("on_saturdays"::text::"ScheduleSlot_new"[]);
ALTER TABLE "subscription_items" ALTER COLUMN "on_sundays" TYPE "ScheduleSlot_new"[] USING ("on_sundays"::text::"ScheduleSlot_new"[]);
ALTER TYPE "ScheduleSlot" RENAME TO "ScheduleSlot_old";
ALTER TYPE "ScheduleSlot_new" RENAME TO "ScheduleSlot";
DROP TYPE "public"."ScheduleSlot_old";
COMMIT;

-- AlterTable
ALTER TABLE "subscription_items" ALTER COLUMN "on_fridays" SET DEFAULT ARRAY[]::"ScheduleSlot"[],
ALTER COLUMN "on_mondays" SET DEFAULT ARRAY[]::"ScheduleSlot"[],
ALTER COLUMN "on_saturdays" SET DEFAULT ARRAY[]::"ScheduleSlot"[],
ALTER COLUMN "on_sundays" SET DEFAULT ARRAY[]::"ScheduleSlot"[],
ALTER COLUMN "on_thursdays" SET DEFAULT ARRAY[]::"ScheduleSlot"[],
ALTER COLUMN "on_tuesdays" SET DEFAULT ARRAY[]::"ScheduleSlot"[],
ALTER COLUMN "on_wednesdays" SET DEFAULT ARRAY[]::"ScheduleSlot"[];
