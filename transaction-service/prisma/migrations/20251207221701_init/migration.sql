-- CreateTable
CREATE TABLE "Purchases" (
    "id" SERIAL NOT NULL,
    "buyerId" INTEGER NOT NULL,
    "resourceId" INTEGER NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "agreedPrice" DOUBLE PRECISION NOT NULL,
    "statusId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Borrowings" (
    "id" SERIAL NOT NULL,
    "borrowerId" INTEGER NOT NULL,
    "resourceId" INTEGER NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "statusId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Borrowings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Status" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Status_name_key" ON "Status"("name");

-- AddForeignKey
ALTER TABLE "Purchases" ADD CONSTRAINT "Purchases_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
