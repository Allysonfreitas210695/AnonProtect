/*
  Warnings:

  - You are about to drop the column `type` on the `reports` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "ReportStatus" ADD VALUE 'ARCHIVED';

-- AlterTable
ALTER TABLE "reports" DROP COLUMN "type",
ADD COLUMN     "category_id" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "postal_code" TEXT,
ADD COLUMN     "priority" TEXT DEFAULT 'MEDIUM',
ADD COLUMN     "state" TEXT;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
