-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tapGraphEnabled" BOOLEAN;

-- CreateTable
CREATE TABLE "TapGraphEdge" (
    "id" TEXT NOT NULL,
    "tapSenderId" TEXT,
    "tapReceiverId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    -- TODO: Add json blob, starting with PSISize, for extent of connection.
    CONSTRAINT "TapGraphEdge_pkey" PRIMARY KEY ("id")
);
