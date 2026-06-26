# Spezifikation: Brandt & Söhne Elektro

## 1. Ausgangslage

Brandt & Söhne Elektro ist ein Elektro-Handwerksbetrieb. Die Firma arbeitet aktuell noch sehr viel mit Zetteln, Telefonaten und mündlichen Rückmeldungen. Aufträge werden von der Frau von Thomas Brandt aufgenommen. Danach werden Mitarbeiter zu den Kunden geschickt. Nach dem Einsatz melden die Mitarbeiter meistens mündlich, wie lange sie dort waren und was gemacht wurde.

Das Problem ist, dass Informationen dabei oft verloren gehen. Manchmal ist nicht klar, ob ein Auftrag fertig ist, ob noch Material fehlt oder ob ein Kunde noch etwas entscheiden muss. Auch Material wird oft nicht richtig erfasst. Dadurch können Rechnungen falsch oder zu spät geschrieben werden. Außerdem ist nicht immer klar, wo sich teure Werkzeuge wie Bohrhämmer befinden.

Die App soll deshalb vor allem einfach helfen, Aufträge, Mitarbeiter, Material und Werkzeuge besser zu verwalten. Sie soll nicht zu kompliziert sein, weil die Mitarbeiter sie sonst wahrscheinlich nicht benutzen würden.

## 2. Entitäten

### 2.1 Kunde

Ein Kunde ist eine Person oder ein Unternehmen, das einen Auftrag erteilt.

| Attribut | Datentyp | Beschreibung |
|---|---|---|
| `kunden_id` | Integer | Eindeutige ID des Kunden |
| `name` | String | Name des Kunden |
| `telefonnummer` | String | Telefonnummer für Rückfragen |
| `adresse` | String | Adresse des Kunden |
| `kundentyp` | Enum | Privatkunde oder Firmenkunde |

### 2.2 Auftrag

Ein Auftrag beschreibt eine konkrete Arbeit, zum Beispiel eine Reparatur, Installation oder einen Notdienst.

| Attribut | Datentyp | Beschreibung |
|---|---|---|
| `auftrag_id` | Integer | Eindeutige ID des Auftrags |
| `kunde_id` | Integer | Zugehöriger Kunde |
| `beschreibung` | Text | Problem oder Aufgabe |
| `status` | Enum | Aktueller Stand des Auftrags |
| `prioritaet` | Enum | Normal, dringend oder Notdienst |

#### Mögliche Statuswerte

| Status | Bedeutung |
|---|---|
| `aufgenommen` | Auftrag wurde erfasst |
| `geplant` | Auftrag ist eingeplant |
| `in Bearbeitung` | Mitarbeiter arbeiten daran |
| `pausiert` | Auftrag liegt vorübergehend still |
| `wartet auf Material` | Material oder Ersatzteil fehlt |
| `wartet auf Kundenentscheidung` | Kunde muss noch etwas entscheiden |
| `technisch fertig` | Arbeit vor Ort ist erledigt |
| `Rechnung erstellt` | Rechnung wurde geschrieben |
| `bezahlt` | Rechnung wurde bezahlt |
| `gemahnt` | Zahlung ist überfällig |
| `eskaliert` | Fall wurde an Anwalt weitergegeben |

### 2.3 Einsatz

Ein Einsatz ist ein konkreter Termin oder Arbeitstag innerhalb eines Auftrags. Das ist wichtig, weil manche Aufträge über mehrere Tage laufen oder unterbrochen werden.

| Attribut | Datentyp | Beschreibung |
|---|---|---|
| `einsatz_id` | Integer | Eindeutige ID des Einsatzes |
| `auftrag_id` | Integer | Zugehöriger Auftrag |
| `datum` | Datum | Tag des Einsatzes |
| `status` | Enum | Geplant, durchgeführt oder verschoben |
| `rueckmeldung` | Text | Ergebnis oder Problem nach dem Einsatz |

