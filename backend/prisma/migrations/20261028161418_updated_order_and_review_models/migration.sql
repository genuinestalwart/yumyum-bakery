/*
  Warnings:

  - You are about to drop the column `order_comment` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `order_rating` on the `orders` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_menu_item_id_fkey";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "order_comment",
DROP COLUMN "order_rating";

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "orderId" UUID,
ALTER COLUMN "menu_item_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
