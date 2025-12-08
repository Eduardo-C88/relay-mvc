-- DropForeignKey
ALTER TABLE "Purchases" DROP CONSTRAINT "Purchases_statusId_fkey";

-- AlterTable
ALTER TABLE "Purchases" ALTER COLUMN "buyerId" DROP NOT NULL,
ALTER COLUMN "resourceId" DROP NOT NULL,
ALTER COLUMN "sellerId" DROP NOT NULL,
ALTER COLUMN "agreedPrice" DROP NOT NULL,
ALTER COLUMN "statusId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Purchases" ADD CONSTRAINT "Purchases_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE SET NULL ON UPDATE CASCADE;
