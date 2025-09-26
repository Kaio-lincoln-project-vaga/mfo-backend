/*
  Warnings:

  - You are about to drop the `Simulation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."Simulation";

-- CreateTable
CREATE TABLE "public"."simulations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "realRate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "simulations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."financial_allocations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "simulationId" TEXT NOT NULL,

    CONSTRAINT "financial_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."real_estate_allocations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "simulationId" TEXT NOT NULL,

    CONSTRAINT "real_estate_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."movements" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "frequency" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "simulationId" TEXT NOT NULL,

    CONSTRAINT "movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."insurances" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "monthlyFee" DOUBLE PRECISION NOT NULL,
    "insuredValue" DOUBLE PRECISION NOT NULL,
    "simulationId" TEXT NOT NULL,

    CONSTRAINT "insurances_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."financial_allocations" ADD CONSTRAINT "financial_allocations_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "public"."simulations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."real_estate_allocations" ADD CONSTRAINT "real_estate_allocations_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "public"."simulations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."movements" ADD CONSTRAINT "movements_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "public"."simulations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."insurances" ADD CONSTRAINT "insurances_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "public"."simulations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
