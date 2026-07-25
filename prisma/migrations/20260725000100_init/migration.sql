-- CreateTable
CREATE TABLE IF NOT EXISTS "Kunde" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "telefonnummer" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "kundentyp" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Auftrag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kundeId" INTEGER NOT NULL,
    "beschreibung" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AUFGENOMMEN',
    "prioritaet" TEXT NOT NULL DEFAULT 'NORMAL',
    "nichtFertigGrund" TEXT,
    "zusatzarbeitBetrag" DECIMAL,
    "freigabeStatus" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Auftrag_kundeId_fkey" FOREIGN KEY ("kundeId") REFERENCES "Kunde" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Einsatz" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "auftragId" INTEGER NOT NULL,
    "datum" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'GEPLANT',
    "rueckmeldung" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Einsatz_auftragId_fkey" FOREIGN KEY ("auftragId") REFERENCES "Auftrag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Mitarbeiter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "rolle" TEXT NOT NULL,
    "telefonnummer" TEXT NOT NULL,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AuftragMitarbeiter" (
    "auftragId" INTEGER NOT NULL,
    "mitarbeiterId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("auftragId", "mitarbeiterId"),
    CONSTRAINT "AuftragMitarbeiter_auftragId_fkey" FOREIGN KEY ("auftragId") REFERENCES "Auftrag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AuftragMitarbeiter_mitarbeiterId_fkey" FOREIGN KEY ("mitarbeiterId") REFERENCES "Mitarbeiter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "EinsatzMitarbeiter" (
    "einsatzId" INTEGER NOT NULL,
    "mitarbeiterId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("einsatzId", "mitarbeiterId"),
    CONSTRAINT "EinsatzMitarbeiter_einsatzId_fkey" FOREIGN KEY ("einsatzId") REFERENCES "Einsatz" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EinsatzMitarbeiter_mitarbeiterId_fkey" FOREIGN KEY ("mitarbeiterId") REFERENCES "Mitarbeiter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Material" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "einheit" TEXT NOT NULL,
    "lagerbestand" DECIMAL NOT NULL DEFAULT 0,
    "lagerort" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Materialverbrauch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "auftragId" INTEGER NOT NULL,
    "materialId" INTEGER NOT NULL,
    "menge" DECIMAL NOT NULL,
    "erfasstVonId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Materialverbrauch_auftragId_fkey" FOREIGN KEY ("auftragId") REFERENCES "Auftrag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Materialverbrauch_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Materialverbrauch_erfasstVonId_fkey" FOREIGN KEY ("erfasstVonId") REFERENCES "Mitarbeiter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Werkzeug" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'VERFUEGBAR',
    "aktuellerOrt" TEXT NOT NULL,
    "aktuellerBesitzerId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Werkzeug_aktuellerBesitzerId_fkey" FOREIGN KEY ("aktuellerBesitzerId") REFERENCES "Mitarbeiter" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "WerkzeugUebergabe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "werkzeugId" INTEGER NOT NULL,
    "mitarbeiterId" INTEGER,
    "ort" TEXT NOT NULL,
    "notiz" TEXT,
    "uebergebenAm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WerkzeugUebergabe_werkzeugId_fkey" FOREIGN KEY ("werkzeugId") REFERENCES "Werkzeug" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WerkzeugUebergabe_mitarbeiterId_fkey" FOREIGN KEY ("mitarbeiterId") REFERENCES "Mitarbeiter" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Rechnung" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "auftragId" INTEGER NOT NULL,
    "erstelltAm" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OFFEN',
    "betrag" DECIMAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Rechnung_auftragId_fkey" FOREIGN KEY ("auftragId") REFERENCES "Auftrag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Rechnung_auftragId_key" ON "Rechnung"("auftragId");
