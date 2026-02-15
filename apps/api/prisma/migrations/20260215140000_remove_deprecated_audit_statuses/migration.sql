-- Remove deprecated audit status values from enum
-- This requires creating a new enum, migrating data, and swapping

-- 1. Create new enum with only active statuses
CREATE TYPE "AuditStatus_new" AS ENUM ('PENDING', 'PAID', 'CRAWLING', 'ANALYZING', 'COMPLETED', 'FAILED');

-- 2. Alter the column to use the new enum (cast via text)
ALTER TABLE "audit_orders"
  ALTER COLUMN "status" TYPE "AuditStatus_new"
  USING ("status"::text::"AuditStatus_new");

-- 3. Drop the old enum
DROP TYPE "AuditStatus";

-- 4. Rename the new enum to the original name
ALTER TYPE "AuditStatus_new" RENAME TO "AuditStatus";
