/*
  Warnings:

  - Added the required column `delivery_city` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `delivery_latitude` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `delivery_longitude` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `delivery_postal_code` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `delivery_street` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "delivery_city" VARCHAR(100) NOT NULL,
ADD COLUMN     "delivery_latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "delivery_longitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "delivery_postal_code" VARCHAR(20) NOT NULL,
ADD COLUMN     "delivery_street" VARCHAR(250) NOT NULL;
