# Architekturentscheidungen

## ADR-0001: Lokale Webapp ohne Deployment

Status: entschieden

Das Projekt wird als lokale Next.js-App umgesetzt. Es gibt kein Deployment, keine Cloud-Datenbank und kein Docker. Das passt zur ersten kleinen Version und vermeidet Infrastrukturaufwand.

## ADR-0002: SQLite mit Prisma

Status: entschieden

SQLite wird als lokale Datenbank genutzt, Prisma als ORM und Migrationswerkzeug. Das reicht fuer eine kleine lokale App und haelt das Datenmodell trotzdem explizit und versionierbar.

## ADR-0003: Spec bleibt unveraendert

Status: entschieden

`docs/spec.md` ist die fachliche Quelle und wird nicht inhaltlich angepasst. Ableitungen, offene Punkte und Umsetzungsstand werden in Backlog, Architektur und README dokumentiert.

## ADR-0004: Keine Dashboard-lastige erste Version

Status: entschieden

Die erste Version konzentriert sich auf Auftragserfassung, Zuordnung, Materialverbrauch und Rueckmeldung. Statistiken, Diagramme und grosse Management-Dashboards sind laut Spec kein Ziel der ersten Version.

## ADR-0005: SQLite-Migration per Prisma SQL-Ausfuehrung

Status: entschieden

`prisma migrate dev` zeigte in dieser lokalen Umgebung mit Prisma 7 einen Schema-Engine-Fehler bei einer frischen SQLite-Datei. Die initiale Migration wird deshalb als SQL-Datei versioniert und per `prisma db execute` angewendet. Prisma bleibt fuer Schema, Client und Datenzugriff gesetzt.

## ADR-0006: Backlog als feine Feature-Liste aus der Spec

Status: entschieden

Das Backlog wird nicht nur nach technischen Arbeitspaketen gefuehrt, sondern bricht jede fachliche Anforderung aus `docs/spec.md` in ein Feature mit stabiler ID, Phase, Status und Akzeptanzkriterien auf. Die Sortierung folgt dem Nutzwert fuer die erste Version: Kernprozess zuerst, danach Regeln, optionale Erweiterungen, nichtfunktionale Anforderungen und bewusst ausgeschlossene Nicht-Ziele.

## ADR-0007: Erste Formulare mit Server Actions

Status: entschieden

Die ersten Schreib-Workflows fuer Kunden, Mitarbeiter, Material und Auftraege werden als Next.js Server Actions umgesetzt. Das haelt die lokale App klein, vermeidet eine zusaetzliche API-Schicht und passt zum aktuellen Ziel, schnell nutzbare Kernformulare gegen SQLite bereitzustellen.

## ADR-0008: Prisma 7 mit libSQL Adapter

Status: entschieden

Prisma 7 erwartet beim Prisma Client einen Driver Adapter. Der zunaechst naheliegende `better-sqlite3`-Adapter benoetigte in dieser Windows/Node-Umgebung native Build-Werkzeuge und scheiterte an fehlendem Python/node-gyp-Setup. Fuer die lokale SQLite-Datei wird deshalb `@prisma/adapter-libsql` mit `@libsql/client` verwendet.

## ADR-0009: Einsatzregeln serverseitig validieren

Status: entschieden

Die Lehrlingsregel und der Pflichtgrund fuer nicht fertige Auftraege werden in Server Actions validiert. Damit gelten die Regeln unabhaengig davon, wie das Formular spaeter visuell erweitert wird, und sie sind nicht nur eine UI-Empfehlung.

## ADR-0010: Materialverbrauch reduziert Lagerbestand sofort

Status: entschieden

Beim Erfassen von Materialverbrauch wird der Lagerbestand in derselben Datenbanktransaktion reduziert. Die Server Action prueft, dass die Menge groesser als 0 ist und den verfuegbaren Bestand nicht ueberschreitet, damit Rechnungsvorbereitung und Nachbestellung auf konsistenteren Daten beruhen.

## ADR-0011: Materialeinheiten auf Stueck und konkrete Laengeneinheiten begrenzen

Status: entschieden

