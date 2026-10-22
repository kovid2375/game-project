-- CreateTable
CREATE TABLE "PlayerHint" (
    "id" UUID NOT NULL,
    "playerCaseId" UUID NOT NULL,
    "caseHintId" UUID NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerHint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlayerHint_playerCaseId_idx" ON "PlayerHint"("playerCaseId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerHint_playerCaseId_caseHintId_key" ON "PlayerHint"("playerCaseId", "caseHintId");

-- AddForeignKey
ALTER TABLE "PlayerHint" ADD CONSTRAINT "PlayerHint_playerCaseId_fkey" FOREIGN KEY ("playerCaseId") REFERENCES "PlayerCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerHint" ADD CONSTRAINT "PlayerHint_caseHintId_fkey" FOREIGN KEY ("caseHintId") REFERENCES "CaseHint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
