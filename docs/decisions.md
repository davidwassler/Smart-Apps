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
