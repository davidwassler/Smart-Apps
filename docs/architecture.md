# Architektur

## Stack

- Next.js mit App Router
- TypeScript
- SQLite als lokale Datenbank
- Prisma als ORM und Migrationswerkzeug
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
├── app/                  # Next.js App Router UI
├── docs/                 # Fachliche und technische Dokumentation
│   ├── architecture.md
│   ├── backlog.md
│   ├── decisions.md
│   └── spec.md
├── prisma/               # Prisma Schema und Migrationen
├── AGENTS.md             # Arbeitsanweisung fuer Coding-Agenten
├── README.md             # Einstieg fuer Menschen
├── package.json
└── prisma.config.ts
```

## Laufbefehle

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run db:migrate
npm run dev
```

Weitere Befehle:

```bash
npm run lint
npm run build
npm run db:studio
```

`npm run db:migrate` wendet die eingecheckte SQLite-Migration per `prisma db execute` an und generiert danach den Prisma Client. Der klassische Prisma-Migrationsbefehl `prisma migrate dev` zeigte in dieser lokalen Umgebung mit Prisma 7 einen Schema-Engine-Fehler bei einer frischen SQLite-Datei.

## Validierungslogik

Business Rules aus der Spec werden schrittweise umgesetzt. Fuer die erste Codebasis sind sie im Datenmodell vorbereitet:

- Notdienst-Auftraege haben eine eigene Prioritaet.
- Lehrlinge haben eine eigene Mitarbeiterrolle.
- Nicht fertige Auftraege haben ein Feld fuer den Grund.
- Zusatzarbeiten koennen Betrag und Freigabestatus speichern.
- Technische Fertigstellung, Rechnung und Zahlung sind getrennte Status.
