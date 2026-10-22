/*
  Warnings:

  - A unique constraint covering the columns `[playerCaseId,clueId]` on the table `PlayerDiscovery` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[playerCaseId,documentId]` on the table `PlayerDiscovery` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[playerCaseId,interviewResponseId]` on the table `PlayerDiscovery` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PlayerDiscovery_playerCaseId_clueId_key" ON "PlayerDiscovery"("playerCaseId", "clueId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerDiscovery_playerCaseId_documentId_key" ON "PlayerDiscovery"("playerCaseId", "documentId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerDiscovery_playerCaseId_interviewResponseId_key" ON "PlayerDiscovery"("playerCaseId", "interviewResponseId");
