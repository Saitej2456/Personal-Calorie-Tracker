CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "food_entries"
ADD CONSTRAINT "food_entries_quantity_positive"
CHECK ("quantity" > 0);

ALTER TABLE "food_entries"
ADD CONSTRAINT "food_entries_calories_nonnegative"
CHECK ("calories" >= 0);

ALTER TABLE "food_entries"
ADD CONSTRAINT "food_entries_protein_nonnegative"
CHECK ("protein_g" >= 0);

ALTER TABLE "food_entries"
ADD CONSTRAINT "food_entries_carbs_nonnegative"
CHECK ("carbs_g" >= 0);

ALTER TABLE "food_entries"
ADD CONSTRAINT "food_entries_fat_nonnegative"
CHECK ("fat_g" >= 0);

ALTER TABLE "food_entries"
ADD CONSTRAINT "food_entries_ai_confidence_valid"
CHECK (
  "ai_confidence" IS NULL
  OR (
    "ai_confidence" >= 0
    AND "ai_confidence" <= 1
  )
);

ALTER TABLE "weight_logs"
ADD CONSTRAINT "weight_logs_weight_positive"
CHECK ("weight_kg" > 0);

ALTER TABLE "goals"
ADD CONSTRAINT "goals_calorie_target_positive"
CHECK ("calorie_target" > 0);

ALTER TABLE "goals"
ADD CONSTRAINT "goals_protein_target_nonnegative"
CHECK ("protein_target" >= 0);

ALTER TABLE "goals"
ADD CONSTRAINT "goals_carbs_target_nonnegative"
CHECK ("carbs_target" >= 0);

ALTER TABLE "goals"
ADD CONSTRAINT "goals_fat_target_nonnegative"
CHECK ("fat_target" >= 0);

ALTER TABLE "goals"
ADD CONSTRAINT "goals_weight_goal_positive"
CHECK (
  "weight_goal" IS NULL
  OR "weight_goal" > 0
);

ALTER TABLE "goals"
ADD CONSTRAINT "goals_no_overlapping_periods"
EXCLUDE USING gist (
  "user_id" WITH =,
  tstzrange(
    "effective_from",
    COALESCE(
      "effective_to",
      'infinity'::timestamptz
    ),
    '[)'
  ) WITH &&
);