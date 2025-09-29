/*
  Warnings:

  - You are about to drop the column `date` on the `FinancialAllocation` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `FinancialAllocation` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `ImmobilizedAllocation` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `ImmobilizedAllocation` table. All the data in the column will be lost.
  - Added the required column `durationMonths` to the `Insurance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Insurance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Movement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."FinancialAllocation" DROP COLUMN "date",
DROP COLUMN "value",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."ImmobilizedAllocation" DROP COLUMN "date",
DROP COLUMN "value",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "financingDownPayment" DOUBLE PRECISION,
ADD COLUMN     "financingInstallments" INTEGER,
ADD COLUMN     "financingInterestRate" DOUBLE PRECISION,
ADD COLUMN     "financingStartDate" TIMESTAMP(3),
ADD COLUMN     "hasFinancing" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."Insurance" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "durationMonths" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Movement" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Simulation" ADD COLUMN     "isLegacy" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSituacaoAtual" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentSimulationId" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "public"."FinancialAllocationHistory" (
    "id" TEXT NOT NULL,
    "allocationId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialAllocationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ImmobilizedAllocationHistory" (
    "id" TEXT NOT NULL,
    "allocationId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImmobilizedAllocationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FinancialAllocationHistory_allocationId_date_idx" ON "public"."FinancialAllocationHistory"("allocationId", "date");

-- CreateIndex
CREATE INDEX "ImmobilizedAllocationHistory_allocationId_date_idx" ON "public"."ImmobilizedAllocationHistory"("allocationId", "date");

-- CreateIndex
CREATE INDEX "Insurance_simulationId_startDate_idx" ON "public"."Insurance"("simulationId", "startDate");

-- CreateIndex
CREATE INDEX "Movement_simulationId_type_startDate_idx" ON "public"."Movement"("simulationId", "type", "startDate");

-- CreateIndex
CREATE INDEX "Simulation_name_version_idx" ON "public"."Simulation"("name", "version");

-- AddForeignKey
ALTER TABLE "public"."FinancialAllocationHistory" ADD CONSTRAINT "FinancialAllocationHistory_allocationId_fkey" FOREIGN KEY ("allocationId") REFERENCES "public"."FinancialAllocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImmobilizedAllocationHistory" ADD CONSTRAINT "ImmobilizedAllocationHistory_allocationId_fkey" FOREIGN KEY ("allocationId") REFERENCES "public"."ImmobilizedAllocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
