-- CreateTable
CREATE TABLE "student_referrals" (
    "id" TEXT NOT NULL,
    "referredId" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_referrals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "student_referrals_referredId_idx" ON "student_referrals"("referredId");

-- CreateIndex
CREATE INDEX "student_referrals_referrerId_idx" ON "student_referrals"("referrerId");

-- CreateIndex
CREATE UNIQUE INDEX "student_referrals_referredId_referrerId_key" ON "student_referrals"("referredId", "referrerId");

-- AddForeignKey
ALTER TABLE "student_referrals" ADD CONSTRAINT "student_referrals_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_referrals" ADD CONSTRAINT "student_referrals_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
