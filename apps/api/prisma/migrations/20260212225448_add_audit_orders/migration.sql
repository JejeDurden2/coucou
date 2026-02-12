-- CreateEnum
CREATE TYPE "AuditStatus" AS ENUM ('PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'PARTIAL', 'FAILED', 'TIMEOUT', 'SCHEMA_ERROR');

-- CreateTable
CREATE TABLE "audit_orders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "status" "AuditStatus" NOT NULL DEFAULT 'PENDING',
    "stripe_payment_intent_id" TEXT,
    "amount_cents" INTEGER NOT NULL,
    "paid_at" TIMESTAMP(3),
    "brief_payload" JSONB NOT NULL,
    "result_payload" JSONB,
    "raw_result_payload" JSONB,
    "twin_agent_id" TEXT,
    "report_url" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "timeout_at" TIMESTAMP(3),
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "audit_orders_stripe_payment_intent_id_key" ON "audit_orders"("stripe_payment_intent_id");

-- CreateIndex
CREATE INDEX "audit_orders_user_id_status_idx" ON "audit_orders"("user_id", "status");

-- CreateIndex
CREATE INDEX "audit_orders_project_id_idx" ON "audit_orders"("project_id");

-- AddForeignKey
ALTER TABLE "audit_orders" ADD CONSTRAINT "audit_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_orders" ADD CONSTRAINT "audit_orders_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
