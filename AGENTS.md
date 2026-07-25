# AGENTS.md

## Auftrag

Arbeite in diesem Repo als kleines lokales Webprojekt fuer Brandt & Soehne Elektro. Die fachliche Grundlage ist ausschliesslich `docs/spec.md`.

## Grundregeln

- Aendere `docs/spec.md` nicht inhaltlich.
- Leite neue Features aus `docs/spec.md`, `docs/backlog.md` und `docs/architecture.md` ab.
- Halte die erste Version bewusst einfach: keine komplexen Dashboards, keine Diagramme, keine Cloud, kein Docker.
- Arbeite mit Next.js, TypeScript, SQLite und Prisma.
- Dokumentiere fachliche oder technische Richtungsentscheidungen kurz in `docs/decisions.md`.
- Pflege neue Features mit stabiler ID, Phase, Status und Akzeptanzkriterien in `docs/backlog.md`.

## Umsetzung

- Bevorzuge klare Server-seitige Datenfluesse und einfache Formulare.
- Business Rules aus der Spec duerfen nicht nur in der UI versteckt sein; wichtige Regeln gehoeren in validierbare Funktionen oder serverseitige Logik.
- Halte Bezeichnungen im Code fachlich nah an der Spec.
- Vermeide unnoetige Abstraktionen, solange der Kernprozess noch klein ist.

## Qualitaet

- Fuehre nach relevanten Aenderungen mindestens `npm run lint` aus.
- Fuehre bei Datenmodell-Aenderungen `npm run prisma:generate` aus.
- Dokumentiere bekannte Einschraenkungen im README oder Backlog.
