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
