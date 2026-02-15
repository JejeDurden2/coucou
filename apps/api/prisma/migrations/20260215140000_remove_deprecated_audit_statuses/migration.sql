-- Remove deprecated audit status values from enum
-- This requires creating a new enum, migrating data, and swapping

-- 1. Create new enum with only active statuses
CREATE TYPE "AuditStatus_new" AS ENUM ('PENDING', 'PAID', 'CRAWLING', 'ANALYZING', 'COMPLETED', 'FAILED');

-- 2. Drop the default constraint temporarily
ALTER TABLE "audit_orders" ALTER COLUMN "status" DROP DEFAULT;

-- 3. Alter the column to use the new enum (cast via text)
ALTER TABLE "audit_orders"
  ALTER COLUMN "status" TYPE "AuditStatus_new"
  USING ("status"::text::"AuditStatus_new");

-- 4. Re-add the default constraint with the new enum type
ALTER TABLE "audit_orders" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"AuditStatus_new";

-- 5. Drop the old enum
DROP TYPE "AuditStatus";

-- 6. Rename the new enum to the original name
ALTER TYPE "AuditStatus_new" RENAME TO "AuditStatus";
