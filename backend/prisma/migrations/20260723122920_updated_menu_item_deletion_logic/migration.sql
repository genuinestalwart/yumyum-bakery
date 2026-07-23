/*
  Warnings:

  - A unique constraint covering the columns `[orderId,menu_item_id]` on the table `ordered_items` will be added. If there are existing duplicate values, this will fail.
  - Made the column `menu_item_id` on table `ordered_items` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ordered_items" DROP CONSTRAINT "ordered_items_menu_item_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_menu_item_id_fkey";

-- AlterTable
ALTER TABLE "menu_items" ADD COLUMN     "archived_at" TIMESTAMP;

-- AlterTable
ALTER TABLE "ordered_items" ALTER COLUMN "menu_item_id" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ordered_items_orderId_menu_item_id_key" ON "ordered_items"("orderId", "menu_item_id");

-- AddForeignKey
ALTER TABLE "ordered_items" ADD CONSTRAINT "ordered_items_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
