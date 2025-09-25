/*
  Warnings:

  - You are about to drop the `teste` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."teste";

-- CreateTable
CREATE TABLE "public"."Simulation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "realRate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Simulation_pkey" PRIMARY KEY ("id")
);
