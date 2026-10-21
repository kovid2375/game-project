-- CreateTable
CREATE TABLE "PlayerLocationUnlock" (
    "id" UUID NOT NULL,
    "playerCaseId" UUID NOT NULL,
    "locationId" UUID NOT NULL,
    "reason" VARCHAR(300) NOT NULL DEFAULT 'Discovered during investigation',
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerLocationUnlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlayerLocationUnlock_playerCaseId_unlockedAt_idx" ON "PlayerLocationUnlock"("playerCaseId", "unlockedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerLocationUnlock_playerCaseId_locationId_key" ON "PlayerLocationUnlock"("playerCaseId", "locationId");

-- AddForeignKey
ALTER TABLE "PlayerLocationUnlock" ADD CONSTRAINT "PlayerLocationUnlock_playerCaseId_fkey" FOREIGN KEY ("playerCaseId") REFERENCES "PlayerCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerLocationUnlock" ADD CONSTRAINT "PlayerLocationUnlock_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "CaseLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
