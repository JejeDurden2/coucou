-- DropForeignKey
ALTER TABLE "scan_jobs" DROP CONSTRAINT "scan_jobs_prompt_id_fkey";

-- CreateIndex
CREATE INDEX "scan_jobs_user_id_created_at_idx" ON "scan_jobs"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "scan_jobs" ADD CONSTRAINT "scan_jobs_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
