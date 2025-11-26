-- CreateTable
CREATE TABLE "cars" (
    "id" UUID NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "price" DECIMAL NOT NULL,
    "mileage" INTEGER DEFAULT 0,
    "color" TEXT,
    "fuel_type" TEXT,
    "transmission" TEXT,
    "description" TEXT,
    "status" TEXT DEFAULT 'disponível',
    "license_plate" TEXT,
    "chassis" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "car_images" (
    "id" UUID NOT NULL,
    "car_id" UUID NOT NULL,
    "image_url" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_primary" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "car_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fixed_token" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMPTZ(6),

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_codes" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_fixed_token_key" ON "profiles"("fixed_token");

-- CreateIndex
CREATE INDEX "profiles_fixed_token_idx" ON "profiles"("fixed_token");

-- CreateIndex
CREATE INDEX "auth_codes_expires_at_idx" ON "auth_codes"("expires_at");

-- AddForeignKey
ALTER TABLE "car_images" ADD CONSTRAINT "car_images_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "cars"("id") ON DELETE CASCADE ON UPDATE CASCADE;
