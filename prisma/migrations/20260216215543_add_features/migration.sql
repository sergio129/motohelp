-- AlterTable
ALTER TABLE "ServiceRequest" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "ServiceType" ADD COLUMN     "basePrice" DECIMAL(65,30);

-- CreateTable
CREATE TABLE "StatusHistory" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "previousStatus" "ServiceStatus" NOT NULL,
    "newStatus" "ServiceStatus" NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StatusHistory_serviceId_idx" ON "StatusHistory"("serviceId");

-- AddForeignKey
ALTER TABLE "StatusHistory" ADD CONSTRAINT "StatusHistory_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ServiceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
