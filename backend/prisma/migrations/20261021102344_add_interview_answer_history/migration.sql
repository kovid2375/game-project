-- CreateTable
CREATE TABLE "InterviewAnswer" (
    "id" UUID NOT NULL,
    "interviewVisitId" UUID NOT NULL,
    "threadId" UUID NOT NULL,
    "responseId" UUID NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InterviewAnswer_interviewVisitId_answeredAt_idx" ON "InterviewAnswer"("interviewVisitId", "answeredAt");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewAnswer_interviewVisitId_threadId_key" ON "InterviewAnswer"("interviewVisitId", "threadId");

-- AddForeignKey
ALTER TABLE "InterviewAnswer" ADD CONSTRAINT "InterviewAnswer_interviewVisitId_fkey" FOREIGN KEY ("interviewVisitId") REFERENCES "InterviewVisit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewAnswer" ADD CONSTRAINT "InterviewAnswer_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "InterviewThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewAnswer" ADD CONSTRAINT "InterviewAnswer_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "InterviewResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
