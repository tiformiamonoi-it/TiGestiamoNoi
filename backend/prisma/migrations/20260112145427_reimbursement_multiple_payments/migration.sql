-- DropIndex
DROP INDEX "accounting_entries_reimbursementId_key";

-- CreateIndex
CREATE INDEX "accounting_entries_reimbursementId_idx" ON "accounting_entries"("reimbursementId");
