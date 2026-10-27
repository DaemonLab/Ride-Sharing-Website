-- Review against the intended database and take a backup before applying.
-- Generated read-only on 2026-10-27; this script has NOT been applied.
BEGIN;

-- DropForeignKey
ALTER TABLE "account" DROP CONSTRAINT "account_userId_fkey";

-- DropForeignKey
ALTER TABLE "groupChat" DROP CONSTRAINT "groupChat_messageBy_fkey";

-- DropForeignKey
ALTER TABLE "groupChat" DROP CONSTRAINT "groupChat_rideID_fkey";

-- DropForeignKey
ALTER TABLE "requests" DROP CONSTRAINT "requests_requestBy_fkey";

-- DropForeignKey
ALTER TABLE "requests" DROP CONSTRAINT "requests_rideID_fkey";

-- DropForeignKey
ALTER TABLE "rides" DROP CONSTRAINT "rides_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "session" DROP CONSTRAINT "session_userId_fkey";

-- AlterTable
ALTER TABLE "account" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "session" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "verification" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rides" ADD CONSTRAINT "rides_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_rideID_fkey" FOREIGN KEY ("rideID") REFERENCES "rides"("rideID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_requestBy_fkey" FOREIGN KEY ("requestBy") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groupChat" ADD CONSTRAINT "groupChat_rideID_fkey" FOREIGN KEY ("rideID") REFERENCES "rides"("rideID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groupChat" ADD CONSTRAINT "groupChat_messageBy_fkey" FOREIGN KEY ("messageBy") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