### 2.4 Mitarbeiter

Ein Mitarbeiter ist eine Person im Betrieb, die entweder auf der Baustelle arbeitet oder organisatorische Aufgaben übernimmt.

| Attribut | Datentyp | Beschreibung |
|---|---|---|
| `mitarbeiter_id` | Integer | Eindeutige ID des Mitarbeiters |
| `name` | String | Name des Mitarbeiters |
| `rolle` | Enum | Geschäftsführer, Büro, Meister, Geselle, Lehrling |
| `telefonnummer` | String | Telefonnummer |
| `aktiv` | Boolean | Gibt an, ob der Mitarbeiter aktuell verfügbar ist |

### 2.5 Material

Material ist Verbrauchsmaterial, das bei einem Auftrag verbaut wird.

| Attribut | Datentyp | Beschreibung |
|---|---|---|
| `material_id` | Integer | Eindeutige ID des Materials |
| `name` | String | Name des Materials |
| `einheit` | String | Stück, Meter usw. |
| `lagerbestand` | Decimal | Aktueller Bestand |
| `lagerort` | String | Lager, Fahrzeug oder anderer Ort |

Beispiele sind Kabel, Sicherungen, Steckdosen und Schalter.

### 2.6 Materialverbrauch

Der Materialverbrauch hält fest, welches Material bei welchem Auftrag verbaut wurde.

| Attribut | Datentyp | Beschreibung |
|---|---|---|
| `verbrauch_id` | Integer | Eindeutige ID des Verbrauchs |
| `auftrag_id` | Integer | Zugehöriger Auftrag |
| `material_id` | Integer | Verwendetes Material |
| `menge` | Decimal | Verbrauchte Menge |
| `erfasst_von` | Integer | Mitarbeiter, der den Verbrauch eingetragen hat |

### 2.7 Werkzeug

Werkzeuge sind wiederverwendbare Geräte, bei denen der aktuelle Standort wichtig ist.

| Attribut | Datentyp | Beschreibung |
|---|---|---|
| `werkzeug_id` | Integer | Eindeutige ID des Werkzeugs |
| `name` | String | Name des Werkzeugs |
| `status` | Enum | Verfügbar, bei Mitarbeiter, Werkstatt oder unbekannt |
| `aktueller_ort` | String | Werkstatt, Fahrzeug oder Baustelle |
| `aktueller_besitzer_id` | Integer | Mitarbeiter, der das Werkzeug aktuell hat |

Ein wichtiges Beispiel ist der Bohrhammer.

### 2.8 Rechnung

Eine Rechnung gehört zu einem Auftrag und wird nach der technischen Fertigmeldung vorbereitet oder erstellt.

| Attribut | Datentyp | Beschreibung |
|---|---|---|
| `rechnung_id` | Integer | Eindeutige ID der Rechnung |
| `auftrag_id` | Integer | Zugehöriger Auftrag |
| `erstellt_am` | Datum | Datum der Rechnungserstellung |
| `status` | Enum | Offen, bezahlt, Mahnung 1, Mahnung 2, Anwalt |
| `betrag` | Decimal | Rechnungsbetrag |

## 3. Beziehungen

