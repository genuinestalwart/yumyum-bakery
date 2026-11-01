/*
  Warnings:

  - A unique constraint covering the columns `[customer_id,orderId]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "reviews_customer_id_orderId_key" ON "reviews"("customer_id", "orderId");
