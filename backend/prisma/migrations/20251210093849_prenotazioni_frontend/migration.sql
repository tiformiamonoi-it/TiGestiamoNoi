-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "studentSurname" TEXT NOT NULL,
    "studentPhone" TEXT NOT NULL,
    "requestedDate" TIMESTAMP(3) NOT NULL,
    "subjects" TEXT[],
    "notes" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bookings_status_requestedDate_idx" ON "bookings"("status", "requestedDate");
