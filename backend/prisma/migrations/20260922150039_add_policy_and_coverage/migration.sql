-- CreateEnum
CREATE TYPE "public"."PolicyStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."Policy" (
    "id" TEXT NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" "public"."PolicyStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "insurerName" TEXT NOT NULL,
    "vehicleMake" TEXT,
    "vehicleModel" TEXT,
    "vehicleYear" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Coverage" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "coverageType" TEXT NOT NULL,
    "coverageLimit" DOUBLE PRECISION,
    "deductible" DOUBLE PRECISION,
    "rentalVehicleEligible" BOOLEAN NOT NULL DEFAULT false,
    "rentalVehicleLimit" DOUBLE PRECISION,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coverage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Policy_policyNumber_key" ON "public"."Policy"("policyNumber");

-- CreateIndex
CREATE INDEX "Policy_customerId_idx" ON "public"."Policy"("customerId");

-- CreateIndex
CREATE INDEX "Policy_status_idx" ON "public"."Policy"("status");

-- CreateIndex
CREATE INDEX "Policy_endDate_idx" ON "public"."Policy"("endDate");

-- CreateIndex
CREATE INDEX "Coverage_policyId_idx" ON "public"."Coverage"("policyId");

-- CreateIndex
CREATE INDEX "Coverage_coverageType_idx" ON "public"."Coverage"("coverageType");

-- AddForeignKey
ALTER TABLE "public"."Policy" ADD CONSTRAINT "Policy_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Coverage" ADD CONSTRAINT "Coverage_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "public"."Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
