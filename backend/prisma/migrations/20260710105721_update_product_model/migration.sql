/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Product` table. All the data in the column will be lost.
  - You are about to alter the column `purchasePrice` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "deletedAt",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "purchasePrice" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "Product_isDeleted_idx" ON "Product"("isDeleted");
