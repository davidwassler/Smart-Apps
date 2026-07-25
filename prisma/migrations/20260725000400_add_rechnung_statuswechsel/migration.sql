-- CreateTable
CREATE TABLE IF NOT EXISTS "RechnungStatuswechsel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rechnungId" INTEGER NOT NULL,
    "vonStatus" TEXT NOT NULL,
    "zuStatus" TEXT NOT NULL,
    "notiz" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RechnungStatuswechsel_rechnungId_fkey" FOREIGN KEY ("rechnungId") REFERENCES "Rechnung" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "RechnungStatuswechsel_rechnungId_idx" ON "RechnungStatuswechsel"("rechnungId");
