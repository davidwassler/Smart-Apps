# Backlog

Statuswerte: `offen`, `in arbeit`, `fertig`, `blockiert`.

## Phase 0: Projektfundament

| ID | Feature | Status | Akzeptanzkriterien |
|---|---|---|---|
| F-0001 | Lokales Next.js-Projekt einrichten | in arbeit | Next.js mit TypeScript ist installiert; `npm run dev` startet lokal; keine Cloud-, Docker- oder Deployment-Abhaengigkeit. |
| F-0002 | Prisma/SQLite-Datenmodell anlegen | in arbeit | Prisma-Schema bildet Kunden, Auftraege, Einsaetze, Mitarbeiter, Material, Materialverbrauch, Werkzeuge und Rechnungen ab; Beziehungen aus der Spec sind modelliert. |
| F-0003 | Projektdokumentation erstellen | in arbeit | `AGENTS.md`, `docs/backlog.md`, `docs/architecture.md`, `docs/decisions.md` und `README.md` existieren und verweisen auf `docs/spec.md`. |

## Phase 1: Muss-Funktionen

| ID | Feature | Status | Akzeptanzkriterien |
|---|---|---|---|
| F-0101 | Auftrag erfassen | offen | Ein Auftrag kann mit Kunde, Beschreibung, Prioritaet und Status `aufgenommen` gespeichert werden; Pflichtfelder werden validiert. |
| F-0102 | Mitarbeiter zu Auftrag zuordnen | offen | Ein Auftrag kann einem oder mehreren aktiven Mitarbeitern zugeordnet werden; die Zuordnung ist in der Auftragsansicht sichtbar. |
| F-0103 | Einsatz anlegen und planen | offen | Zu einem Auftrag koennen ein oder mehrere Einsaetze mit Datum und Status `geplant` angelegt werden. |
| F-0104 | Status nach Einsatz erfassen | offen | Nach einem Einsatz kann eine Rueckmeldung gespeichert und der Auftragsstatus aktualisiert werden. |
| F-0105 | Grund bei nicht fertigem Auftrag erzwingen | offen | Wenn ein Auftrag nach einem Einsatz nicht technisch fertig ist, muss ein Grund wie fehlendes Material oder offene Kundenentscheidung gespeichert werden. |
| F-0106 | Materialverbrauch erfassen | offen | Material, Menge, Auftrag und erfassender Mitarbeiter koennen gespeichert werden; der Verbrauch ist am Auftrag sichtbar. |

## Phase 2: Sollte-Funktionen

| ID | Feature | Status | Akzeptanzkriterien |
|---|---|---|---|
| F-0201 | Werkzeugstandort erfassen | offen | Ein Werkzeug hat Status, aktuellen Ort und optional aktuellen Besitzer; Aenderungen koennen nachvollzogen werden. |
| F-0202 | Rechnungsvorbereitung unterstuetzen | offen | Technisch fertige Auftraege koennen fuer eine Rechnung vorbereitet werden; Materialverbrauch und Rueckmeldungen sind sichtbar. |
| F-0203 | Lehrlingsregel validieren | offen | Ein Lehrling kann keinem Einsatz allein zugeordnet werden; mindestens ein Geselle oder Meister ist erforderlich. |
| F-0204 | Notdienst-Regel markieren | offen | Notdienst-Auftraege werden als nicht leicht verschiebbar gekennzeichnet; Verschiebungen benoetigen eine bewusste Bestaetigung. |
| F-0205 | Zusatzarbeit-Freigabe abbilden | offen | Zusatzarbeiten ab 1.500 Euro koennen nur mit schriftlicher Freigabe als freigegeben markiert werden. |

## Phase 3: Kann-Funktionen

| ID | Feature | Status | Akzeptanzkriterien |
|---|---|---|---|
| F-0301 | Mahnstatus anzeigen | offen | Offene Rechnungen koennen mit Mahnung 1, Mahnung 2 oder Anwalt gekennzeichnet werden. |
| F-0302 | Einfache Such- und Filterfunktion | offen | Auftraege koennen nach Status, Prioritaet und Kunde gefiltert werden. |
