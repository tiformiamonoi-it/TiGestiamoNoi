/*
  Warnings:

  - The values [SOSPESO,COMPLETATO] on the enum `PackageStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PackageStatus_new" AS ENUM ('ATTIVO', 'SCADUTO', 'ESAURITO', 'IN_SCADENZA', 'PAGATO', 'PAG_SOSPESO', 'DA_RINNOVARE');
ALTER TABLE "packages" ALTER COLUMN "stati" DROP DEFAULT;
ALTER TABLE "packages" ALTER COLUMN "stati" TYPE "PackageStatus_new"[] USING ("stati"::text::"PackageStatus_new"[]);
ALTER TYPE "PackageStatus" RENAME TO "PackageStatus_old";
ALTER TYPE "PackageStatus_new" RENAME TO "PackageStatus";
DROP TYPE "PackageStatus_old";
ALTER TABLE "packages" ALTER COLUMN "stati" SET DEFAULT ARRAY['ATTIVO']::"PackageStatus"[];
COMMIT;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "richiedeFattura" BOOLEAN NOT NULL DEFAULT false;