| Nr. | Beziehung | Kardinalität | Beschreibung |
|---|---|---|---|
| B1 | Kunde zu Auftrag | 1:n | Ein Kunde kann mehrere Aufträge haben. Ein Auftrag gehört zu genau einem Kunden. |
| B2 | Auftrag zu Einsatz | 1:n | Ein Auftrag kann aus mehreren Einsätzen bestehen. Ein Einsatz gehört zu genau einem Auftrag. |
| B3 | Auftrag zu Rechnung | 1:1 | Ein Auftrag hat höchstens eine Rechnung. Eine Rechnung gehört zu genau einem Auftrag. |
| B4 | Auftrag zu Mitarbeiter | n:m | Ein Auftrag kann mehrere Mitarbeiter haben. Ein Mitarbeiter kann an mehreren Aufträgen arbeiten. |
| B5 | Einsatz zu Mitarbeiter | n:m | Ein Einsatz kann mehrere Mitarbeiter haben. Ein Mitarbeiter kann an vielen Einsätzen beteiligt sein. |
| B6 | Auftrag zu Material | n:m | Ein Auftrag kann mehrere Materialien verbrauchen. Ein Material kann in vielen Aufträgen verbaut werden. |
| B7 | Materialverbrauch zu Mitarbeiter | n:1 | Ein Materialverbrauch wird von einem Mitarbeiter erfasst. Ein Mitarbeiter kann viele Materialverbräuche erfassen. |
| B8 | Werkzeug zu Mitarbeiter | n:m | Ein Werkzeug kann nacheinander bei verschiedenen Mitarbeitern sein. Ein Mitarbeiter kann mehrere Werkzeuge haben. |

Die wichtigste n:m-Beziehung ist Auftrag zu Material. Ein Auftrag kann viele Materialien enthalten und ein Material kann in vielen Aufträgen vorkommen. Diese Beziehung wird über die Entität Materialverbrauch genauer beschrieben.

## 4. Business Rules

| ID | Regel | Beschreibung |
|---|---|---|
| BR1 | Notdienst hat Vorrang | Wenn ein Auftrag ein Notdienst ist, darf er nicht einfach verschoben werden. Auch wenn ein Mitarbeiter krank ist oder andere Termine geplant sind, muss jemand zum Notdienst fahren. |
| BR2 | Lehrlinge dürfen nicht alleine arbeiten | Wenn ein Mitarbeiter ein Lehrling ist, darf er keinem Einsatz alleine zugeordnet werden. Ein Lehrling muss immer zusammen mit einem Gesellen oder Meister eingesetzt werden, weil die Arbeit mit Strom gefährlich ist. |
| BR3 | Nicht fertige Aufträge brauchen einen Grund | Wenn ein Auftrag nach einem Einsatz nicht fertig ist, muss ein Grund eingetragen werden. Mögliche Gründe sind fehlendes Material, ein fehlendes Ersatzteil, eine offene Kundenentscheidung oder ein nötiger Folgeeinsatz. |
| BR4 | Zusatzarbeiten ab 1.500 Euro brauchen eine schriftliche Freigabe | Wenn Zusatzarbeiten voraussichtlich mindestens 1.500 Euro kosten, muss vorher ein schriftliches Angebot erstellt und vom Kunden unterschrieben werden. Ohne Unterschrift soll die Zusatzarbeit nicht ausgeführt werden. |
| BR5 | Ein Auftrag ist erst nach Zahlung vollständig abgeschlossen | Wenn der Mitarbeiter meldet, dass alles funktioniert, ist der Auftrag nur technisch fertig. Vollständig abgeschlossen ist er erst, wenn die Rechnung bezahlt wurde. Wenn die Zahlung ausbleibt, gibt es erst einen Brief, dann einen zweiten Brief und danach geht der Fall zum Anwalt. |

## 5. Widersprüche und Auflösung

### W1: Wann ist ein Auftrag fertig?

Im Gespräch wurde einerseits gesagt, dass der Mitarbeiter irgendwann meldet, dass der Auftrag fertig ist und alles läuft. Andererseits wurde gesagt, dass ein Auftrag erst abgeschlossen ist, wenn die Rechnung bezahlt wurde.

Das ist kein direkter Fehler, sondern es gibt zwei verschiedene Bedeutungen von fertig. Ein Auftrag kann technisch fertig sein, wenn die Arbeit vor Ort erledigt ist. Kaufmännisch abgeschlossen ist er aber erst, wenn die Rechnung bezahlt wurde.

Für die App bedeutet das, dass es nicht nur einen einfachen Status fertig geben sollte. Es braucht mindestens eine Trennung zwischen technisch fertig, Rechnung erstellt und bezahlt.

