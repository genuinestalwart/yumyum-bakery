-- CreateEnum
CREATE TYPE "OrderType" AS ENUM('DELIVERY', 'PICKUP');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM(
	'PENDING',
	'CANCELLED',
	'REJECTED',
	'ACCEPTED',
	'PREPARING',
	'READY_FOR_PICKUP',
	'PICKED_UP',
	'RETURNED',
	'IN_TRANSIT',
	'DELIVERED',
	'FAILED'
);

-- CreateTable
CREATE TABLE "CartItem" (
	"id" UUID NOT NULL,
	"customer_id" TEXT NOT NULL,
	"amount" INTEGER NOT NULL,
	"menu_item_id" UUID NOT NULL,
	CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
	"id" UUID NOT NULL,
	"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"published_at" TIMESTAMP,
	"available" BOOLEAN NOT NULL DEFAULT false,
	"description" VARCHAR(500) NOT NULL,
	"image" TEXT NOT NULL,
	"name" VARCHAR(50) NOT NULL,
	"prep_time" INTEGER NOT NULL,
	"price" DOUBLE PRECISION NOT NULL,
	"updated_at" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
	"id" UUID NOT NULL,
	"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"customer_id" TEXT,
	"rider_id" TEXT,
	"total_price" DOUBLE PRECISION NOT NULL,
	"type" "OrderType" NOT NULL,
	"status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
	"updated_at" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderedItem" (
	"id" UUID NOT NULL,
	"amount" INTEGER NOT NULL,
	"price_per_item" DOUBLE PRECISION NOT NULL,
	"menu_item_id" UUID,
	"order_id" UUID NOT NULL,
	CONSTRAINT "OrderedItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_customer_id_menu_item_id_key" ON "CartItem" ("customer_id", "menu_item_id");

-- AddForeignKey
ALTER TABLE "CartItem"
ADD CONSTRAINT "CartItem_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "MenuItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderedItem"
ADD CONSTRAINT "OrderedItem_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "MenuItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderedItem"
ADD CONSTRAINT "OrderedItem_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
