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

Alternativ funktioniert auch:

```text
http://127.0.0.1:3000
```

Beide lokalen Adressen werden im Entwicklungsmodus unterstuetzt, damit clientseitige Dialoge und Buttons korrekt geladen werden.

## Test

```bash
npm run lint
npm test
npm run test:e2e
npm run build
```

`npm test` fuehrt den Linter und die isolierten Business-Rule-Tests aus.
`npm run test:e2e` setzt nur die separate Datei `test-e2e.db` zurueck und prueft die Kernablaeufe automatisiert in Chromium auf Port 3100. Die normale lokale Datenbank bleibt unveraendert.

## Demo-Daten

```bash
npm run db:seed
npm run db:reset-demo
```

`db:seed` entfernt nur die festen fachlichen Demo-Daten und legt sie neu an. Bereits verwendete Demo-Mitarbeiter werden aktualisiert statt geloescht, damit manuelle Auftraege ihre Zuordnungen behalten. Manuell erfasste Daten mit anderen Namen bleiben erhalten.

## Aktueller Stand

- Repo ist als kleines Next.js/TypeScript-Projekt eingerichtet.
- SQLite und Prisma sind vorbereitet.
- Das Prisma-Datenmodell bildet die Entitaeten und Beziehungen aus der Spec ab.
- Die Startseite zeigt alle Auftraege als kompakte Liste und fasst offene, geplante, laufende und wartende Auftraege in kleinen KPIs zusammen.
- Bezahlte Auftraege sind in der Liste hellgruen als abgeschlossen markiert; bei ehemaligen Notdiensten ersetzt der Abschlusszustand die rote Randmarkierung.
- Die Auftragsliste kann nach Nummer, Kunde und Beschreibung durchsucht sowie nach Bereich, Status, Prioritaet und Mitarbeiter gefiltert werden.
- Sortierungen nach letzter Aenderung, naechstem Einsatz und Prioritaet sind verfuegbar; die Auswahl bleibt beim Ruecksprung aus einem Auftrag erhalten.
- Kunden, Mitarbeiter, Material und Auftraege koennen per Formular in SQLite gespeichert werden.
- Ein neuer Auftrag wird ueber ein seitliches Panel angelegt und danach direkt geoeffnet.
- Jeder Auftrag hat eine eigene Detailseite mit Auftragsdaten, Einsatzplanung, Rueckmeldungen und Materialverbrauch.
- Auftragsbeschreibung, Prioritaet, Status und Team koennen im Auftragsdetail bearbeitet werden.
- Fehlende Kundendaten koennen direkt am Auftrag vervollstaendigt und getrennt gespeichert werden.
- Die Detailseite zeigt Status, naechsten Einsatz, Team und Kontakt vor den Arbeitsverlaeufen.
- Einsatzplanung und Materialverbrauch bleiben bis zum Klick auf die jeweilige Aktion in einem Seitenfenster verborgen.
- Auftragsdaten, letzter Stand, Aktionen, Auftragsverlauf und Materialverlauf sind als klare visuelle Bloecke getrennt.
- Der letzte Rueckmeldungstext ist hervorgehoben; Einsaetze erscheinen als Zeitleiste bis zur Auftragserfassung.
- Offene Rueckmeldungen werden ueber ein eigenes Seitenfenster erfasst.
- Mehrere Zusatzarbeiten koennen je Auftrag mit Beschreibung, Betrag und Freigabestatus erfasst werden.
- Ab mindestens 1.500 Euro wird eine schriftliche Freigabe erzwungen; fehlende Freigaben erscheinen als Ausfuehrungssperre.
- Zusatzarbeiten werden im Auftragsverlauf angezeigt; die Demo-Daten enthalten freigabefreie, angefragte und schriftlich freigegebene Beispiele.
- Clientseitige Dialoge und Buttons funktionieren im lokalen Entwicklungsmodus sowohl ueber `localhost` als auch ueber `127.0.0.1`.
- Einsaetze koennen im Auftragsdetail geplant und mit Mitarbeitern besetzt werden.
- Notdienst-Auftraege sind deutlich markiert; ihre geplanten Einsaetze koennen nur mit Begruendung und bestaetigter Ersatzbesetzung oder sofortiger Neuplanung verschoben werden.
- Terminverschiebungen bleiben mit altem und neuem Datum sowie Begruendung im Auftragsverlauf sichtbar.
- Rueckmeldungen aktualisieren dort den Einsatz und den Auftragsstatus; nicht fertige Auftraege brauchen einen Grund.
- Technisch fertige Auftraege koennen aus der Detailseite heraus als offene Rechnung mit Datum und Betrag gespeichert werden.
- Der Rechnungsdialog buendelt Einsatzrueckmeldungen, Materialverbrauch und Zusatzarbeiten; die fertige Rechnung erscheint als eigener Block und im Auftragsverlauf.
- Rechnungen haben eine eigene Uebersicht mit Statusfilter und direktem Ruecksprung aus dem zugehoerigen Auftrag.
- Zahlung, Mahnung 1, Mahnung 2 und Anwalt werden ueber fachlich erlaubte Statusfolgen gepflegt; jeder Schritt braucht eine Notiz und erscheint im Verlauf.
- Rechnungs- und Auftragsstatus werden gemeinsam aktualisiert; bezahlte Rechnungen sind abgeschlossen.
- Die Demo-Daten enthalten einen rechnungsbereiten Auftrag sowie offene, bezahlte und gemahnte Rechnungen.
- Materialverbrauch kann direkt am Auftrag erfasst werden; der Lagerbestand wird reduziert und der Verbrauch am Auftrag angezeigt.
- Materialeinheiten sind als `Stueck` oder `Laenge` auswaehlbar; bei `Laenge` wird `mm`, `cm` oder `m` gewaehlt; `Stueck` erzwingt ganze Zahlen.
- Die Startseite ist die Auftragsuebersicht; Kunden, Mitarbeiter und Material haben eigene Seiten.
- Auftraege koennen mit bestehendem Kunden oder direkt mit einem neuen Schnellkunden angelegt werden.
- Werkzeuge haben eine eigene Seite mit Status, aktuellem Ort und optionalem Besitzer.
- Werkzeugstandortwechsel werden mit Historie gespeichert.
- Demo-Daten koennen per `npm run db:seed` neu angelegt werden.
- Schreibformulare zeigen Erfolg oder verstaendliche Serverfehler direkt am Formular, behalten Eingaben bei Fehlern und verhindern Mehrfachabsenden waehrend des Speicherns.
- Seitenfenster unterstuetzen Tastaturfokus, Escape und die Rueckkehr zum ausloesenden Button; das Verhalten wird auch in einer mobilen Viewportgroesse geprueft.
- Playwright deckt Auftragserfassung, Einsatzplanung und Rueckmeldung, Materialverbrauch, Notdienst-Verschiebung sowie Rechnung und Zahlung als echte Browserablaeufe ab.
- Backlog, Architekturentscheidungen und Agentenanweisungen sind dokumentiert.

Bekannt:

- Die fachliche Spec wurde nur nach `docs/spec.md` verschoben und nicht inhaltlich korrigiert.
- `npm run db:migrate` fuehrt aktuell die eingecheckten SQLite-SQL-Migrationen nacheinander per Prisma aus. `prisma migrate dev` zeigte in dieser Umgebung mit Prisma 7 einen Schema-Engine-Fehler bei frischer SQLite-Datei.
- Prisma 7 nutzt fuer den lokalen SQLite-Zugriff den libSQL Driver Adapter.
- Arbeitsstunden und Materialpreise sind in der fachlichen Spec nicht modelliert; der Rechnungsbetrag wird daher manuell erfasst.
- npm meldet aktuell Vulnerabilities im Dependency-Baum. Vor produktiver Nutzung sollte `npm audit` bewertet werden.
- Fuer F-0501 steht noch ein kurzer Praxistest mit einem Mitarbeiter aus; die technischen Bedienhilfen und automatisierten Kernablauftests sind umgesetzt.
