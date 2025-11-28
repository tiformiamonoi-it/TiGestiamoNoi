-- CreateTable
CREATE TABLE "tutor_payments" (
    "id" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "mese" TIMESTAMP(3) NOT NULL,
    "importo" DECIMAL(10,2) NOT NULL,
    "dataPagamento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metodo" "PaymentMethod" NOT NULL DEFAULT 'BONIFICO',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutor_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tutor_payments_tutorId_mese_idx" ON "tutor_payments"("tutorId", "mese");

-- AddForeignKey
ALTER TABLE "tutor_payments" ADD CONSTRAINT "tutor_payments_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
