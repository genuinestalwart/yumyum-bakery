/*
  Warnings:

  - You are about to drop the column `menu_category_id` on the `MenuItem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "MenuItem" DROP CONSTRAINT "MenuItem_menu_category_id_fkey";

-- AlterTable
ALTER TABLE "MenuItem" DROP COLUMN "menu_category_id";

-- CreateTable
CREATE TABLE "_MenuCategoryToMenuItem" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_MenuCategoryToMenuItem_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_MenuCategoryToMenuItem_B_index" ON "_MenuCategoryToMenuItem"("B");

-- AddForeignKey
ALTER TABLE "_MenuCategoryToMenuItem" ADD CONSTRAINT "_MenuCategoryToMenuItem_A_fkey" FOREIGN KEY ("A") REFERENCES "MenuCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MenuCategoryToMenuItem" ADD CONSTRAINT "_MenuCategoryToMenuItem_B_fkey" FOREIGN KEY ("B") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
