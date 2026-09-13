-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

-- CreateEnum
CREATE TYPE "QuantityUnit" AS ENUM ('GRAM', 'MILLILITER', 'PIECE', 'SERVING');

-- CreateEnum
CREATE TYPE "FoodEntrySource" AS ENUM ('MANUAL', 'AI_IMAGE');

-- CreateEnum
CREATE TYPE "NutrientCategory" AS ENUM ('VITAMIN', 'MINERAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "calorie_target" DECIMAL(12,2) NOT NULL,
    "protein_target" DECIMAL(12,2) NOT NULL,
    "carbs_target" DECIMAL(12,2) NOT NULL,
    "fat_target" DECIMAL(12,2) NOT NULL,
    "weight_goal" DECIMAL(8,3),
    "effective_from" TIMESTAMPTZ NOT NULL,
    "effective_to" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_entries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "food_name" TEXT NOT NULL,
    "meal_type" "MealType" NOT NULL,
    "eaten_at" TIMESTAMPTZ NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL,
    "quantity_unit" "QuantityUnit" NOT NULL,
    "calories" DECIMAL(12,2) NOT NULL,
    "protein_g" DECIMAL(12,2) NOT NULL,
    "carbs_g" DECIMAL(12,2) NOT NULL,
    "fat_g" DECIMAL(12,2) NOT NULL,
    "source" "FoodEntrySource" NOT NULL DEFAULT 'MANUAL',
    "ai_confidence" DECIMAL(5,4),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "food_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrients" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "category" "NutrientCategory" NOT NULL,

    CONSTRAINT "nutrients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_entry_nutrients" (
    "food_entry_id" TEXT NOT NULL,
    "nutrient_id" INTEGER NOT NULL,
    "amount" DECIMAL(14,4) NOT NULL,

    CONSTRAINT "food_entry_nutrients_pkey" PRIMARY KEY ("food_entry_id","nutrient_id")
);

-- CreateTable
CREATE TABLE "weight_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "weight_kg" DECIMAL(8,3) NOT NULL,
    "logged_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weight_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "goals_user_id_effective_from_idx" ON "goals"("user_id", "effective_from");

-- CreateIndex
CREATE INDEX "food_entries_user_id_eaten_at_idx" ON "food_entries"("user_id", "eaten_at" DESC);

-- CreateIndex
CREATE INDEX "food_entries_user_id_meal_type_eaten_at_idx" ON "food_entries"("user_id", "meal_type", "eaten_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "nutrients_code_key" ON "nutrients"("code");

-- CreateIndex
CREATE INDEX "weight_logs_user_id_logged_at_idx" ON "weight_logs"("user_id", "logged_at" DESC);

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_entries" ADD CONSTRAINT "food_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_entry_nutrients" ADD CONSTRAINT "food_entry_nutrients_food_entry_id_fkey" FOREIGN KEY ("food_entry_id") REFERENCES "food_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_entry_nutrients" ADD CONSTRAINT "food_entry_nutrients_nutrient_id_fkey" FOREIGN KEY ("nutrient_id") REFERENCES "nutrients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weight_logs" ADD CONSTRAINT "weight_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
