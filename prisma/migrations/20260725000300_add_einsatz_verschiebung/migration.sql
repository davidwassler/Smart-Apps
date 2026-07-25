-- CreateTable
CREATE TABLE IF NOT EXISTS "EinsatzVerschiebung" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "einsatzId" INTEGER NOT NULL,
    "vorherigesDatum" DATETIME NOT NULL,
    "neuesDatum" DATETIME NOT NULL,
    "begruendung" TEXT NOT NULL,
    "notdienstBestaetigt" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EinsatzVerschiebung_einsatzId_fkey" FOREIGN KEY ("einsatzId") REFERENCES "Einsatz" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EinsatzVerschiebung_einsatzId_idx" ON "EinsatzVerschiebung"("einsatzId");
