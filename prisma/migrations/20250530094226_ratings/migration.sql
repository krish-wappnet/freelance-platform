/*
  Warnings:

  - You are about to drop the column `clientId` on the `Rating` table. All the data in the column will be lost.
  - You are about to drop the column `freelancerId` on the `Rating` table. All the data in the column will be lost.
  - You are about to drop the column `milestoneId` on the `Rating` table. All the data in the column will be lost.
  - Added the required column `ratedUserId` to the `Rating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ratingUserId` to the `Rating` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_freelancerId_fkey";

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_milestoneId_fkey";

-- DropIndex
DROP INDEX "Rating_clientId_idx";

-- DropIndex
DROP INDEX "Rating_freelancerId_idx";

-- DropIndex
DROP INDEX "Rating_milestoneId_idx";

-- AlterTable
ALTER TABLE "Rating" DROP COLUMN "clientId",
DROP COLUMN "freelancerId",
DROP COLUMN "milestoneId",
ADD COLUMN     "ratedUserId" TEXT NOT NULL,
ADD COLUMN     "ratingUserId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Rating_ratedUserId_idx" ON "Rating"("ratedUserId");

-- CreateIndex
CREATE INDEX "Rating_ratingUserId_idx" ON "Rating"("ratingUserId");

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_ratedUserId_fkey" FOREIGN KEY ("ratedUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_ratingUserId_fkey" FOREIGN KEY ("ratingUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
