ALTER TABLE "ServiceRequest"
ADD COLUMN "caseNumber" TEXT;

UPDATE "ServiceRequest"
SET "caseNumber" = 'MH-' || TO_CHAR("createdAt", 'YYYYMMDD') || '-' || UPPER(SUBSTRING("id" FROM 1 FOR 8))
WHERE "caseNumber" IS NULL;

ALTER TABLE "ServiceRequest"
ALTER COLUMN "caseNumber" SET NOT NULL;

CREATE UNIQUE INDEX "ServiceRequest_caseNumber_key"
ON "ServiceRequest"("caseNumber");