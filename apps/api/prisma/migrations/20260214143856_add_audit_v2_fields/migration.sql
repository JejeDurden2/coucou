-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditStatus" ADD VALUE 'CRAWLING';
ALTER TYPE "AuditStatus" ADD VALUE 'ANALYZING';

-- AlterTable
ALTER TABLE "audit_orders" ADD COLUMN     "action_count_critical" INTEGER,
ADD COLUMN     "action_count_high" INTEGER,
ADD COLUMN     "action_count_medium" INTEGER,
ADD COLUMN     "analysis_data_url" TEXT,
ADD COLUMN     "competitors_analyzed" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "crawl_data_url" TEXT,
ADD COLUMN     "external_presence_score" INTEGER,
ADD COLUMN     "geo_score" INTEGER,
ADD COLUMN     "pages_analyzed_client" INTEGER,
ADD COLUMN     "pages_analyzed_competitors" INTEGER,
ADD COLUMN     "refund_id" TEXT,
ADD COLUMN     "refunded_at" TIMESTAMP(3),
ADD COLUMN     "retry_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "top_findings" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "total_actions" INTEGER,
ADD COLUMN     "verdict" TEXT;
