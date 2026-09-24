-- CreateTable
CREATE TABLE "public"."RentalVehicle" (
    "id" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "dailyRate" DOUBLE PRECISION NOT NULL,
    "securityDeposit" DOUBLE PRECISION,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RentalVehicle_vehicleType_idx" ON "public"."RentalVehicle"("vehicleType");

-- CreateIndex
CREATE INDEX "RentalVehicle_isAvailable_idx" ON "public"."RentalVehicle"("isAvailable");
