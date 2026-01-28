-- AlterTable
ALTER TABLE "users" ADD COLUMN     "last_payment_failed_at" TIMESTAMP(3),
ADD COLUMN     "last_upgrade_email_at" TIMESTAMP(3),
ADD COLUMN     "last_weekly_report_at" TIMESTAMP(3),
ADD COLUMN     "previous_plan" "Plan",
ADD COLUMN     "subscription_ended_at" TIMESTAMP(3);
