/*
  Warnings:

  - The values [INDIVIDUALE,MAXI_GRUPPO] on the enum `LessonType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `costoTutor` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `packageId` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `lessons` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LessonType_new" AS ENUM ('SINGOLA', 'GRUPPO', 'MAXI');
ALTER TABLE "lessons" ALTER COLUMN "tipo" TYPE "LessonType_new" USING ("tipo"::text::"LessonType_new");
ALTER TYPE "LessonType" RENAME TO "LessonType_old";
ALTER TYPE "LessonType_new" RENAME TO "LessonType";
DROP TYPE "LessonType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_packageId_fkey";

-- DropForeignKey
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_studentId_fkey";

-- DropIndex
DROP INDEX "lessons_studentId_data_idx";

-- AlterTable
ALTER TABLE "lessons" DROP COLUMN "costoTutor",
DROP COLUMN "packageId",
DROP COLUMN "studentId",
ADD COLUMN     "compensoTutor" DECIMAL(10,2),
ADD COLUMN     "forzaGruppo" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "tipo" SET DEFAULT 'SINGOLA';

-- CreateTable
CREATE TABLE "lesson_students" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "mezzaLezione" BOOLEAN NOT NULL DEFAULT false,
    "oreScalate" DECIMAL(10,2) NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lesson_students_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lesson_students_studentId_idx" ON "lesson_students"("studentId");

-- CreateIndex
CREATE INDEX "lesson_students_packageId_idx" ON "lesson_students"("packageId");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_students_lessonId_studentId_key" ON "lesson_students"("lessonId", "studentId");

-- AddForeignKey
ALTER TABLE "lesson_students" ADD CONSTRAINT "lesson_students_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_students" ADD CONSTRAINT "lesson_students_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_students" ADD CONSTRAINT "lesson_students_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
