/*
  Warnings:

  - A unique constraint covering the columns `[reimbursementId]` on the table `accounting_entries` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ReimbursementStatus" AS ENUM ('DA_PAGARE', 'PARZIALE', 'PAGATO');

-- AlterTable
ALTER TABLE "accounting_entries" ADD COLUMN     "reimbursementId" TEXT;

-- CreateTable
CREATE TABLE "tutor_reimbursements" (
    "id" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "importo" DECIMAL(10,2) NOT NULL,
    "importoPagato" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "descrizione" TEXT NOT NULL,
    "dataRichiesta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataPagamento" TIMESTAMP(3),
    "stato" "ReimbursementStatus" NOT NULL DEFAULT 'DA_PAGARE',
    "metodo" "PaymentMethod",
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutor_reimbursements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tutor_reimbursements_tutorId_stato_idx" ON "tutor_reimbursements"("tutorId", "stato");

-- CreateIndex
CREATE UNIQUE INDEX "accounting_entries_reimbursementId_key" ON "accounting_entries"("reimbursementId");

-- AddForeignKey
ALTER TABLE "accounting_entries" ADD CONSTRAINT "accounting_entries_reimbursementId_fkey" FOREIGN KEY ("reimbursementId") REFERENCES "tutor_reimbursements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutor_reimbursements" ADD CONSTRAINT "tutor_reimbursements_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
