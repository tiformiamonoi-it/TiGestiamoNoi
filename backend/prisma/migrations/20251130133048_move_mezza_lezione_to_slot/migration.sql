/*
  Warnings:

  - You are about to drop the column `mezzaLezione` on the `lesson_students` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tutorPaymentId]` on the table `accounting_entries` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TutorPaymentStatus" AS ENUM ('PAGATO', 'PARZIALE', 'PRO_BONO');

-- AlterTable
ALTER TABLE "accounting_entries" ADD COLUMN     "tutorPaymentId" TEXT;

-- AlterTable
ALTER TABLE "lesson_students" DROP COLUMN "mezzaLezione";

-- AlterTable
ALTER TABLE "time_slots" ADD COLUMN     "mezza_ora" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "tutor_payments" ADD COLUMN     "status" "TutorPaymentStatus" NOT NULL DEFAULT 'PAGATO';

-- CreateIndex
CREATE UNIQUE INDEX "accounting_entries_tutorPaymentId_key" ON "accounting_entries"("tutorPaymentId");

-- AddForeignKey
ALTER TABLE "accounting_entries" ADD CONSTRAINT "accounting_entries_tutorPaymentId_fkey" FOREIGN KEY ("tutorPaymentId") REFERENCES "tutor_payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
