-- AlterTable
ALTER TABLE "contracts" ADD COLUMN     "paymentIntentId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "stripeAccountId" TEXT;
