-- CreateTable
CREATE TABLE "UserProfile" (
    "id" INTEGER NOT NULL,
    "name" TEXT,
    "reputation" INTEGER,
    "university" TEXT,
    "course" TEXT,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
