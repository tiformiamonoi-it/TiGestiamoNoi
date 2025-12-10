-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "assignedAt" TIMESTAMP(3),
ADD COLUMN     "assignedSlot" TEXT,
ADD COLUMN     "assignedTutorId" TEXT;

-- CreateIndex
CREATE INDEX "bookings_assignedTutorId_requestedDate_idx" ON "bookings"("assignedTutorId", "requestedDate");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_assignedTutorId_fkey" FOREIGN KEY ("assignedTutorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
