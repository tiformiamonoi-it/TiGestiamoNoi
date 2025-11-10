-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'TUTOR', 'GENITORE');

-- CreateEnum
CREATE TYPE "PackageType" AS ENUM ('ORE', 'MENSILE');

-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('INDIVIDUALE', 'GRUPPO', 'MAXI_GRUPPO');

-- CreateEnum
CREATE TYPE "LessonStatus" AS ENUM ('PIANIFICATA', 'COMPLETATA', 'ANNULLATA', 'RECUPERO');

-- CreateEnum
CREATE TYPE "AccountingType" AS ENUM ('ENTRATA', 'USCITA', 'NOTA');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'TUTOR',
    "phone" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutor_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tariffa1to1" DECIMAL(10,2) NOT NULL DEFAULT 15.00,
    "tariffaGruppo" DECIMAL(10,2) NOT NULL DEFAULT 10.00,
    "tariffaMaxiGruppo" DECIMAL(10,2) NOT NULL DEFAULT 7.00,
    "disponibilita" JSONB,
    "materie" TEXT[],
    "noteInterne" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "parentName" TEXT,
    "parentEmail" TEXT,
    "parentPhone" TEXT,
    "classe" TEXT,
    "scuola" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packages" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "tipo" "PackageType" NOT NULL DEFAULT 'ORE',
    "oreAcquistate" DECIMAL(10,2) NOT NULL,
    "oreResiduo" DECIMAL(10,2) NOT NULL,
    "giorniAcquistati" INTEGER,
    "giorniResiduo" INTEGER,
    "orarioGiornaliero" DECIMAL(10,2),
    "prezzoTotale" DECIMAL(10,2) NOT NULL,
    "dataPagamento" TIMESTAMP(3) NOT NULL,
    "metodoPagamento" TEXT,
    "dataInizio" TIMESTAMP(3) NOT NULL,
    "dataScadenza" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "oraInizio" TEXT NOT NULL,
    "oraFine" TEXT NOT NULL,
    "durata" DECIMAL(10,2) NOT NULL,
    "tipo" "LessonType" NOT NULL,
    "costoTutor" DECIMAL(10,2) NOT NULL,
    "tariffaOraria" DECIMAL(10,2) NOT NULL,
    "status" "LessonStatus" NOT NULL DEFAULT 'PIANIFICATA',
    "argomenti" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_entries" (
    "id" TEXT NOT NULL,
    "tipo" "AccountingType" NOT NULL,
    "importo" DECIMAL(10,2) NOT NULL,
    "descrizione" TEXT NOT NULL,
    "categoria" TEXT,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "packageId" TEXT,
    "lessonId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounting_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tutor_profiles_userId_key" ON "tutor_profiles"("userId");

-- CreateIndex
CREATE INDEX "students_lastName_firstName_idx" ON "students"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "packages_studentId_active_idx" ON "packages"("studentId", "active");

-- CreateIndex
CREATE INDEX "lessons_data_tutorId_idx" ON "lessons"("data", "tutorId");

-- CreateIndex
CREATE INDEX "lessons_studentId_data_idx" ON "lessons"("studentId", "data");

-- CreateIndex
CREATE INDEX "accounting_entries_data_tipo_idx" ON "accounting_entries"("data", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "system_configs_key_key" ON "system_configs"("key");

-- AddForeignKey
ALTER TABLE "tutor_profiles" ADD CONSTRAINT "tutor_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packages" ADD CONSTRAINT "packages_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_entries" ADD CONSTRAINT "accounting_entries_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_entries" ADD CONSTRAINT "accounting_entries_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
