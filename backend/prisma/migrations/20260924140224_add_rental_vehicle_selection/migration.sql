-- CreateEnum
CREATE TYPE "public"."RentalSelectionStatus" AS ENUM ('SELECTED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."RentalVehicleSelection" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "rentalVehicleId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "dailyRate" DOUBLE PRECISION NOT NULL,
    "estimatedTotal" DOUBLE PRECISION,
    "status" "public"."RentalSelectionStatus" NOT NULL DEFAULT 'SELECTED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalVehicleSelection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RentalVehicleSelection_claimId_key" ON "public"."RentalVehicleSelection"("claimId");

-- CreateIndex
CREATE INDEX "RentalVehicleSelection_rentalVehicleId_idx" ON "public"."RentalVehicleSelection"("rentalVehicleId");

-- CreateIndex
CREATE INDEX "RentalVehicleSelection_status_idx" ON "public"."RentalVehicleSelection"("status");

-- AddForeignKey
ALTER TABLE "public"."RentalVehicleSelection" ADD CONSTRAINT "RentalVehicleSelection_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "public"."Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RentalVehicleSelection" ADD CONSTRAINT "RentalVehicleSelection_rentalVehicleId_fkey" FOREIGN KEY ("rentalVehicleId") REFERENCES "public"."RentalVehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
