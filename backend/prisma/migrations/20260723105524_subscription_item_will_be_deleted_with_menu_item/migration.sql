-- DropForeignKey
ALTER TABLE "subscription_items" DROP CONSTRAINT "subscription_items_menu_item_id_fkey";

-- AddForeignKey
ALTER TABLE "subscription_items" ADD CONSTRAINT "subscription_items_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
