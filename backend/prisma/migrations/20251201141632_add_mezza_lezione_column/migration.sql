/*
  Warnings:

  - You are about to drop the column `mezza_ora` on the `time_slots` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "lesson_students" ADD COLUMN     "mezzaLezione" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "time_slots" DROP COLUMN "mezza_ora";
