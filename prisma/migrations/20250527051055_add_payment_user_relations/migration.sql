/*
  Warnings:

  - The values [PAYMENT_REQUEST,MESSAGE_RECEIVED] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[paymentIntentId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `freelancerId` to the `milestones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientId` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `freelancerId` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('PAYMENT_RECEIVED', 'CONTRACT_COMPLETED', 'MILESTONE_COMPLETED', 'PAYMENT_FAILED', 'CONTRACT_CREATED', 'CONTRACT_UPDATED', 'CONTRACT_DELETED', 'MILESTONE_CREATED', 'MILESTONE_UPDATED', 'MILESTONE_DELETED');
ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "NotificationType_old";
COMMIT;

-- AlterTable
ALTER TABLE "milestones" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "freelancerId" TEXT;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "freelancerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "payments_paymentIntentId_key" ON "payments"("paymentIntentId");

-- Update existing records
UPDATE "milestones" m
SET "freelancerId" = c."freelancerId"
FROM "contracts" c
WHERE m."contractId" = c.id;

UPDATE "payments" p
SET 
  "clientId" = c."clientId",
  "freelancerId" = c."freelancerId"
FROM "contracts" c
WHERE p."contractId" = c.id;

-- Make columns required
ALTER TABLE "milestones" ALTER COLUMN "freelancerId" SET NOT NULL;
ALTER TABLE "payments" ALTER COLUMN "clientId" SET NOT NULL;
ALTER TABLE "payments" ALTER COLUMN "freelancerId" SET NOT NULL;

-- Add foreign key constraints
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
