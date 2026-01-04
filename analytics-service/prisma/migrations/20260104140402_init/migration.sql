-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT,
    "eventType" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_stats" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalUsers" INTEGER NOT NULL DEFAULT 0,
    "newUsers" INTEGER NOT NULL DEFAULT 0,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "totalResources" INTEGER NOT NULL DEFAULT 0,
    "newResources" INTEGER NOT NULL DEFAULT 0,
    "totalBorrowings" INTEGER NOT NULL DEFAULT 0,
    "newBorrowings" INTEGER NOT NULL DEFAULT 0,
    "completedBorrowings" INTEGER NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "newReviews" INTEGER NOT NULL DEFAULT 0,
    "avgRating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_stats" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "resourceTitle" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "ownerName" TEXT,
    "category" TEXT,
    "totalBorrowings" INTEGER NOT NULL DEFAULT 0,
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "avgBorrowingDays" DOUBLE PRECISION,
    "lastBorrowedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_stats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "totalResourcesShared" INTEGER NOT NULL DEFAULT 0,
    "totalResourcesBorrowed" INTEGER NOT NULL DEFAULT 0,
    "totalReviewsGiven" INTEGER NOT NULL DEFAULT 0,
    "totalReviewsReceived" INTEGER NOT NULL DEFAULT 0,
    "avgRatingReceived" DOUBLE PRECISION,
    "avgRatingGiven" DOUBLE PRECISION,
    "reputationScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastActiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "generatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_logs_userId_idx" ON "activity_logs"("userId");

-- CreateIndex
CREATE INDEX "activity_logs_eventType_idx" ON "activity_logs"("eventType");

-- CreateIndex
CREATE INDEX "activity_logs_timestamp_idx" ON "activity_logs"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "daily_stats_date_key" ON "daily_stats"("date");

-- CreateIndex
CREATE INDEX "daily_stats_date_idx" ON "daily_stats"("date");

-- CreateIndex
CREATE UNIQUE INDEX "resource_stats_resourceId_key" ON "resource_stats"("resourceId");

-- CreateIndex
CREATE INDEX "resource_stats_totalBorrowings_idx" ON "resource_stats"("totalBorrowings");

-- CreateIndex
CREATE INDEX "resource_stats_totalViews_idx" ON "resource_stats"("totalViews");

-- CreateIndex
CREATE INDEX "resource_stats_category_idx" ON "resource_stats"("category");

-- CreateIndex
CREATE UNIQUE INDEX "user_stats_userId_key" ON "user_stats"("userId");

-- CreateIndex
CREATE INDEX "user_stats_reputationScore_idx" ON "user_stats"("reputationScore");

-- CreateIndex
CREATE INDEX "user_stats_totalResourcesShared_idx" ON "user_stats"("totalResourcesShared");

-- CreateIndex
CREATE INDEX "reports_type_idx" ON "reports"("type");

-- CreateIndex
CREATE INDEX "reports_createdAt_idx" ON "reports"("createdAt");