Materialeinheiten werden in der UI als Dropdown mit `Stueck` und `Laenge` gefuehrt. Wenn `Laenge` gewaehlt wird, muss zusaetzlich `mm`, `cm` oder `m` gewaehlt werden; gespeichert wird die konkrete Einheit. Bei `Stueck` muessen Lagerbestand und Verbrauchsmengen ganzzahlig sein; bei Laengeneinheiten sind Dezimalwerte erlaubt. Die Regel wird serverseitig validiert, damit der Datenbestand auch bei spaeteren UI-Aenderungen konsistent bleibt.

## ADR-0012: Auftragsuebersicht als Startscreen, Stammdaten getrennt

Status: entschieden

Die Startseite wird als taegliche Auftragsuebersicht gefuehrt. Kunden, Mitarbeiter und Material sind Stammdaten und bekommen eigene Seiten. Dadurch bleibt der Kernprozess sichtbar, waehrend Pflegeformulare nicht mehr die Auftragsarbeit ueberladen.

## ADR-0013: Werkzeugstandort als eigener Screen

Status: entschieden

Werkzeuge bekommen eine eigene Seite, weil sie nicht zum taeglichen Auftragsformular gehoeren, aber schnell auffindbar sein muessen. Die Ersterfassung speichert Status, Ort und optionalen Besitzer und legt direkt einen Historieneintrag an; ein spaeterer Standortwechsel-Workflow kann darauf aufbauen.

## ADR-0014: Werkzeugstandort und Historie gemeinsam aktualisieren

Status: entschieden

Ein Standortwechsel aktualisiert immer den aktuellen Werkzeugdatensatz und legt zugleich einen `WerkzeugUebergabe`-Eintrag an. Dadurch bleibt die Liste schnell lesbar, waehrend Bewegungen weiterhin nachvollziehbar sind.

## ADR-0015: Wiederholbares Demo-Seed

Status: entschieden

Demo-Daten werden ueber ein TypeScript-Seed-Script angelegt. Das Script entfernt nur Datensaetze mit festen Demo-Namen und legt sie neu an, damit es wiederholbar ist, ohne beliebige lokale Testdaten zu loeschen.

## ADR-0016: Auftragserfassung als Einstieg mit Schnellkunde

Status: entschieden

Der Alltag beginnt meistens mit einer Anfrage oder einem Anruf. Deshalb kann ein Auftrag direkt mit einem bestehenden Kunden oder mit einem neuen Schnellkunden angelegt werden. Fuer Schnellkunden reichen Name und Telefonnummer; eine fehlende Adresse wird am Auftrag sichtbar, damit die Stammdaten spaeter auf der Kundenseite vervollstaendigt werden koennen.

## ADR-0017: Auftragsuebersicht von der Auftragsarbeit trennen

Status: entschieden

Die Startseite dient als ruhige Uebersicht mit wenigen Status-Kennzahlen und einer kompakten Liste aller Auftraege. Ein neuer Auftrag wird in einem seitlichen Panel erfasst und danach direkt geoeffnet. Einsatzplanung, Rueckmeldungen und Materialverbrauch gehoeren fachlich zu einem konkreten Auftrag und liegen deshalb ausschliesslich in dessen Detailseite unter `/auftraege/[id]`. So bleibt die Uebersicht schnell erfassbar und auftragsbezogene Arbeit hat einen eindeutigen Kontext.

## ADR-0018: Auftrag und Kunde getrennt im selben Panel speichern

Status: entschieden

Die Auftragsdetailseite bietet ein gemeinsames Bearbeiten-Panel, darin werden Auftragsdaten und Kundendaten jedoch ueber getrennte Formulare gespeichert. Dadurch kann das Buero Status, Prioritaet oder Team aendern, obwohl eine Kundenadresse noch fehlt. Teamzuordnungen werden beim Speichern des Auftrags in einer Transaktion ersetzt. Eine Kundenaenderung prueft serverseitig, dass der Kunde tatsaechlich mit dem geoeffneten Auftrag verknuepft ist.

## ADR-0019: Detailinformationen vor Erfassungsformularen

Status: entschieden

