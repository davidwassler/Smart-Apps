# Backlog

Fachliche Quelle: `docs/spec.md`. Jede Anforderung wird als Feature mit stabiler ID, Phase, Status und Akzeptanzkriterien gefuehrt.

Statuswerte: `offen`, `in arbeit`, `fertig`, `blockiert`, `nicht geplant`.

## Aenderungsnotiz vor Commit

- Das bisher grobe Backlog wurde in feinere Features aus `docs/spec.md` aufgebrochen.
- Die Phasen sind nach Nutzwert sortiert: Kernprozess zuerst, danach Stammdaten, Regeln, kaufmaennische Erweiterungen, nichtfunktionale Anforderungen und Nicht-Ziele.
- Die ersten fachlichen Formulare fuer Kunden, Mitarbeiter, Material und Auftraege wurden umgesetzt.
- Einsatzplanung, Einsatz-Mitarbeiterzuordnung und Rueckmeldungen wurden ergaenzt.
- Materialverbrauch kann erfasst werden, reduziert den Lagerbestand und ist am Auftrag sichtbar.
- Materialeinheiten sind auf `Stueck` sowie Laengeneinheiten `mm`, `cm` und `m` begrenzt; Stueck-Bestaende und Stueck-Verbrauch muessen ganzzahlig sein.
- Die App ist in mehrere Screens aufgeteilt: Auftragsuebersicht als Startseite sowie eigene Seiten fuer Kunden, Mitarbeiter und Material.
- Werkzeuge koennen auf einer eigenen Seite mit Status, Ort und optionalem Besitzer erfasst werden; Standortwechsel werden als Historie gespeichert.
- Demo-Daten fuer Kunden, Mitarbeiter, Material, Auftraege, Einsaetze, Rueckmeldungen, Materialverbrauch und Werkzeuge koennen per Seed geladen werden.
- Auftraege koennen direkt aus einem neuen Schnellkunden heraus angelegt werden; unvollstaendige Kundendaten werden am Auftrag sichtbar.
- Die Startseite ist auf eine kompakte Auftragsliste mit Status-KPIs reduziert; Auftragserfassung liegt in einem Seitenpanel, Einsatzplanung, Rueckmeldung und Materialverbrauch in der jeweiligen Auftragsdetailseite.
- Auftragsbeschreibung, Prioritaet, Status und Team koennen nachtraeglich im Auftragsdetail gepflegt werden; die zugehoerigen Kundendaten lassen sich dort direkt vervollstaendigen.
- Die Auftragsdetailseite zeigt zuerst Status, naechsten Einsatz, Team und Kontakt; Einsatzplanung und Materialverbrauch bleiben bis zum Klick auf die jeweilige Aktion in getrennten Seitenfenstern verborgen.
- Auftragsdaten, letzter Stand, Aktionen, Auftragsverlauf und Materialverlauf sind visuell getrennt; der letzte Rueckmeldungsstand ist hervorgehoben und Einsaetze bilden eine Zeitleiste vom neuesten Eintrag bis zur Auftragserfassung.
- Die Auftragsuebersicht kann nach Nummer, Kunde und Beschreibung durchsucht, nach Bereich, Status, Prioritaet und Mitarbeiter gefiltert sowie nach Aenderung, naechstem Einsatz oder Prioritaet sortiert werden; die Auswahl bleibt beim Ruecksprung aus einem Auftrag erhalten.

## Phase 0: Projektfundament

