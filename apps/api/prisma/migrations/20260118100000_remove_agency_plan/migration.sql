-- Remove AGENCY value from Plan enum
-- First, ensure no rows use this value (update them if needed)
UPDATE "users" SET "plan" = 'PRO' WHERE "plan" = 'AGENCY';
UPDATE "subscriptions" SET "plan" = 'PRO' WHERE "plan" = 'AGENCY';

-- Drop default constraints first
ALTER TABLE "users" ALTER COLUMN "plan" DROP DEFAULT;

-- Create new enum without AGENCY
CREATE TYPE "Plan_new" AS ENUM ('FREE', 'SOLO', 'PRO');

-- Update columns to use new enum
ALTER TABLE "users" ALTER COLUMN "plan" TYPE "Plan_new" USING ("plan"::text::"Plan_new");
ALTER TABLE "subscriptions" ALTER COLUMN "plan" TYPE "Plan_new" USING ("plan"::text::"Plan_new");

-- Drop old enum and rename new one
DROP TYPE "Plan";
ALTER TYPE "Plan_new" RENAME TO "Plan";

-- Restore default
ALTER TABLE "users" ALTER COLUMN "plan" SET DEFAULT 'FREE'::"Plan";
