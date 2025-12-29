/*
  Warnings:

  - The values [IN_SCADENZA,PAG_SOSPESO,ORE_NEGATIVE] on the enum `PackageStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PackageStatus_new" AS ENUM ('ATTIVO', 'DA_RINNOVARE', 'SCADUTO', 'ESAURITO', 'NEGATIVO', 'DA_PAGARE', 'PAGATO', 'CHIUSO');
ALTER TABLE "packages" ALTER COLUMN "stati" DROP DEFAULT;
ALTER TABLE "packages" ALTER COLUMN "stati" TYPE "PackageStatus_new"[] USING ("stati"::text::"PackageStatus_new"[]);
ALTER TYPE "PackageStatus" RENAME TO "PackageStatus_old";
ALTER TYPE "PackageStatus_new" RENAME TO "PackageStatus";
DROP TYPE "PackageStatus_old";
ALTER TABLE "packages" ALTER COLUMN "stati" SET DEFAULT ARRAY['ATTIVO']::"PackageStatus"[];
COMMIT;
