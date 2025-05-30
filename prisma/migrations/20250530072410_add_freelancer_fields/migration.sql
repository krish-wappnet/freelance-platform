-- AlterTable
ALTER TABLE "users" ADD COLUMN     "availability" TEXT,
ADD COLUMN     "certifications" TEXT[],
ADD COLUMN     "education" TEXT,
ADD COLUMN     "experience" TEXT,
ADD COLUMN     "languages" TEXT[],
ADD COLUMN     "portfolio" TEXT,
ADD COLUMN     "preferredPaymentMethod" TEXT,
ADD COLUMN     "taxInformation" TEXT;