| ID | Feature | Status | Akzeptanzkriterien |
|---|---|---|---|
| F-0001 | Lokales Next.js-Projekt einrichten | fertig | Next.js mit TypeScript ist installiert; `npm run dev` startet lokal; keine Cloud-, Docker- oder Deployment-Abhaengigkeit. |
| F-0002 | Prisma/SQLite-Datenmodell anlegen | fertig | Prisma-Schema bildet Kunden, Auftraege, Einsaetze, Mitarbeiter, Material, Materialverbrauch, Werkzeuge und Rechnungen ab; Beziehungen aus der Spec sind modelliert. |
| F-0003 | Projektdokumentation erstellen | fertig | `AGENTS.md`, `docs/backlog.md`, `docs/architecture.md`, `docs/decisions.md` und `README.md` existieren und verweisen auf `docs/spec.md`. |
| F-0004 | Auftragsuebersicht als Startseite anzeigen | fertig | Die Startseite zeigt alle Auftraege als kompakte Liste sowie kleine Kennzahlen fuer offene, geplante, laufende und wartende Auftraege; ein Auftrag kann aus der Liste geoeffnet werden. |
| F-0005 | Eigene Stammdaten-Seiten bereitstellen | fertig | Kunden, Mitarbeiter und Material haben eigene Seiten mit fokussierten Formularen und Listen. |
| F-0006 | Werkzeug-Seite bereitstellen | fertig | Werkzeuge haben eine eigene Seite mit Formular und Liste. |
| F-0007 | Demo-Daten bereitstellen | fertig | Ein Seed-Script legt realistische Demo-Daten fuer die vorhandenen Kernfunktionen an und kann wiederholt ausgefuehrt werden. |

## Phase 1: Kernprozess erste Version

| ID | Feature | Status | Akzeptanzkriterien |
|---|---|---|---|
| F-0101 | Kunde erfassen | fertig | Name, Telefonnummer, Adresse und Kundentyp koennen gespeichert werden; Kundentyp ist Privatkunde oder Firmenkunde. |
| F-0102 | Auftrag erfassen | fertig | Ein Auftrag kann mit Kunde, Beschreibung, Prioritaet und Startstatus `aufgenommen` gespeichert werden. |
| F-0103 | Auftragsstatus pflegen | fertig | Alle Statuswerte aus der Spec sind verfuegbar und koennen am Auftrag gepflegt werden: aufgenommen, geplant, in Bearbeitung, pausiert, wartet auf Material, wartet auf Kundenentscheidung, technisch fertig, Rechnung erstellt, bezahlt, gemahnt, eskaliert. |
| F-0104 | Prioritaet setzen | fertig | Ein Auftrag kann als normal, dringend oder Notdienst markiert werden. |
| F-0105 | Mitarbeiter erfassen | fertig | Name, Rolle, Telefonnummer und Aktivstatus koennen gespeichert werden. |
| F-0106 | Mitarbeiter zu Auftrag zuordnen | fertig | Ein Auftrag kann einem oder mehreren aktiven Mitarbeitern zugeordnet werden; Thomas sieht, wer zu welchem Auftrag faehrt. |
| F-0107 | Einsatz anlegen | fertig | Zu einem Auftrag koennen konkrete Einsaetze mit Datum und Status geplant, durchgefuehrt oder verschoben angelegt werden. |
| F-0108 | Mitarbeiter zu Einsatz zuordnen | fertig | Ein Einsatz kann einem oder mehreren Mitarbeitern zugeordnet werden; die Zuordnung ist am Einsatz sichtbar. |
| F-0109 | Rueckmeldung nach Einsatz erfassen | fertig | Nach einem Einsatz kann das Ergebnis oder Problem als Rueckmeldung gespeichert werden. |
| F-0110 | Status nach Einsatz aktualisieren | fertig | Das Buero kann nach einer Rueckmeldung sehen, ob ein Auftrag fertig ist oder erneut angefahren werden muss. |
| F-0111 | Grund bei nicht fertigem Auftrag erfassen | fertig | Wenn ein Auftrag nach einem Einsatz nicht fertig ist, muss ein Grund gespeichert werden. |
| F-0112 | Nicht-fertig-Gruende standardisieren | fertig | Fehlendes Material, fehlendes Ersatzteil, offene Kundenentscheidung und Folgeeinsatz sind als Gruende verfuegbar. |
| F-0113 | Material erfassen | fertig | Material kann mit Name, Einheit, Lagerbestand und Lagerort gespeichert werden; Einheit ist `Stueck` oder eine Laengeneinheit `mm`, `cm` oder `m`; bei `Stueck` ist der Lagerbestand ganzzahlig. |
| F-0114 | Materialverbrauch erfassen | fertig | Material, Menge, Auftrag und erfassender Mitarbeiter koennen gespeichert werden; bei `Stueck` ist die Verbrauchsmenge ganzzahlig. |
| F-0115 | Materialverbrauch am Auftrag anzeigen | fertig | Am Auftrag ist sichtbar, welches Material in welcher Menge verbaut wurde. |
| F-0116 | Schnellkunde beim Auftrag anlegen | fertig | Ein Auftrag kann entweder mit einem bestehenden Kunden oder mit Name, Telefonnummer, optionaler Adresse und Kundentyp fuer einen neuen Schnellkunden gespeichert werden; fehlende Kundendaten sind am Auftrag sichtbar. |
| F-0117 | Auftragsarbeit in einer Detailseite buendeln | fertig | Auftragserfassung wird aus der Uebersicht ueber ein Seitenpanel gestartet; nach dem Speichern oder beim Klick auf einen Auftrag oeffnet sich dessen Detailseite; dort sind Auftragsdaten, Einsatzplanung, Rueckmeldungen und Materialverbrauch gebuendelt. |
| F-0118 | Auftrag und zugehoerige Kundendaten bearbeiten | fertig | Beschreibung, Prioritaet, Status und Auftragsteam koennen im Auftragsdetail geaendert werden; pausierte und wartende Status brauchen einen Hinderungsgrund; Name, Telefonnummer, Adresse und Kundentyp des verknuepften Kunden koennen dort getrennt gespeichert werden. |
| F-0119 | Auftragsaktionen bei Bedarf oeffnen | fertig | Die Detailseite zeigt zuerst Kunde, Status, Prioritaet, naechsten Einsatz, Team, Kontakt und einen moeglichen Hinderungsgrund; Einsatzplanung und Materialverbrauch sind anfangs eingeklappt und oeffnen jeweils ein eigenes Seitenfenster; Einsatz- und Materialhistorie bleiben darunter lesbar. |
| F-0120 | Letzten Stand und Auftragsverlauf klar darstellen | fertig | Auftragsdaten, letzter Stand, Aktionen, Auftragsverlauf und Materialverlauf sind als eigene visuelle Bloecke erkennbar; der letzte Rueckmeldungstext und ein Hinderungsgrund stehen prominent; Einsaetze und Rueckmeldungen erscheinen als Zeitleiste bis zur Auftragserfassung; offene Rueckmeldungen oeffnen ein eigenes Seitenfenster. |

