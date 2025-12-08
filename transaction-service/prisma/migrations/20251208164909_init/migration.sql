-- AddForeignKey
ALTER TABLE "Borrowings" ADD CONSTRAINT "Borrowings_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
