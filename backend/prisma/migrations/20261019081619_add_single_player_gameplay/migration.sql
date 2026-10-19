-- CreateEnum
CREATE TYPE "PlayerCaseStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "DiscoveryType" AS ENUM ('CLUE', 'DOCUMENT', 'INTERVIEW_RESPONSE');

-- CreateEnum
CREATE TYPE "SuspectAssessmentStatus" AS ENUM ('SUSPICIOUS', 'CLEARED', 'UNSURE', 'RULED_OUT');

-- CreateEnum
CREATE TYPE "AccusationStatus" AS ENUM ('CORRECT', 'PARTIALLY_CORRECT', 'INCORRECT');

-- CreateTable
CREATE TABLE "CaseVictim" (
    "id" UUID NOT NULL,
    "gameCaseId" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "age" INTEGER NOT NULL,
    "occupation" VARCHAR(120) NOT NULL,
    "dateOfDeath" TIMESTAMP(3) NOT NULL,
    "placeOfDeath" VARCHAR(250) NOT NULL,
    "biography" VARCHAR(3000),

    CONSTRAINT "CaseVictim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoliceReport" (
    "id" UUID NOT NULL,
    "gameCaseId" UUID NOT NULL,
    "timeOfDeathStart" TIMESTAMP(3),
    "timeOfDeathEnd" TIMESTAMP(3),
    "causeOfDeath" VARCHAR(1000) NOT NULL,
    "officerNotes" VARCHAR(5000) NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PoliceReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseStatement" (
    "id" UUID NOT NULL,
    "gameCaseId" UUID NOT NULL,
    "speakerName" VARCHAR(120) NOT NULL,
    "content" VARCHAR(4000) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isInitial" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CaseStatement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseSuspect" (
    "id" UUID NOT NULL,
    "gameCaseId" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "photoUrl" VARCHAR(2048),
    "relationship" VARCHAR(250) NOT NULL,
    "description" VARCHAR(1000) NOT NULL,
    "claimedAlibi" VARCHAR(2000) NOT NULL,
    "connections" VARCHAR(3000) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CaseSuspect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewThread" (
    "id" UUID NOT NULL,
    "suspectId" UUID NOT NULL,
    "topic" VARCHAR(160) NOT NULL,
    "question" VARCHAR(1000) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "visitNumber" INTEGER NOT NULL DEFAULT 1,
    "isInitiallyAvailable" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "InterviewThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewResponse" (
    "id" UUID NOT NULL,
    "threadId" UUID NOT NULL,
    "responseText" VARCHAR(5000) NOT NULL,
    "isNervous" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "internalNotes" VARCHAR(2000),

    CONSTRAINT "InterviewResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseLocation" (
    "id" UUID NOT NULL,
    "gameCaseId" UUID NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "description" VARCHAR(3000) NOT NULL,
    "imageUrl" VARCHAR(2048),
    "mapX" DOUBLE PRECISION,
    "mapY" DOUBLE PRECISION,
    "isInitiallyOpen" BOOLEAN NOT NULL DEFAULT false,
    "isDeadEnd" BOOLEAN NOT NULL DEFAULT false,
    "searchActionPointCost" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CaseLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseClue" (
    "id" UUID NOT NULL,
    "locationId" UUID NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "description" VARCHAR(3000) NOT NULL,
    "imageUrl" VARCHAR(2048),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CaseClue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseDocument" (
    "id" UUID NOT NULL,
    "locationId" UUID NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "description" VARCHAR(2000) NOT NULL,
    "content" VARCHAR(10000),
    "fileUrl" VARCHAR(2048),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CaseDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseLead" (
    "id" UUID NOT NULL,
    "sourceLocationId" UUID NOT NULL,
    "destinationLocationId" UUID NOT NULL,
    "requiredClueId" UUID,
    "title" VARCHAR(160) NOT NULL,
    "description" VARCHAR(1000) NOT NULL,

    CONSTRAINT "CaseLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseHint" (
    "id" UUID NOT NULL,
    "gameCaseId" UUID NOT NULL,
    "hintNumber" INTEGER NOT NULL,
    "content" VARCHAR(2000) NOT NULL,
    "scorePenalty" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CaseHint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerCase" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "gameCaseId" UUID NOT NULL,
    "status" "PlayerCaseStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "caseFileOpenedAt" TIMESTAMP(3),
    "currentPhase" INTEGER NOT NULL DEFAULT 1,
    "actionPoints" INTEGER NOT NULL DEFAULT 10,
    "hintsUsed" INTEGER NOT NULL DEFAULT 0,
    "attemptsUsed" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerDiscovery" (
    "id" UUID NOT NULL,
    "playerCaseId" UUID NOT NULL,
    "type" "DiscoveryType" NOT NULL,
    "clueId" UUID,
    "documentId" UUID,
    "interviewResponseId" UUID,
    "discoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerDiscovery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerLocationVisit" (
    "id" UUID NOT NULL,
    "playerCaseId" UUID NOT NULL,
    "locationId" UUID NOT NULL,
    "searchedAt" TIMESTAMP(3),
    "visitCount" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "PlayerLocationVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewVisit" (
    "id" UUID NOT NULL,
    "playerCaseId" UUID NOT NULL,
    "suspectId" UUID NOT NULL,
    "visitNumber" INTEGER NOT NULL DEFAULT 1,
    "questionsUsed" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "InterviewVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuspectAssessment" (
    "id" UUID NOT NULL,
    "playerCaseId" UUID NOT NULL,
    "suspectId" UUID NOT NULL,
    "status" "SuspectAssessmentStatus" NOT NULL DEFAULT 'UNSURE',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuspectAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotebookEntry" (
    "id" UUID NOT NULL,
    "playerCaseId" UUID NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "content" VARCHAR(5000) NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotebookEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TheoryDraft" (
    "id" UUID NOT NULL,
    "playerCaseId" UUID NOT NULL,
    "suspectId" UUID,
    "motive" VARCHAR(500),
    "method" VARCHAR(500),
    "explanation" VARCHAR(5000),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TheoryDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TheoryEvidence" (
    "id" UUID NOT NULL,
    "theoryDraftId" UUID NOT NULL,
    "clueId" UUID NOT NULL,

    CONSTRAINT "TheoryEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseAttempt" (
    "id" UUID NOT NULL,
    "playerCaseId" UUID NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "suspectId" UUID,
    "motive" VARCHAR(500) NOT NULL,
    "method" VARCHAR(500) NOT NULL,
    "explanation" VARCHAR(5000) NOT NULL,
    "status" "AccusationStatus" NOT NULL,
    "scoreAwarded" INTEGER NOT NULL DEFAULT 0,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseSolution" (
    "id" UUID NOT NULL,
    "gameCaseId" UUID NOT NULL,
    "correctSuspectId" UUID NOT NULL,
    "motive" VARCHAR(2000) NOT NULL,
    "method" VARCHAR(2000) NOT NULL,
    "explanation" VARCHAR(5000) NOT NULL,
    "epilogue" VARCHAR(5000) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseSolution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CaseVictim_gameCaseId_key" ON "CaseVictim"("gameCaseId");

-- CreateIndex
CREATE UNIQUE INDEX "PoliceReport_gameCaseId_key" ON "PoliceReport"("gameCaseId");

-- CreateIndex
CREATE INDEX "CaseStatement_gameCaseId_sortOrder_idx" ON "CaseStatement"("gameCaseId", "sortOrder");

-- CreateIndex
CREATE INDEX "CaseSuspect_gameCaseId_sortOrder_idx" ON "CaseSuspect"("gameCaseId", "sortOrder");

-- CreateIndex
CREATE INDEX "InterviewThread_suspectId_sortOrder_idx" ON "InterviewThread"("suspectId", "sortOrder");

-- CreateIndex
CREATE INDEX "InterviewResponse_threadId_sortOrder_idx" ON "InterviewResponse"("threadId", "sortOrder");

-- CreateIndex
CREATE INDEX "CaseLocation_gameCaseId_sortOrder_idx" ON "CaseLocation"("gameCaseId", "sortOrder");

-- CreateIndex
CREATE INDEX "CaseClue_locationId_sortOrder_idx" ON "CaseClue"("locationId", "sortOrder");

-- CreateIndex
CREATE INDEX "CaseDocument_locationId_sortOrder_idx" ON "CaseDocument"("locationId", "sortOrder");

-- CreateIndex
CREATE INDEX "CaseLead_sourceLocationId_idx" ON "CaseLead"("sourceLocationId");

-- CreateIndex
CREATE INDEX "CaseLead_destinationLocationId_idx" ON "CaseLead"("destinationLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseHint_gameCaseId_hintNumber_key" ON "CaseHint"("gameCaseId", "hintNumber");

-- CreateIndex
CREATE INDEX "PlayerCase_userId_status_idx" ON "PlayerCase"("userId", "status");

-- CreateIndex
CREATE INDEX "PlayerCase_gameCaseId_status_idx" ON "PlayerCase"("gameCaseId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerCase_userId_gameCaseId_key" ON "PlayerCase"("userId", "gameCaseId");

-- CreateIndex
CREATE INDEX "PlayerDiscovery_playerCaseId_discoveredAt_idx" ON "PlayerDiscovery"("playerCaseId", "discoveredAt");

-- CreateIndex
CREATE INDEX "PlayerLocationVisit_playerCaseId_idx" ON "PlayerLocationVisit"("playerCaseId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerLocationVisit_playerCaseId_locationId_key" ON "PlayerLocationVisit"("playerCaseId", "locationId");

-- CreateIndex
CREATE INDEX "InterviewVisit_playerCaseId_suspectId_idx" ON "InterviewVisit"("playerCaseId", "suspectId");

-- CreateIndex
CREATE UNIQUE INDEX "SuspectAssessment_playerCaseId_suspectId_key" ON "SuspectAssessment"("playerCaseId", "suspectId");

-- CreateIndex
CREATE INDEX "NotebookEntry_playerCaseId_updatedAt_idx" ON "NotebookEntry"("playerCaseId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "TheoryDraft_playerCaseId_key" ON "TheoryDraft"("playerCaseId");

-- CreateIndex
CREATE UNIQUE INDEX "TheoryEvidence_theoryDraftId_clueId_key" ON "TheoryEvidence"("theoryDraftId", "clueId");

-- CreateIndex
CREATE INDEX "CaseAttempt_playerCaseId_submittedAt_idx" ON "CaseAttempt"("playerCaseId", "submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CaseAttempt_playerCaseId_attemptNumber_key" ON "CaseAttempt"("playerCaseId", "attemptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CaseSolution_gameCaseId_key" ON "CaseSolution"("gameCaseId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseSolution_correctSuspectId_key" ON "CaseSolution"("correctSuspectId");

-- AddForeignKey
ALTER TABLE "CaseVictim" ADD CONSTRAINT "CaseVictim_gameCaseId_fkey" FOREIGN KEY ("gameCaseId") REFERENCES "GameCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliceReport" ADD CONSTRAINT "PoliceReport_gameCaseId_fkey" FOREIGN KEY ("gameCaseId") REFERENCES "GameCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseStatement" ADD CONSTRAINT "CaseStatement_gameCaseId_fkey" FOREIGN KEY ("gameCaseId") REFERENCES "GameCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseSuspect" ADD CONSTRAINT "CaseSuspect_gameCaseId_fkey" FOREIGN KEY ("gameCaseId") REFERENCES "GameCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewThread" ADD CONSTRAINT "InterviewThread_suspectId_fkey" FOREIGN KEY ("suspectId") REFERENCES "CaseSuspect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewResponse" ADD CONSTRAINT "InterviewResponse_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "InterviewThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseLocation" ADD CONSTRAINT "CaseLocation_gameCaseId_fkey" FOREIGN KEY ("gameCaseId") REFERENCES "GameCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseClue" ADD CONSTRAINT "CaseClue_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "CaseLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseDocument" ADD CONSTRAINT "CaseDocument_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "CaseLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseLead" ADD CONSTRAINT "CaseLead_sourceLocationId_fkey" FOREIGN KEY ("sourceLocationId") REFERENCES "CaseLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseLead" ADD CONSTRAINT "CaseLead_destinationLocationId_fkey" FOREIGN KEY ("destinationLocationId") REFERENCES "CaseLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseLead" ADD CONSTRAINT "CaseLead_requiredClueId_fkey" FOREIGN KEY ("requiredClueId") REFERENCES "CaseClue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseHint" ADD CONSTRAINT "CaseHint_gameCaseId_fkey" FOREIGN KEY ("gameCaseId") REFERENCES "GameCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerCase" ADD CONSTRAINT "PlayerCase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerCase" ADD CONSTRAINT "PlayerCase_gameCaseId_fkey" FOREIGN KEY ("gameCaseId") REFERENCES "GameCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerDiscovery" ADD CONSTRAINT "PlayerDiscovery_playerCaseId_fkey" FOREIGN KEY ("playerCaseId") REFERENCES "PlayerCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerDiscovery" ADD CONSTRAINT "PlayerDiscovery_clueId_fkey" FOREIGN KEY ("clueId") REFERENCES "CaseClue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerDiscovery" ADD CONSTRAINT "PlayerDiscovery_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "CaseDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerDiscovery" ADD CONSTRAINT "PlayerDiscovery_interviewResponseId_fkey" FOREIGN KEY ("interviewResponseId") REFERENCES "InterviewResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerLocationVisit" ADD CONSTRAINT "PlayerLocationVisit_playerCaseId_fkey" FOREIGN KEY ("playerCaseId") REFERENCES "PlayerCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerLocationVisit" ADD CONSTRAINT "PlayerLocationVisit_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "CaseLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewVisit" ADD CONSTRAINT "InterviewVisit_suspectId_fkey" FOREIGN KEY ("suspectId") REFERENCES "CaseSuspect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewVisit" ADD CONSTRAINT "InterviewVisit_playerCaseId_fkey" FOREIGN KEY ("playerCaseId") REFERENCES "PlayerCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuspectAssessment" ADD CONSTRAINT "SuspectAssessment_playerCaseId_fkey" FOREIGN KEY ("playerCaseId") REFERENCES "PlayerCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuspectAssessment" ADD CONSTRAINT "SuspectAssessment_suspectId_fkey" FOREIGN KEY ("suspectId") REFERENCES "CaseSuspect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotebookEntry" ADD CONSTRAINT "NotebookEntry_playerCaseId_fkey" FOREIGN KEY ("playerCaseId") REFERENCES "PlayerCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TheoryDraft" ADD CONSTRAINT "TheoryDraft_playerCaseId_fkey" FOREIGN KEY ("playerCaseId") REFERENCES "PlayerCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TheoryEvidence" ADD CONSTRAINT "TheoryEvidence_theoryDraftId_fkey" FOREIGN KEY ("theoryDraftId") REFERENCES "TheoryDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TheoryEvidence" ADD CONSTRAINT "TheoryEvidence_clueId_fkey" FOREIGN KEY ("clueId") REFERENCES "CaseClue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseAttempt" ADD CONSTRAINT "CaseAttempt_playerCaseId_fkey" FOREIGN KEY ("playerCaseId") REFERENCES "PlayerCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseAttempt" ADD CONSTRAINT "CaseAttempt_suspectId_fkey" FOREIGN KEY ("suspectId") REFERENCES "CaseSuspect"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseSolution" ADD CONSTRAINT "CaseSolution_gameCaseId_fkey" FOREIGN KEY ("gameCaseId") REFERENCES "GameCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseSolution" ADD CONSTRAINT "CaseSolution_correctSuspectId_fkey" FOREIGN KEY ("correctSuspectId") REFERENCES "CaseSuspect"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
