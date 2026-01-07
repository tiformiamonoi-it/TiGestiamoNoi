-- AlterTable
ALTER TABLE "accounting_entries" ADD COLUMN     "fatturaEmessa" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metodoPagamento" "PaymentMethod";
