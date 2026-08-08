-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('delivery', 'pickup', 'walk_in', 'subscription');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'cancelled', 'completed', 'rejected', 'accepted', 'preparing', 'ready', 'picked_up', 'in_transit', 'delivered', 'failed');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('fully_paid', 'partially_paid', 'unpaid');

-- CreateTable
CREATE TABLE "cart_items" (
    "id" UUID NOT NULL,
    "customer_id" VARCHAR(250) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "menu_item_id" UUID NOT NULL,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(20) NOT NULL,

    CONSTRAINT "menu_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_items" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMP,
    "description" VARCHAR(500) NOT NULL,
    "image" VARCHAR(2048) NOT NULL,
    "in_stock" INTEGER NOT NULL DEFAULT 0,
    "is_pre_order_only" BOOLEAN NOT NULL,
    "is_visible" BOOLEAN NOT NULL DEFAULT false,
    "name" VARCHAR(50) NOT NULL,
    "order_count" INTEGER NOT NULL DEFAULT 0,
    "prep_time" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customer_id" VARCHAR(250),
    "rider_id" VARCHAR(250) NOT NULL,
    "order_type" "OrderType" NOT NULL,
    "delivery_street" VARCHAR(250),
    "delivery_city" VARCHAR(100),
    "delivery_postal_code" VARCHAR(20),
    "delivery_latitude" DOUBLE PRECISION,
    "delivery_longitude" DOUBLE PRECISION,
    "order_comment" VARCHAR(500),
    "order_rating" INTEGER,
    "order_status" "OrderStatus" NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL,
    "updated_at" TIMESTAMP NOT NULL,
    "verification_code" VARCHAR(6),
    "subscription_id" UUID,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordered_items" (
    "id" UUID NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "menu_item_id" UUID,
    "orderId" UUID NOT NULL,

    CONSTRAINT "ordered_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" VARCHAR(500),
    "order_id" UUID NOT NULL,
    "ordered_item_id" UUID,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customer_id" VARCHAR(250) NOT NULL,
    "comment" VARCHAR(500),
    "rating" INTEGER NOT NULL,
    "updated_at" TIMESTAMP NOT NULL,
    "menu_item_id" UUID NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customer_id" VARCHAR(250) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "on_mondays" BOOLEAN NOT NULL,
    "on_tuesdays" BOOLEAN NOT NULL,
    "on_wednesdays" BOOLEAN NOT NULL,
    "on_thursdays" BOOLEAN NOT NULL,
    "on_fridays" BOOLEAN NOT NULL,
    "on_saturdays" BOOLEAN NOT NULL,
    "on_sundays" BOOLEAN NOT NULL,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_items" (
    "id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "menu_item_id" UUID NOT NULL,
    "subscription_id" UUID NOT NULL,

    CONSTRAINT "subscription_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MenuCategoryToMenuItem" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_MenuCategoryToMenuItem_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_customer_id_menu_item_id_key" ON "cart_items"("customer_id", "menu_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "menu_categories_name_key" ON "menu_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_customer_id_menu_item_id_key" ON "reviews"("customer_id", "menu_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_items_subscription_id_menu_item_id_key" ON "subscription_items"("subscription_id", "menu_item_id");

-- CreateIndex
CREATE INDEX "_MenuCategoryToMenuItem_B_index" ON "_MenuCategoryToMenuItem"("B");

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordered_items" ADD CONSTRAINT "ordered_items_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordered_items" ADD CONSTRAINT "ordered_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_ordered_item_id_fkey" FOREIGN KEY ("ordered_item_id") REFERENCES "ordered_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_items" ADD CONSTRAINT "subscription_items_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_items" ADD CONSTRAINT "subscription_items_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MenuCategoryToMenuItem" ADD CONSTRAINT "_MenuCategoryToMenuItem_A_fkey" FOREIGN KEY ("A") REFERENCES "menu_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MenuCategoryToMenuItem" ADD CONSTRAINT "_MenuCategoryToMenuItem_B_fkey" FOREIGN KEY ("B") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
