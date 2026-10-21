-- CreateTable
CREATE TABLE "InterviewResponseUnlock" (
    "id" UUID NOT NULL,
    "responseId" UUID NOT NULL,
    "clueId" UUID,
    "documentId" UUID,
    "locationId" UUID,
    "suspectId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewResponseUnlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InterviewResponseUnlock_responseId_idx" ON "InterviewResponseUnlock"("responseId");

-- AddForeignKey
ALTER TABLE "InterviewResponseUnlock" ADD CONSTRAINT "InterviewResponseUnlock_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "InterviewResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewResponseUnlock" ADD CONSTRAINT "InterviewResponseUnlock_clueId_fkey" FOREIGN KEY ("clueId") REFERENCES "CaseClue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewResponseUnlock" ADD CONSTRAINT "InterviewResponseUnlock_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "CaseDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewResponseUnlock" ADD CONSTRAINT "InterviewResponseUnlock_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "CaseLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewResponseUnlock" ADD CONSTRAINT "InterviewResponseUnlock_suspectId_fkey" FOREIGN KEY ("suspectId") REFERENCES "CaseSuspect"("id") ON DELETE CASCADE ON UPDATE CASCADE;
