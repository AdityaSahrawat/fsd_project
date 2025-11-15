-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "completionProof" TEXT[] DEFAULT ARRAY[]::TEXT[];
