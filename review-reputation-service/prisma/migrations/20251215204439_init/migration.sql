-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('BORROW', 'PURCHASE');

-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('BUYER', 'SELLER');

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "reviewerId" INTEGER NOT NULL,
    "reviewedUserId" INTEGER NOT NULL,
    "resourceId" INTEGER,
    "transactionId" INTEGER NOT NULL,
    "transactionType" "TransactionType" NOT NULL,
    "roleType" "RoleType" NOT NULL,
    "rating" SMALLINT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserReputation" (
    "userId" INTEGER NOT NULL,
    "sellerRating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "sellerReviews" INTEGER NOT NULL DEFAULT 0,
    "buyerRating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "buyerReviews" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserReputation_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE INDEX "Review_reviewedUserId_idx" ON "Review"("reviewedUserId");

-- CreateIndex
CREATE INDEX "Review_reviewerId_idx" ON "Review"("reviewerId");

-- CreateIndex
CREATE INDEX "Review_transactionId_idx" ON "Review"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_reviewerId_transactionId_roleType_key" ON "Review"("reviewerId", "transactionId", "roleType");
