# Smart Apps

Lokales Webprojekt fuer Brandt & Soehne Elektro. Die fachliche Grundlage liegt in `docs/spec.md`.

## Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run db:migrate
npm run db:seed
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

## Demo-Daten

```bash
npm run db:seed
npm run db:reset-demo
```

`db:seed` entfernt nur die festen Demo-Daten und legt sie neu an. Manuell erfasste Daten mit anderen Namen bleiben erhalten.

## Aktueller Stand

- Repo ist als kleines Next.js/TypeScript-Projekt eingerichtet.
- SQLite und Prisma sind vorbereitet.
- Das Prisma-Datenmodell bildet die Entitaeten und Beziehungen aus der Spec ab.
- Die Startseite zeigt alle Auftraege als kompakte Liste und fasst offene, geplante, laufende und wartende Auftraege in kleinen KPIs zusammen.
- Kunden, Mitarbeiter, Material und Auftraege koennen per Formular in SQLite gespeichert werden.
- Ein neuer Auftrag wird ueber ein seitliches Panel angelegt und danach direkt geoeffnet.
- Jeder Auftrag hat eine eigene Detailseite mit Auftragsdaten, Einsatzplanung, Rueckmeldungen und Materialverbrauch.
- Auftragsbeschreibung, Prioritaet, Status und Team koennen im Auftragsdetail bearbeitet werden.
- Fehlende Kundendaten koennen direkt am Auftrag vervollstaendigt und getrennt gespeichert werden.
- Einsaetze koennen im Auftragsdetail geplant und mit Mitarbeitern besetzt werden.
- Rueckmeldungen aktualisieren dort den Einsatz und den Auftragsstatus; nicht fertige Auftraege brauchen einen Grund.
- Materialverbrauch kann direkt am Auftrag erfasst werden; der Lagerbestand wird reduziert und der Verbrauch am Auftrag angezeigt.
- Materialeinheiten sind als `Stueck` oder `Laenge` auswaehlbar; bei `Laenge` wird `mm`, `cm` oder `m` gewaehlt; `Stueck` erzwingt ganze Zahlen.
- Die Startseite ist die Auftragsuebersicht; Kunden, Mitarbeiter und Material haben eigene Seiten.
- Auftraege koennen mit bestehendem Kunden oder direkt mit einem neuen Schnellkunden angelegt werden.
- Werkzeuge haben eine eigene Seite mit Status, aktuellem Ort und optionalem Besitzer.
- Werkzeugstandortwechsel werden mit Historie gespeichert.
- Demo-Daten koennen per `npm run db:seed` neu angelegt werden.
- Backlog, Architekturentscheidungen und Agentenanweisungen sind dokumentiert.

Bekannt:

- Die fachliche Spec wurde nur nach `docs/spec.md` verschoben und nicht inhaltlich korrigiert.
- `npm run db:migrate` fuehrt aktuell die eingecheckte SQLite-SQL-Migration per Prisma aus. `prisma migrate dev` zeigte in dieser Umgebung mit Prisma 7 einen Schema-Engine-Fehler bei frischer SQLite-Datei.
- Prisma 7 nutzt fuer den lokalen SQLite-Zugriff den libSQL Driver Adapter.
- npm meldet aktuell Vulnerabilities im Dependency-Baum. Vor produktiver Nutzung sollte `npm audit` bewertet werden.
- Fachliche Formulare und Persistenz-Workflows sind noch Backlog-Arbeit.
