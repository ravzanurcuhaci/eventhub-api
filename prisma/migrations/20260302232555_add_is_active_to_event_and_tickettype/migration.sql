-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "TicketType" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
