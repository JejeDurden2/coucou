-- AlterEnum: Rename values
ALTER TYPE "LLMProvider" RENAME VALUE 'OPENAI' TO 'CHATGPT';
ALTER TYPE "LLMProvider" RENAME VALUE 'ANTHROPIC' TO 'CLAUDE';

-- AlterTable: Add provider column with default for existing rows
ALTER TABLE "scans" ADD COLUMN "provider" "LLMProvider" NOT NULL DEFAULT 'CHATGPT';

-- Remove default after backfill (schema has no default)
ALTER TABLE "scans" ALTER COLUMN "provider" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "scans_provider_idx" ON "scans"("provider");

-- CreateIndex
CREATE INDEX "users_last_upgrade_email_at_idx" ON "users"("last_upgrade_email_at");

-- CreateIndex
CREATE INDEX "users_subscription_ended_at_idx" ON "users"("subscription_ended_at");

-- CreateIndex
CREATE INDEX "users_previous_plan_subscription_ended_at_idx" ON "users"("previous_plan", "subscription_ended_at");
