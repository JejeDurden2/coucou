-- CreateTable
CREATE TABLE "sentiment_scans" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "scanned_at" TIMESTAMP(3) NOT NULL,
    "global_score" INTEGER NOT NULL,
    "results" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sentiment_scans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sentiment_scans_project_id_scanned_at_idx" ON "sentiment_scans"("project_id", "scanned_at");

-- AddForeignKey
ALTER TABLE "sentiment_scans" ADD CONSTRAINT "sentiment_scans_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
