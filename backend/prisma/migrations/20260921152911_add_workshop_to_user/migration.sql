-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "workshopId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "public"."Workshop"("id") ON DELETE SET NULL ON UPDATE CASCADE;
