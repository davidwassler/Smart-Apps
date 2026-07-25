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

## ADR-0025: Rechnung und Auftragsstatus atomar erstellen

Status: entschieden

Die Rechnungsvorbereitung nutzt das bereits in der Spec definierte 1:1-Modell `Rechnung`. Sie ist nur fuer Auftraege im Status `TECHNISCH_FERTIG` ohne vorhandene Rechnung zulaessig; unfreigegebene Zusatzarbeiten ab 1.500 Euro blockieren den Vorgang. Rechnung mit Startstatus `OFFEN` und Auftragsstatus `RECHNUNG_ERSTELLT` werden in derselben Transaktion gespeichert. Kaufmaennische Auftragsstatus sind im allgemeinen Auftragsformular nicht frei waehlbar, damit sie nicht an der Rechnung vorbei geaendert werden. Materialpreise und Arbeitsstunden sind in der Spec nicht als Datenfelder modelliert, deshalb werden vorhandene Rueckmeldungen, Mengen und Zusatzarbeiten als Grundlage angezeigt, der endgueltige Rechnungsbetrag aber bewusst manuell erfasst.

## ADR-0026: Rechnungsstatus als gepruefte Historie

Status: entschieden

Rechnungsstatus werden nicht frei ueberschrieben, sondern folgen erlaubten Uebergaengen: `OFFEN` zu `BEZAHLT` oder `MAHNUNG_1`, danach schrittweise zu `MAHNUNG_2` und `ANWALT`; eine Zahlung bleibt aus jedem nicht bezahlten Zustand moeglich. Jeder Wechsel braucht eine Notiz und erzeugt einen unveraenderlichen `RechnungStatuswechsel`-Datensatz. Rechnung, Historie und der abgeleitete Auftragsstatus werden in derselben Transaktion gespeichert. Dadurch bleiben kaufmaennischer Zustand und Auftragsuebersicht konsistent und der Eskalationsweg ist nachvollziehbar.

## ADR-0027: Einheitliche Formularzustaende und Browserpruefungen

Status: entschieden

Fachliche Server Actions bleiben die zentrale Schreiblogik und werden fuer die Oberflaeche durch gemeinsame Form-Action-Wrapper ergaenzt. Diese liefern strukturierte Erfolgs- und Fehlerzustaende; das gemeinsame `ActionForm` zeigt sie barrierearm an und stellt Eingaben nach einem Serverfehler wieder her. `SubmitButton` sperrt Mehrfachabsenden und zeigt den laufenden Vorgang. Dialoge verwalten ihren Tastaturfokus gemeinsam. Die wichtigsten zusammenhaengenden Arbeitsablaeufe werden mit Playwright gegen die lokale Anwendung und reproduzierbare Demo-Daten geprueft, waehrend isolierte Business Rules weiterhin schnelle TypeScript-Tests behalten.

## ADR-0028: Chronologie zeigt den Status zum Ereigniszeitpunkt

Status: entschieden

Chronologieeintraege stellen den Zustand zum jeweiligen Ereigniszeitpunkt dar. Eine neu angelegte Rechnung startet fachlich immer mit `OFFEN`; deshalb bleibt der Eintrag `Rechnung erstellt` auch nach einer Zahlung oder Mahnung mit `Offen` gekennzeichnet. Der aktuelle und jeder spaetere Rechnungsstatus wird ueber die getrennten Statuswechsel-Eintraege dargestellt. Dadurch entsteht keine scheinbare doppelte Zahlung in der Historie.

## ADR-0029: Browserpruefungen nutzen eine isolierte SQLite-Datei

Status: entschieden

Playwright arbeitet mit `test-e2e.db`, dem Next.js-Build-Verzeichnis `.next-e2e` und einem eigenen Entwicklungsserver auf Port 3100. Das vorbereitende Seed setzt nur diese Testdatei zurueck. Die normale lokale Datenbank kann manuell erfasste Auftraege mit Demo-Stammdaten verknuepfen und darf deshalb nicht durch automatisierte Tests bereinigt oder veraendert werden. Die Trennung verhindert Datenverlust, Fremdschluesselkonflikte und Wechselwirkungen mit einer auf Port 3000 laufenden App.

## ADR-0030: Demo-Mitarbeiter beim erneuten Seed wiederverwenden

Status: entschieden

Demo-Mitarbeiter werden beim erneuten Seed anhand ihres festen Namens gefunden und auf die definierten Demowerte aktualisiert. Sie werden nicht mehr geloescht und neu angelegt, weil manuell erfasste Auftraege oder Einsaetze bereits auf diese Stammdatensaetze verweisen koennen. Die fachlichen Demo-Auftraege werden weiterhin reproduzierbar neu aufgebaut, waehrend bestehende Mitarbeiterreferenzen gueltig bleiben.

## ADR-0031: Aktueller Abschlusszustand hat in der Uebersicht Vorrang

Status: entschieden

Die Zeilenmarkierung der Auftragsuebersicht richtet sich zuerst nach dem aktuellen Abschlusszustand. Auftraege mit Status `BEZAHLT` erhalten einen hellgruenen Hintergrund und einen gruenen Rand. Bei einem bezahlten Notdienst wird die rote Notdienst-Randmarkierung nicht mehr verwendet, weil sie faelschlich einen noch akuten Handlungsbedarf vermittelt. Die historische Prioritaet bleibt im Prioritaetsfeld sichtbar.

## ADR-0032: Adresse strukturiert erfassen und kompatibel speichern

Status: entschieden

Kundenformulare erfassen `Strasse + Nr.`, eine fuenfstellige `PLZ` und `Ort` als getrennte Eingaben. Intern werden die Werte weiterhin im vorhandenen Feld `Kunde.adresse` im Format `Strasse, PLZ Ort` gespeichert. Dadurch werden keine riskante SQLite-Tabellenmigration und keine doppelten Adressquellen eingefuehrt. Bestehende korrekt formatierte Adressen werden beim Bearbeiten aufgeteilt; abweichende Altdaten bleiben sichtbar und koennen im Bearbeitungsfenster vervollstaendigt werden.

## ADR-0033: Stammdaten direkt aus Listen bearbeiten

Status: entschieden

Kunden, Mitarbeiter, Material und Werkzeuge werden ueber die gesamte jeweilige Listenzeile geoeffnet und in einem gemeinsamen Seitenfenster bearbeitet. Die Update-Logik bleibt in typisierten Server Actions mit denselben Validierungen wie bei der Erfassung. Bei Werkzeugen erzeugen Aenderungen an Status, Ort oder Besitzer weiterhin einen Historieneintrag; reine Namensaenderungen erzeugen keine kuenstliche Bewegung.

## ADR-0034: Abschlussmarkierung in beiden kaufmaennischen Uebersichten

Status: entschieden

Der hellgruene Hintergrund mit gruenem Rand kennzeichnet den aktuellen Abschlusszustand sowohl in der Auftrags- als auch in der Rechnungsuebersicht. Dadurch wird `BEZAHLT` bereits auf Zeilenebene erkennbar und nicht nur ueber einen kleinen Status-Badge vermittelt. Offene und gemahnte Rechnungen behalten den neutralen Zeilenhintergrund und ihre jeweiligen Statusfarben.
