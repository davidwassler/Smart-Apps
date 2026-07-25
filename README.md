# Smart Apps

Lokales Webprojekt fuer Brandt & Soehne Elektro. Die fachliche Grundlage liegt in `docs/spec.md`.

## Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run db:migrate
```

Unter Windows PowerShell kann `npm.ps1` durch die Execution Policy blockiert sein. Dann `npm.cmd` verwenden, zum Beispiel:

```bash
npm.cmd run dev
```

## Start

```bash
npm run dev
```

Danach lokal oeffnen:

```text
http://localhost:3000
```

## Test

```bash
npm run lint
npm run build
```

`npm test` fuehrt aktuell ebenfalls den Linter aus.

## Aktueller Stand

- Repo ist als kleines Next.js/TypeScript-Projekt eingerichtet.
- SQLite und Prisma sind vorbereitet.
- Das Prisma-Datenmodell bildet die Entitaeten und Beziehungen aus der Spec ab.
- Die Startseite ist jetzt eine lokale Arbeitsoberflaeche fuer Kunden, Mitarbeiter, Material und Auftraege.
- Kunden, Mitarbeiter, Material und Auftraege koennen per Formular in SQLite gespeichert werden.
- Einsaetze koennen geplant und mit Mitarbeitern besetzt werden.
- Rueckmeldungen aktualisieren den Einsatz und den Auftragsstatus; nicht fertige Auftraege brauchen einen Grund.
- Materialverbrauch kann erfasst werden; der Lagerbestand wird reduziert und der Verbrauch am Auftrag angezeigt.
- Materialeinheiten sind als `Stueck` oder `Laenge` auswaehlbar; `Stueck` erzwingt ganze Zahlen.
- Backlog, Architekturentscheidungen und Agentenanweisungen sind dokumentiert.

Bekannt:

- Die fachliche Spec wurde nur nach `docs/spec.md` verschoben und nicht inhaltlich korrigiert.
- `npm run db:migrate` fuehrt aktuell die eingecheckte SQLite-SQL-Migration per Prisma aus. `prisma migrate dev` zeigte in dieser Umgebung mit Prisma 7 einen Schema-Engine-Fehler bei frischer SQLite-Datei.
- Prisma 7 nutzt fuer den lokalen SQLite-Zugriff den libSQL Driver Adapter.
- npm meldet aktuell Vulnerabilities im Dependency-Baum. Vor produktiver Nutzung sollte `npm audit` bewertet werden.
- Fachliche Formulare und Persistenz-Workflows sind noch Backlog-Arbeit.
