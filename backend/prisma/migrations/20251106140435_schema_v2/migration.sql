/*
  Warnings:

  - You are about to drop the column `argomenti` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `durata` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `oraFine` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `oraInizio` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `tariffaOraria` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `packages` table. All the data in the column will be lost.
  - You are about to drop the column `dataPagamento` on the `packages` table. All the data in the column will be lost.
  - You are about to drop the column `metodoPagamento` on the `packages` table. All the data in the column will be lost.
  - You are about to drop the column `disponibilita` on the `tutor_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `tariffa1to1` on the `tutor_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `tariffaGruppo` on the `tutor_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `tariffaMaxiGruppo` on the `tutor_profiles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[paymentId]` on the table `accounting_entries` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `timeSlotId` to the `lessons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `importoResiduo` to the `packages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nome` to the `packages` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PackageStatus" AS ENUM ('ATTIVO', 'SCADUTO', 'ESAURITO', 'SOSPESO', 'COMPLETATO');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('ACCONTO', 'SALDO', 'RATA', 'INTEGRAZIONE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CONTANTI', 'BONIFICO', 'POS', 'ASSEGNO', 'ALTRO');

-- DropIndex
DROP INDEX "packages_studentId_active_idx";

-- AlterTable
ALTER TABLE "accounting_entries" ADD COLUMN     "paymentId" TEXT;

-- AlterTable
ALTER TABLE "lessons" DROP COLUMN "argomenti",
DROP COLUMN "durata",
DROP COLUMN "oraFine",
DROP COLUMN "oraInizio",
DROP COLUMN "status",
DROP COLUMN "tariffaOraria",
ADD COLUMN     "timeSlotId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "packages" DROP COLUMN "active",
DROP COLUMN "dataPagamento",
DROP COLUMN "metodoPagamento",
ADD COLUMN     "importoPagato" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "importoResiduo" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "nome" TEXT NOT NULL,
ADD COLUMN     "standardPackageId" TEXT,
ADD COLUMN     "stati" "PackageStatus"[] DEFAULT ARRAY['ATTIVO']::"PackageStatus"[];

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "parentCF" TEXT,
ADD COLUMN     "parentCap" TEXT,
ADD COLUMN     "parentCitta" TEXT,
ADD COLUMN     "parentIndirizzo" TEXT,
ADD COLUMN     "parentPIva" TEXT;

-- AlterTable
ALTER TABLE "system_configs" ADD COLUMN     "category" TEXT;

-- AlterTable
ALTER TABLE "tutor_profiles" DROP COLUMN "disponibilita",
DROP COLUMN "tariffa1to1",
DROP COLUMN "tariffaGruppo",
DROP COLUMN "tariffaMaxiGruppo",
ADD COLUMN     "cap" TEXT,
ADD COLUMN     "citta" TEXT,
ADD COLUMN     "codiceFiscale" TEXT,
ADD COLUMN     "indirizzo" TEXT,
ADD COLUMN     "partitaIva" TEXT;

-- DropEnum
DROP TYPE "LessonStatus";

-- CreateTable
CREATE TABLE "standard_packages" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descrizione" TEXT,
    "tipo" "PackageType" NOT NULL DEFAULT 'ORE',
    "categoria" TEXT NOT NULL,
    "oreIncluse" DECIMAL(10,2) NOT NULL,
    "giorniInclusi" INTEGER,
    "orarioGiornaliero" DECIMAL(10,2),
    "prezzoStandard" DECIMAL(10,2) NOT NULL,
    "durataGiorni" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "standard_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "importo" DECIMAL(10,2) NOT NULL,
    "tipoPagamento" "PaymentType" NOT NULL DEFAULT 'ACCONTO',
    "metodoPagamento" "PaymentMethod" NOT NULL DEFAULT 'CONTANTI',
    "dataPagamento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "riferimento" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_slots" (
    "id" TEXT NOT NULL,
    "oraInizio" TEXT NOT NULL,
    "oraFine" TEXT NOT NULL,
    "descrizione" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "standard_packages_categoria_tipo_idx" ON "standard_packages"("categoria", "tipo");

-- CreateIndex
CREATE INDEX "payments_packageId_dataPagamento_idx" ON "payments"("packageId", "dataPagamento");

-- CreateIndex
CREATE UNIQUE INDEX "time_slots_oraInizio_oraFine_key" ON "time_slots"("oraInizio", "oraFine");

-- CreateIndex
CREATE UNIQUE INDEX "accounting_entries_paymentId_key" ON "accounting_entries"("paymentId");

-- CreateIndex
CREATE INDEX "packages_studentId_stati_idx" ON "packages"("studentId", "stati");

-- CreateIndex
CREATE INDEX "system_configs_category_idx" ON "system_configs"("category");

-- AddForeignKey
ALTER TABLE "packages" ADD CONSTRAINT "packages_standardPackageId_fkey" FOREIGN KEY ("standardPackageId") REFERENCES "standard_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_timeSlotId_fkey" FOREIGN KEY ("timeSlotId") REFERENCES "time_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_entries" ADD CONSTRAINT "accounting_entries_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
