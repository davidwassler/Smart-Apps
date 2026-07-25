-- CreateTable
CREATE TABLE IF NOT EXISTS "Zusatzarbeit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "auftragId" INTEGER NOT NULL,
    "beschreibung" TEXT NOT NULL,
    "geschaetzterBetrag" DECIMAL NOT NULL,
    "freigabeStatus" TEXT NOT NULL DEFAULT 'NICHT_ERFORDERLICH',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Zusatzarbeit_auftragId_fkey" FOREIGN KEY ("auftragId") REFERENCES "Auftrag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Zusatzarbeit_auftragId_idx" ON "Zusatzarbeit"("auftragId");
