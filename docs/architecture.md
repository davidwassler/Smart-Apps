# Architektur

## Stack

- Next.js mit App Router
- TypeScript
- SQLite als lokale Datenbank
- Prisma als ORM und Migrationswerkzeug
- `@prisma/adapter-libsql` und `@libsql/client` fuer den Prisma-7-Zugriff auf die lokale SQLite-Datei
- ESLint fuer statische Pruefung

Kein Deployment, keine Cloud-Datenbank und kein Docker.

## Datenmodell

Die fachliche Quelle ist `docs/spec.md`. Das Prisma-Schema liegt in `prisma/schema.prisma`.

Kernmodelle:

- `Kunde`: Auftraggeber mit Kundentyp, Adresse und Telefonnummer
- `Auftrag`: zentrale Arbeitseinheit mit Status, Prioritaet, Grund bei offenem Ergebnis und optionaler Zusatzarbeitsfreigabe
- `Einsatz`: konkreter Termin oder Arbeitstag innerhalb eines Auftrags
- `Mitarbeiter`: Personen mit Rolle und Aktivstatus
- `Material`: Lagerbestand und Lagerort
- `Materialverbrauch`: verbautes Material je Auftrag, inklusive erfassendem Mitarbeiter
- `Werkzeug`: wiederverwendbares Werkzeug mit aktuellem Ort und Besitzer
- `WerkzeugUebergabe`: Historie fuer Werkzeugbewegungen
- `Rechnung`: kaufmaennischer Abschluss eines Auftrags

Wichtige Beziehungen:

- Kunde zu Auftrag: 1:n
- Auftrag zu Einsatz: 1:n
- Auftrag zu Rechnung: 1:1
- Auftrag zu Mitarbeiter: n:m ueber `AuftragMitarbeiter`
- Einsatz zu Mitarbeiter: n:m ueber `EinsatzMitarbeiter`
- Auftrag zu Material: n:m ueber `Materialverbrauch`
- Werkzeug zu Mitarbeiter: aktueller Besitzer plus Historie

## Ordnerstruktur

```text
.
|-- app/                  # Next.js App Router UI
|   |-- actions.ts        # Server Actions fuer einfache Schreib-Workflows
|   |-- auftraege/[id]/   # Auftragsdetail mit Planung und Verbrauch
|   |-- kunden/           # Kundenseite
|   |-- labels.ts         # Gemeinsame fachliche Labels
|   |-- material/         # Materialseite
|   |-- material-usage-form.tsx
|   |-- mitarbeiter/      # Mitarbeiterseite
|   |-- order-create-panel.tsx
|   `-- werkzeuge/        # Werkzeugseite
|-- docs/                 # Fachliche und technische Dokumentation
|   |-- architecture.md
|   |-- backlog.md
|   |-- decisions.md
|   `-- spec.md
|-- lib/                  # Geteilte Server-Hilfen
|   `-- prisma.ts         # Prisma Client mit libSQL Adapter
|-- prisma/               # Prisma Schema und Migrationen
|-- AGENTS.md             # Arbeitsanweisung fuer Coding-Agenten
|-- README.md             # Einstieg fuer Menschen
|-- package.json
`-- prisma.config.ts
```

## Laufbefehle

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Weitere Befehle:

```bash
npm run lint
npm run build
npm run db:seed
npm run db:reset-demo
npm run db:studio
```

`npm run db:migrate` wendet die eingecheckte SQLite-Migration per `prisma db execute` an und generiert danach den Prisma Client. Der klassische Prisma-Migrationsbefehl `prisma migrate dev` zeigte in dieser lokalen Umgebung mit Prisma 7 einen Schema-Engine-Fehler bei einer frischen SQLite-Datei.

`npm run db:seed` entfernt die festen Demo-Daten und legt sie neu an. Manuell erfasste Daten mit anderen Namen bleiben erhalten.

## Validierungslogik

Business Rules aus der Spec werden schrittweise umgesetzt. Fuer die erste Codebasis sind sie im Datenmodell vorbereitet:

- Notdienst-Auftraege haben eine eigene Prioritaet.
- Lehrlinge haben eine eigene Mitarbeiterrolle.
- Nicht fertige Auftraege haben ein Feld fuer den Grund.
- Zusatzarbeiten koennen Betrag und Freigabestatus speichern.
- Technische Fertigstellung, Rechnung und Zahlung sind getrennte Status.

## Aktuelle UI-Flows

- Kunden anlegen und anzeigen
- Mitarbeiter mit Rolle und Aktivstatus anlegen und anzeigen
- Material mit Einheit, Lagerbestand und Lagerort anlegen und anzeigen
- Auftraege aus einem Seitenpanel mit Kunde, Beschreibung, Prioritaet und optionaler Mitarbeiterzuordnung anlegen
- Alle Auftraege mit kompaktem Status und kleinen KPIs auf der Startseite anzeigen
- Einen Auftrag mit Stammdaten, Einsaetzen, Rueckmeldungen und Materialverbrauch als eigene Detailseite anzeigen
- Einsaetze im Kontext des geoeffneten Auftrags mit Datum, Status und Mitarbeiterzuordnung anlegen
- Rueckmeldungen im Auftragsdetail speichern und den Auftragsstatus aktualisieren
- Nicht-fertig-Gruende bei offenen Rueckmeldungen erfassen
- Materialverbrauch direkt im Auftragsdetail mit Material, Menge und erfassendem Mitarbeiter speichern
- Lagerbestand beim Materialverbrauch reduzieren und Verbrauch am Auftrag anzeigen
- Materialeinheit als `Stueck` oder konkrete Laengeneinheit `mm`, `cm` oder `m` erfassen; ganzzahlige Mengen fuer `Stueck`, Dezimalmengen fuer Laengeneinheiten

## Screens

- `/`: Auftragsuebersicht mit Status-KPIs, kompakter Auftragsliste und Seitenpanel zur Auftragserfassung
- `/auftraege/[id]`: Auftragsdetail mit Einsatzplanung, Rueckmeldungen und Materialverbrauch
- `/kunden`: Kunden erfassen und anzeigen
- `/mitarbeiter`: Mitarbeiter erfassen und anzeigen
- `/material`: Material erfassen und anzeigen
- `/werkzeuge`: Werkzeuge erfassen und Standort anzeigen
- Werkzeugstandortwechsel aktualisieren den aktuellen Standort und schreiben einen Historieneintrag.
