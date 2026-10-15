-- CreateTable
CREATE TABLE "GameCase" (
    "id" UUID NOT NULL,
    "caseNumber" INTEGER NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "description" VARCHAR(1000) NOT NULL,
    "coverImageUrl" VARCHAR(2048) NOT NULL,
    "priceInPaise" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameCase_caseNumber_key" ON "GameCase"("caseNumber");

-- CreateIndex
CREATE INDEX "GameCase_isPublished_caseNumber_idx" ON "GameCase"("isPublished", "caseNumber");