### W2: Wer entscheidet über Zusatzarbeiten?

Zuerst klang es so, als würde Thomas Brandt alle Entscheidungen selbst treffen. Später wurde aber klar, dass Mitarbeiter oder Meister kleinere Dinge vor Ort selbst mit dem Kunden klären dürfen.

Die Auflösung ist, dass es verschiedene Entscheidungsebenen gibt. Kleine Änderungen mit wenig Aufwand darf der Mitarbeiter direkt klären. Größere Änderungen entscheidet Thomas Brandt. Ab 1.500 Euro braucht es zusätzlich ein schriftliches Angebot mit Unterschrift des Kunden.

Für die App bedeutet das, dass Zusatzarbeiten mit geschätztem Betrag und Freigabestatus erfasst werden sollten.

## 6. Prioritäten für die erste Version

Die erste Version soll bewusst klein bleiben. Laut Kunde sind vor allem drei Punkte wichtig.

| Priorität | Anforderung | Begründung |
|---|---|---|
| Muss | Auftrag erfassen | Ohne Auftrag gibt es keine Übersicht über Kunde, Ort und Problem. |
| Muss | Mitarbeiter zuordnen | Thomas muss sehen, wer zu welchem Auftrag fährt. |
| Muss | Materialverbrauch erfassen | Das Material wird für Rechnung und Nachbestellung benötigt. |
| Muss | Status nach Einsatz erfassen | Das Büro muss wissen, ob ein Auftrag fertig ist oder nochmal angefahren werden muss. |
| Muss | Grund bei nicht fertigem Auftrag erfassen | Sonst ist unklar, ob Material fehlt oder der Kunde noch entscheiden muss. |
| Sollte | Werkzeugstandort erfassen | Teure Werkzeuge wie Bohrhämmer sollen auffindbar sein. |
| Sollte | Rechnungsvorbereitung unterstützen | Wenn Stunden und Material stimmen, kann die Rechnung zuverlässiger erstellt werden. |
| Kann | Mahnstatus anzeigen | Hilft beim Überblick über offene Rechnungen, ist aber nicht der Kern der ersten Version. |

## 7. Nichtfunktionale Anforderungen

Die App muss einfach und schnell verständlich sein. Thomas Brandt sagte sinngemäß, dass ein Mitarbeiter die App nach ungefähr zehn Minuten verstehen muss. Wenn die Bedienung zu kompliziert ist, wird sie nicht genutzt.

Außerdem soll die App keine unnötigen Auswertungen enthalten. Statistiken, Diagramme und umfangreiche Dashboards sind für den Kunden nicht wichtig. Der Nutzen liegt darin, dass Aufträge, Material und Rechnungen stimmen.

## 8. Nicht Ziel der ersten Version

Folgende Dinge sollen in der ersten Version nicht umgesetzt werden:

| Nicht Ziel | Grund |
|---|---|
| Komplexe Statistiken | Wird vom Kunden nicht gebraucht |
| Diagramme | Bringt im Alltag wenig Nutzen |
| Lange Schulungen | Mitarbeiter würden die App dann nicht nutzen |
| Fotodokumentation | Wurde nicht als notwendig gesehen |
| Großes Management-Dashboard | Passt nicht zum gewünschten einfachen System |

## 9. Fazit

Das Anforderungsmodell zeigt, dass Brandt & Söhne Elektro kein kompliziertes System braucht. Das Hauptproblem ist, dass Informationen aktuell zu oft auf Zetteln, im Kopf oder mündlich weitergegeben werden. Dadurch fehlen Daten für Planung, Materialbestand und Rechnungen.

Die App sollte deshalb vor allem die einfachen Kernprozesse digital abbilden. Wichtig sind Auftragserfassung, Mitarbeiterzuordnung, Materialverbrauch und Statusrückmeldung. Alles Weitere sollte nur ergänzt werden, wenn es den Alltag wirklich einfacher macht.
