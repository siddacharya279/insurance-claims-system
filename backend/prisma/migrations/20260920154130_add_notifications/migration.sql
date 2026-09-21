-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('UNREAD', 'READ');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('CLAIM_ASSIGNED', 'SURVEY_COMPLETED', 'CLAIM_APPROVED', 'CLAIM_REJECTED', 'REPAIR_STARTED', 'REPAIR_COMPLETED', 'PAYMENT_PENDING', 'PAYMENT_COMPLETED');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "recipientUserId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'UNREAD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_recipientUserId_status_idx" ON "Notification"("recipientUserId", "status");

-- CreateIndex
CREATE INDEX "Notification_claimId_idx" ON "Notification"("claimId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
