-- CreateTable
CREATE TABLE "closure_dates" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "closure_dates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "closure_dates_date_idx" ON "closure_dates"("date");

-- CreateIndex
CREATE UNIQUE INDEX "closure_dates_date_key" ON "closure_dates"("date");
