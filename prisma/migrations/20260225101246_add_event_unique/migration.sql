/*
  Warnings:

  - A unique constraint covering the columns `[organizerId,title,date]` on the table `Event` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Event_organizerId_title_date_key" ON "Event"("organizerId", "title", "date");
