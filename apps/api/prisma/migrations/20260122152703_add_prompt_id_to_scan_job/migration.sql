-- AlterTable
ALTER TABLE "scan_jobs" ADD COLUMN     "prompt_id" TEXT;

-- CreateIndex
CREATE INDEX "scan_jobs_prompt_id_idx" ON "scan_jobs"("prompt_id");

-- AddForeignKey
ALTER TABLE "scan_jobs" ADD CONSTRAINT "scan_jobs_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
