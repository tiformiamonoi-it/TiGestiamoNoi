-- DropIndex
DROP INDEX "accounting_entries_data_tipo_idx";

-- DropIndex
DROP INDEX "lesson_students_packageId_idx";

-- DropIndex
DROP INDEX "students_lastName_firstName_idx";

-- CreateIndex
CREATE INDEX "accounting_entries_tipo_data_idx" ON "accounting_entries"("tipo", "data" DESC);

-- CreateIndex
CREATE INDEX "accounting_entries_categoria_idx" ON "accounting_entries"("categoria");

-- CreateIndex
CREATE INDEX "accounting_entries_metodoPagamento_idx" ON "accounting_entries"("metodoPagamento");

-- CreateIndex
CREATE INDEX "lesson_students_packageId_studentId_idx" ON "lesson_students"("packageId", "studentId");

-- CreateIndex
CREATE INDEX "lessons_tutorId_data_idx" ON "lessons"("tutorId", "data" DESC);

-- CreateIndex
CREATE INDEX "packages_studentId_tipo_idx" ON "packages"("studentId", "tipo");

-- CreateIndex
CREATE INDEX "packages_tipo_createdAt_idx" ON "packages"("tipo", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "students_active_lastName_firstName_idx" ON "students"("active", "lastName", "firstName");
