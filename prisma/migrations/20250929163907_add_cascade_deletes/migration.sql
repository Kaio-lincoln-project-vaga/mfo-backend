/*
  Warnings:

  - You are about to drop the `financial_allocations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `insurances` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `movements` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `real_estate_allocations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `simulations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."financial_allocations" DROP CONSTRAINT "financial_allocations_simulationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."insurances" DROP CONSTRAINT "insurances_simulationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."movements" DROP CONSTRAINT "movements_simulationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."real_estate_allocations" DROP CONSTRAINT "real_estate_allocations_simulationId_fkey";

-- DropTable
DROP TABLE "public"."financial_allocations";

-- DropTable
DROP TABLE "public"."insurances";

-- DropTable
DROP TABLE "public"."movements";

-- DropTable
DROP TABLE "public"."real_estate_allocations";

-- DropTable
DROP TABLE "public"."simulations";

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

-- CreateTable
CREATE TABLE "public"."FinancialAllocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "simulationId" TEXT NOT NULL,

    CONSTRAINT "FinancialAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ImmobilizedAllocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "simulationId" TEXT NOT NULL,

    CONSTRAINT "ImmobilizedAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Movement" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "frequency" TEXT NOT NULL,
    "simulationId" TEXT NOT NULL,

    CONSTRAINT "Movement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Insurance" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "premium" DOUBLE PRECISION NOT NULL,
    "coverage" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "simulationId" TEXT NOT NULL,

    CONSTRAINT "Insurance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."FinancialAllocation" ADD CONSTRAINT "FinancialAllocation_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "public"."Simulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImmobilizedAllocation" ADD CONSTRAINT "ImmobilizedAllocation_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "public"."Simulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Movement" ADD CONSTRAINT "Movement_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "public"."Simulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Insurance" ADD CONSTRAINT "Insurance_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "public"."Simulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
