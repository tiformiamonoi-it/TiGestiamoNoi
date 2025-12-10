-- CreateTable
CREATE TABLE "tutor_availabilities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tutor_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tutor_availabilities_date_idx" ON "tutor_availabilities"("date");

-- CreateIndex
CREATE UNIQUE INDEX "tutor_availabilities_userId_date_key" ON "tutor_availabilities"("userId", "date");

-- AddForeignKey
ALTER TABLE "tutor_availabilities" ADD CONSTRAINT "tutor_availabilities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