## Phase 2: Regeln und einfache Absicherung

| ID | Feature | Status | Akzeptanzkriterien |
|---|---|---|---|
| F-0201 | Notdienst-Vorrang beachten | offen | Notdienst-Auftraege koennen nicht beilaufig verschoben werden; eine Verschiebung braucht eine bewusste Bestaetigung oder Eskalationsnotiz. |
| F-0202 | Lehrlinge nicht allein einplanen | fertig | Ein Lehrling kann keinem Einsatz allein zugeordnet werden; mindestens ein Geselle oder Meister muss ebenfalls zugeordnet sein. |
| F-0203 | Technisch fertig von kaufmaennisch abgeschlossen trennen | fertig | Technisch fertig, Rechnung erstellt und bezahlt sind getrennte Zustaende und werden nicht als ein einzelnes `fertig` vermischt. |
| F-0204 | Zusatzarbeiten erfassen | offen | Zusatzarbeiten koennen mit geschaetztem Betrag und Freigabestatus am Auftrag dokumentiert werden. |
| F-0205 | Schriftliche Freigabe ab 1.500 Euro erzwingen | offen | Zusatzarbeiten ab 1.500 Euro koennen nur mit schriftlicher Freigabe als freigegeben markiert werden. |

## Phase 3: Sollte-Funktionen

