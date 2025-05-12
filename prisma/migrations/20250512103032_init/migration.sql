/*
  Warnings:

  - You are about to drop the column `paymentIntentId` on the `contracts` table. All the data in the column will be lost.
  - You are about to drop the column `stripeAccountId` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "KeyFeature" AS ENUM ('AUTHENTICATION', 'TASK_MANAGEMENT', 'FILTERING', 'RESPONSIVE_UI', 'REST_API', 'DOCUMENTATION', 'SOURCE_CODE', 'README', 'DEPLOYMENT_INSTRUCTIONS', 'LIVE_DEMO');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('ONE_TIME', 'CONTINUOUS');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'EXPERT');

-- AlterTable
ALTER TABLE "contracts" DROP COLUMN "paymentIntentId";

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "deliverables" TEXT[],
ADD COLUMN     "experienceLevel" "ExperienceLevel" NOT NULL DEFAULT 'INTERMEDIATE',
ADD COLUMN     "features" "KeyFeature"[],
ADD COLUMN     "timelineWeeks" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "type" "ProjectType" NOT NULL DEFAULT 'ONE_TIME';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "stripeAccountId";
