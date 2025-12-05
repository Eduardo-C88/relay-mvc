-- DropForeignKey
ALTER TABLE "Resource" DROP CONSTRAINT "Resource_statusId_fkey";

-- AlterTable
ALTER TABLE "Resource" ALTER COLUMN "statusId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE SET NULL ON UPDATE CASCADE;
