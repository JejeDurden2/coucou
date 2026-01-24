-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_notifications_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "last_inactivity_email_at" TIMESTAMP(3),
ADD COLUMN     "last_scan_at" TIMESTAMP(3);