| ID | Feature | Status | Akzeptanzkriterien |
|---|---|---|---|
| F-0301 | Werkzeug erfassen | fertig | Werkzeuge koennen mit Name, Status, aktuellem Ort und optional aktuellem Besitzer gespeichert werden. |
| F-0302 | Werkzeugstandort anzeigen | fertig | Teure Werkzeuge wie Bohrhaemmer sind ueber aktuellen Ort oder Besitzer auffindbar. |
| F-0303 | Werkzeugbewegungen nachvollziehen | fertig | Die Ersterfassung und spaetere Standortwechsel legen Historieneintraege mit Ort, optionalem Besitzer, Zeitpunkt und Notiz an. |
| F-0304 | Rechnung vorbereiten | offen | Fuer technisch fertige Auftraege koennen Rechnungsdaten vorbereitet werden. |
| F-0305 | Rechnungsgrundlagen anzeigen | fertig | Materialverbrauch und Rueckmeldungen sind fuer die Rechnungsvorbereitung sichtbar. |

## Phase 4: Kann-Funktionen

| ID | Feature | Status | Akzeptanzkriterien |
|---|---|---|---|
| F-0401 | Rechnung erfassen | offen | Eine Rechnung kann mit Auftrag, Erstellungsdatum, Betrag und Status gespeichert werden. |
| F-0402 | Mahnstatus anzeigen | offen | Offene Rechnungen koennen als offen, bezahlt, Mahnung 1, Mahnung 2 oder Anwalt markiert werden. |
| F-0403 | Eskalation bei Zahlungsausfall abbilden | offen | Nach ausbleibender Zahlung kann der Weg von erster Mahnung bis Anwalt nachvollzogen werden. |
| F-0404 | Einfache Suche und Filter anbieten | fertig | Auftraege koennen nach Nummer, Kunde und Beschreibung durchsucht, nach offen oder abgeschlossen, Status, Prioritaet und Mitarbeiter gefiltert sowie nach letzter Aenderung, naechstem Einsatz oder Prioritaet sortiert werden; Such- und Filterauswahl stehen in der URL und bleiben beim Ruecksprung aus dem Auftragsdetail erhalten. |

## Phase 5: Nichtfunktionale Anforderungen

| ID | Feature | Status | Akzeptanzkriterien |
|---|---|---|---|
| F-0501 | Bedienung einfach halten | offen | Ein Mitarbeiter kann die Kernfunktionen nach ungefaehr zehn Minuten verstehen. |
| F-0502 | Schnelle Alltagserfassung priorisieren | offen | Auftrag, Einsatzrueckmeldung und Materialverbrauch sind mit wenigen klaren Eingaben erfassbar. |
| F-0503 | Keine unnoetigen Auswertungen einbauen | offen | Statistiken und Diagramme werden nicht als Kernnavigation oder Hauptnutzen eingebaut. |
| F-0504 | Lokalen Betrieb sicherstellen | fertig | Die App nutzt lokale Installation und SQLite; keine Cloud-Datenbank, kein Docker und kein Deployment sind erforderlich. |

## Phase 6: Nicht Ziel der ersten Version

| ID | Feature | Status | Akzeptanzkriterien |
|---|---|---|---|
| F-0601 | Komplexe Statistiken | nicht geplant | Wird nicht umgesetzt, solange kein neuer fachlicher Bedarf dokumentiert ist. |
| F-0602 | Diagramme | nicht geplant | Wird nicht umgesetzt, weil die Spec den Alltagsnutzen als gering bewertet. |
| F-0603 | Lange Schulungsablaeufe | nicht geplant | Die App wird nicht um Schulungs- oder Tutorialstrecken herum gebaut. |
| F-0604 | Fotodokumentation | nicht geplant | Wird fuer Version 1 nicht umgesetzt, da nicht als notwendig beschrieben. |
| F-0605 | Grosses Management-Dashboard | nicht geplant | Wird fuer Version 1 nicht umgesetzt, weil das System einfach bleiben soll. |
