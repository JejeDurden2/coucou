-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "last_auto_scan_at" TIMESTAMP(3),
ADD COLUMN     "next_auto_scan_at" TIMESTAMP(3);
