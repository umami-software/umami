CREATE TABLE "commerce_event" (
    "commerce_event_id" UUID PRIMARY KEY,
    "website_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "visit_id" UUID NOT NULL,
    "event_name" VARCHAR(50) NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "market" VARCHAR(200),
    "cart_id" VARCHAR(200),
    "checkout_id" VARCHAR(200),
    "order_id" VARCHAR(200),
    "subtotal" DECIMAL(19,4) NOT NULL,
    "shipping" DECIMAL(19,4) NOT NULL,
    "tax" DECIMAL(19,4) NOT NULL,
    "total" DECIMAL(19,4) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL
);
CREATE INDEX "commerce_event_website_id_created_at_currency_idx"
    ON "commerce_event" ("website_id", "created_at", "currency");
CREATE INDEX "commerce_event_website_id_order_id_idx" ON "commerce_event" ("website_id", "order_id");
CREATE INDEX "commerce_event_website_id_checkout_id_idx" ON "commerce_event" ("website_id", "checkout_id");

CREATE TABLE "commerce_item" (
    "commerce_event_id" UUID NOT NULL,
    "item_index" INTEGER NOT NULL,
    "website_id" UUID NOT NULL,
    "product_id" VARCHAR(200) NOT NULL,
    "name" VARCHAR(200),
    "variant" VARCHAR(200),
    "category" VARCHAR(200),
    "price" DECIMAL(19,4) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "total" DECIMAL(19,4) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    PRIMARY KEY ("commerce_event_id", "item_index")
);
CREATE INDEX "commerce_item_website_id_created_at_product_id_idx"
    ON "commerce_item" ("website_id", "created_at", "product_id");
