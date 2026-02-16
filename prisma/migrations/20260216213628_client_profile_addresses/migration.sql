-- AlterTable
ALTER TABLE "User" ADD COLUMN     "documentId" TEXT;

-- CreateTable
CREATE TABLE "ClientProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "motoBrand" TEXT,
    "motoModel" TEXT,
    "motoYear" INTEGER,
    "motoPlate" TEXT,
    "motoColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "reference" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientProfile_userId_key" ON "ClientProfile"("userId");

-- CreateIndex
CREATE INDEX "Address_userId_idx" ON "Address"("userId");

-- AddForeignKey
ALTER TABLE "ClientProfile" ADD CONSTRAINT "ClientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
