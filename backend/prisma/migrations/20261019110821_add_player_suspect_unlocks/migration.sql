-- CreateTable
CREATE TABLE "PlayerSuspectUnlock" (
    "id" UUID NOT NULL,
    "playerCaseId" UUID NOT NULL,
    "suspectId" UUID NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" VARCHAR(255) NOT NULL,

    CONSTRAINT "PlayerSuspectUnlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlayerSuspectUnlock_playerCaseId_idx" ON "PlayerSuspectUnlock"("playerCaseId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerSuspectUnlock_playerCaseId_suspectId_key" ON "PlayerSuspectUnlock"("playerCaseId", "suspectId");

-- AddForeignKey
ALTER TABLE "PlayerSuspectUnlock" ADD CONSTRAINT "PlayerSuspectUnlock_playerCaseId_fkey" FOREIGN KEY ("playerCaseId") REFERENCES "PlayerCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerSuspectUnlock" ADD CONSTRAINT "PlayerSuspectUnlock_suspectId_fkey" FOREIGN KEY ("suspectId") REFERENCES "CaseSuspect"("id") ON DELETE CASCADE ON UPDATE CASCADE;
