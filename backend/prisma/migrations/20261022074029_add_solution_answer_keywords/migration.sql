-- AlterTable
ALTER TABLE "CaseSolution" ADD COLUMN     "methodKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "motiveKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[];