Die Auftragsdetailseite priorisiert zuerst die Informationen, die fuer die naechste Entscheidung gebraucht werden: Kunde und Status, danach Prioritaet, naechster Einsatz, Team, Kontakt und gegebenenfalls ein Hinderungsgrund. Einsatzplanung und Materialverbrauch werden als Aktionen angeboten und erst nach einem Klick in getrennten Seitenfenstern angezeigt. Der Einsatzverlauf steht vor der Materialhistorie, weil Termin und Rueckmeldung den aktuellen Arbeitsstand staerker bestimmen.

## ADR-0020: Fachliche Bloecke und Zeitleiste im Auftragsdetail

Status: entschieden

Die Auftragsdetailseite trennt Auftragsdaten, letzten Stand, Aktionen, Auftragsverlauf und Materialverlauf durch eigenstaendige, klar gerahmte Bereiche ohne Schatten oder dekorative Verschachtelung. Der letzte vorhandene Rueckmeldungstext wird unabhaengig von der Einsatzliste als aktueller Arbeitsstand hervorgehoben. Einsaetze bilden eine Zeitleiste, die mit der Auftragserfassung endet. Offene Rueckmeldungsformulare werden erst in einem Seitenfenster geoeffnet, damit der Verlauf lesbar bleibt.

## ADR-0021: Auftragsfilter als URL-Zustand

Status: entschieden

Suche, Bereich, Status, Prioritaet, Mitarbeiter und Sortierung werden als Query-Parameter der Auftragsuebersicht gefuehrt. Die lokale Datenmenge wird nach dem Prisma-Lesen im Server Component gefiltert und fachlich sortiert; dadurch lassen sich auch Prioritaetsreihenfolge und naechster geplanter Einsatz ohne zusaetzliche Datenbankfelder abbilden. Auftragslinks tragen die aktuelle Uebersichts-URL als validierten Ruecksprung mit, damit Filter nach der Detailansicht erhalten bleiben.

## ADR-0022: Zusatzarbeiten als eigene Entitaet mit Freigabesicherung

Status: entschieden

Zusatzarbeiten werden als eigene 1:n-Entitaet unterhalb eines Auftrags gespeichert, weil ein Auftrag mehrere Nachtraege mit eigener Beschreibung, eigenem Betrag und eigenem Freigabestatus haben kann. Die fruehen einzelnen Platzhalterfelder am Auftrag werden im Prisma-Modell nicht weiter verwendet. Ab mindestens 1.500 Euro lehnen Server Actions den Status `NICHT_ERFORDERLICH` ab. Als Ausfuehrungsfreigabe gilt in diesem Fall ausschliesslich `SCHRIFTLICH_FREIGEGEBEN`; angefragte oder abgelehnte Zusatzarbeiten bleiben im Auftrag sichtbar gesperrt.

## ADR-0023: Beide lokalen Entwicklungsadressen unterstuetzen

Status: entschieden

Die App kann lokal ueber `localhost` und `127.0.0.1` geoeffnet werden. Next.js blockiert unbekannte Entwicklungs-Origins fuer seine Client-Ressourcen; dadurch kann die HTML-Seite zwar erscheinen, clientseitige Buttons und Dialoge bleiben aber ohne Funktion. Deshalb wird ausschliesslich `127.0.0.1` als zusaetzliche lokale Entwicklungs-Origin in `next.config.ts` zugelassen. Die Einstellung erweitert weder das Netzwerk noch fuehrt sie ein Deployment ein.

## ADR-0024: Notdienst-Verschiebungen als eigene Historie sichern

Status: entschieden

Ein geplanter Einsatz behaelt beim Verschieben seine Identitaet und sein Team; nur sein aktuelles Datum wird geaendert. Jeder Terminwechsel wird zusaetzlich als eigener `EinsatzVerschiebung`-Datensatz mit vorherigem Datum, neuem Datum, Begruendung und Notdienst-Bestaetigung gespeichert. Bei Prioritaet `NOTDIENST` lehnt die Server Action eine Verschiebung ohne explizite Bestaetigung der Ersatzbesetzung oder sofortigen Neuplanung ab. Dadurch ist die Regel nicht nur ein Hinweis in der UI und wiederholte Verschiebungen bleiben im Auftragsverlauf nachvollziehbar.
