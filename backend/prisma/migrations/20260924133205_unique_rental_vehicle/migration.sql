/*
  Warnings:

  - A unique constraint covering the columns `[make,model]` on the table `RentalVehicle` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RentalVehicle_make_model_key" ON "public"."RentalVehicle"("make", "model");
