# Spezifikation: Brandt & Soehne Elektro

## 1. Ausgangslage

Brandt & Soehne Elektro ist ein Elektro-Handwerksbetrieb. Die Firma arbeitet aktuell noch sehr viel mit Zetteln, Telefonaten und muendlichen Rueckmeldungen. Auftraege werden von der Frau von Thomas Brandt aufgenommen. Danach werden Mitarbeiter zu den Kunden geschickt. Nach dem Einsatz melden die Mitarbeiter meistens muendlich, wie lange sie dort waren und was gemacht wurde.

Das Problem ist, dass Informationen dabei oft verloren gehen. Manchmal ist nicht klar, ob ein Auftrag fertig ist, ob noch Material fehlt oder ob ein Kunde noch etwas entscheiden muss. Auch Material wird oft nicht richtig erfasst. Dadurch koennen Rechnungen falsch oder zu spaet geschrieben werden. Ausserdem ist nicht immer klar, wo sich teure Werkzeuge wie Bohrhaemmer befinden.

Die App soll deshalb vor allem einfach helfen, Auftraege, Mitarbeiter, Material und Werkzeuge besser zu verwalten. Sie soll nicht zu kompliziert sein, weil die Mitarbeiter sie sonst wahrscheinlich nicht benutzen wuerden.

## 2. Entitaeten

### 2.1 Kunde

Ein Kunde ist eine Person oder ein Unternehmen, das einen Auftrag erteilt.

| Attribut | Datentyp | Beschreibung |
|---|---|---|
| `kunden_id` | Integer | Eindeutige ID des Kunden |
| `name` | String | Name des Kunden |
| `telefonnummer` | String | Telefonnummer fuer Rueckfragen |
| `adresse` | String | Adresse des Kunden |
| `kundentyp` | Enum | Privatkunde oder Firmenkunde |

### 2.2 Auftrag

Ein Auftrag beschreibt eine konkrete Arbeit, zum Beispiel eine Reparatur, Installation oder einen Notdienst.

| Attribut | Datentyp | Beschreibung |
|---|---|---|
| `auftrag_id` | Integer | Eindeutige ID des Auftrags |
| `kunde_id` | Integer | Zugehoeriger Kunde |
| `beschreibung` | Text | Problem oder Aufgabe |
| `status` | Enum | Aktueller Stand des Auftrags |
| `prioritaet` | Enum | Normal, dringend oder Notdienst |

#### Moegliche Statuswerte

| Status | Bedeutung |
|---|---|
| `aufgenommen` | Auftrag wurde erfasst |
| `geplant` | Auftrag ist eingeplant |
| `in Bearbeitung` | Mitarbeiter arbeiten daran |
| `pausiert` | Auftrag liegt voruebergehend still |
| `wartet auf Material` | Material oder Ersatzteil fehlt |
| `wartet auf Kundenentscheidung` | Kunde muss noch etwas entscheiden |
| `technisch fertig` | Arbeit vor Ort ist erledigt |
| `Rechnung erstellt` | Rechnung wurde geschrieben |
| `bezahlt` | Rechnung wurde bezahlt |
| `gemahnt` | Zahlung ist ueberfaellig |
| `eskaliert` | Fall wurde an Anwalt weitergegeben |

### 2.3 Einsatz

Ein Einsatz ist ein konkreter Termin oder Arbeitstag innerhalb eines Auftrags. Das ist wichtig, weil manche Auftraege ueber mehrere Tage laufen oder unterbrochen werden.

| Attribut | Datentyp | Beschreibung |
|---|---|---|
| `einsatz_id` | Integer | Eindeutige ID des Einsatzes |
| `auftrag_id` | Integer | Zugehoeriger Auftrag |
| `datum` | Datum | Tag des Einsatzes |
| `status` | Enum | Geplant, durchgefuehrt oder verschoben |
| `rueckmeldung` | Text | Ergebnis oder Problem nach dem Einsatz |

### 2.4 Mitarbeiter

Ein Mitarbeiter ist eine Person im Betrieb, die entweder auf der Baustelle arbeitet oder organisatorische Aufgaben uebernimmt.

| Attribut | Datentyp | Beschreibung |
|---|---|---|
| `mitarbeiter_id` | Integer | Eindeutige ID des Mitarbeiters |
| `name` | String | Name des Mitarbeiters |
| `rolle` | Enum | Geschaeftsfuehrer, Buero, Meister, Geselle, Lehrling |
| `telefonnummer` | String | Telefonnummer |
| `aktiv` | Boolean | Gibt an, ob der Mitarbeiter aktuell verfuegbar ist |

### 2.5 Material

Material ist Verbrauchsmaterial, das bei einem Auftrag verbaut wird.

| Attribut | Datentyp | Beschreibung |
|---|---|---|
| `material_id` | Integer | Eindeutige ID des Materials |
| `name` | String | Name des Materials |
| `einheit` | String | Stueck, Meter usw. |
| `lagerbestand` | Decimal | Aktueller Bestand |
| `lagerort` | String | Lager, Fahrzeug oder anderer Ort |

Beispiele sind Kabel, Sicherungen, Steckdosen und Schalter.

### 2.6 Materialverbrauch

Der Materialverbrauch haelt fest, welches Material bei welchem Auftrag verbaut wurde.

| Attribut | Datentyp | Beschreibung |
|---|---|---|
| `verbrauch_id` | Integer | Eindeutige ID des Verbrauchs |
| `auftrag_id` | Integer | Zugehoeriger Auftrag |
| `material_id` | Integer | Verwendetes Material |
| `menge` | Decimal | Verbrauchte Menge |
| `erfasst_von` | Integer | Mitarbeiter, der den Verbrauch eingetragen hat |

### 2.7 Werkzeug

Werkzeuge sind wiederverwendbare Geraete, bei denen der aktuelle Standort wichtig ist.

| Attribut | Datentyp | Beschreibung |
|---|---|---|
| `werkzeug_id` | Integer | Eindeutige ID des Werkzeugs |
| `name` | String | Name des Werkzeugs |
| `status` | Enum | Verfuegbar, bei Mitarbeiter, Werkstatt oder unbekannt |
| `aktueller_ort` | String | Werkstatt, Fahrzeug oder Baustelle |
| `aktueller_besitzer_id` | Integer | Mitarbeiter, der das Werkzeug aktuell hat |

Ein wichtiges Beispiel ist der Bohrhammer.

### 2.8 Rechnung

Eine Rechnung gehoert zu einem Auftrag und wird nach der technischen Fertigmeldung vorbereitet oder erstellt.

| Attribut | Datentyp | Beschreibung |
|---|---|---|
| `rechnung_id` | Integer | Eindeutige ID der Rechnung |
| `auftrag_id` | Integer | Zugehoeriger Auftrag |
| `erstellt_am` | Datum | Datum der Rechnungserstellung |
| `status` | Enum | Offen, bezahlt, Mahnung 1, Mahnung 2, Anwalt |
| `betrag` | Decimal | Rechnungsbetrag |

## 3. Beziehungen

| Nr. | Beziehung | Kardinalitaet | Beschreibung |
|---|---|---|---|
| B1 | Kunde zu Auftrag | 1:n | Ein Kunde kann mehrere Auftraege haben. Ein Auftrag gehoert zu genau einem Kunden. |
| B2 | Auftrag zu Einsatz | 1:n | Ein Auftrag kann aus mehreren Einsaetzen bestehen. Ein Einsatz gehoert zu genau einem Auftrag. |
| B3 | Auftrag zu Rechnung | 1:1 | Ein Auftrag hat hoechstens eine Rechnung. Eine Rechnung gehoert zu genau einem Auftrag. |
| B4 | Auftrag zu Mitarbeiter | n:m | Ein Auftrag kann mehrere Mitarbeiter haben. Ein Mitarbeiter kann an mehreren Auftraegen arbeiten. |
| B5 | Einsatz zu Mitarbeiter | n:m | Ein Einsatz kann mehrere Mitarbeiter haben. Ein Mitarbeiter kann an vielen Einsaetzen beteiligt sein. |
| B6 | Auftrag zu Material | n:m | Ein Auftrag kann mehrere Materialien verbrauchen. Ein Material kann in vielen Auftraegen verbaut werden. |
| B7 | Materialverbrauch zu Mitarbeiter | n:1 | Ein Materialverbrauch wird von einem Mitarbeiter erfasst. Ein Mitarbeiter kann viele Materialverbraeuche erfassen. |
| B8 | Werkzeug zu Mitarbeiter | n:m | Ein Werkzeug kann nacheinander bei verschiedenen Mitarbeitern sein. Ein Mitarbeiter kann mehrere Werkzeuge haben. |

Die wichtigste n:m-Beziehung ist Auftrag zu Material. Ein Auftrag kann viele Materialien enthalten und ein Material kann in vielen Auftraegen vorkommen. Diese Beziehung wird ueber die Entitaet Materialverbrauch genauer beschrieben.

## 4. Business Rules

| ID | Regel | Beschreibung |
|---|---|---|
| BR1 | Notdienst hat Vorrang | Wenn ein Auftrag ein Notdienst ist, darf er nicht einfach verschoben werden. Auch wenn ein Mitarbeiter krank ist oder andere Termine geplant sind, muss jemand zum Notdienst fahren. |
| BR2 | Lehrlinge duerfen nicht alleine arbeiten | Wenn ein Mitarbeiter ein Lehrling ist, darf er keinem Einsatz alleine zugeordnet werden. Ein Lehrling muss immer zusammen mit einem Gesellen oder Meister eingesetzt werden, weil die Arbeit mit Strom gefaehrlich ist. |
| BR3 | Nicht fertige Auftraege brauchen einen Grund | Wenn ein Auftrag nach einem Einsatz nicht fertig ist, muss ein Grund eingetragen werden. Moegliche Gruende sind fehlendes Material, ein fehlendes Ersatzteil, eine offene Kundenentscheidung oder ein noetiger Folgeeinsatz. |
| BR4 | Zusatzarbeiten ab 1.500 Euro brauchen eine schriftliche Freigabe | Wenn Zusatzarbeiten voraussichtlich mindestens 1.500 Euro kosten, muss vorher ein schriftliches Angebot erstellt und vom Kunden unterschrieben werden. Ohne Unterschrift soll die Zusatzarbeit nicht ausgefuehrt werden. |
| BR5 | Ein Auftrag ist erst nach Zahlung vollstaendig abgeschlossen | Wenn der Mitarbeiter meldet, dass alles funktioniert, ist der Auftrag nur technisch fertig. Vollstaendig abgeschlossen ist er erst, wenn die Rechnung bezahlt wurde. Wenn die Zahlung ausbleibt, gibt es erst einen Brief, dann einen zweiten Brief und danach geht der Fall zum Anwalt. |

## 5. Widersprueche und Aufloesung

### W1: Wann ist ein Auftrag fertig?

Im Gespraech wurde einerseits gesagt, dass der Mitarbeiter irgendwann meldet, dass der Auftrag fertig ist und alles laeuft. Andererseits wurde gesagt, dass ein Auftrag erst abgeschlossen ist, wenn die Rechnung bezahlt wurde.

Das ist kein direkter Fehler, sondern es gibt zwei verschiedene Bedeutungen von fertig. Ein Auftrag kann technisch fertig sein, wenn die Arbeit vor Ort erledigt ist. Kaufmaennisch abgeschlossen ist er aber erst, wenn die Rechnung bezahlt wurde.

Fuer die App bedeutet das, dass es nicht nur einen einfachen Status fertig geben sollte. Es braucht mindestens eine Trennung zwischen technisch fertig, Rechnung erstellt und bezahlt.

### W2: Wer entscheidet ueber Zusatzarbeiten?

Zuerst klang es so, als wuerde Thomas Brandt alle Entscheidungen selbst treffen. Spaeter wurde aber klar, dass Mitarbeiter oder Meister kleinere Dinge vor Ort selbst mit dem Kunden klaeren duerfen.

Die Aufloesung ist, dass es verschiedene Entscheidungsebenen gibt. Kleine aenderungen mit wenig Aufwand darf der Mitarbeiter direkt klaeren. Groessere aenderungen entscheidet Thomas Brandt. Ab 1.500 Euro braucht es zusaetzlich ein schriftliches Angebot mit Unterschrift des Kunden.

Fuer die App bedeutet das, dass Zusatzarbeiten mit geschaetztem Betrag und Freigabestatus erfasst werden sollten.

## 6. Prioritaeten fuer die erste Version

Die erste Version soll bewusst klein bleiben. Laut Kunde sind vor allem drei Punkte wichtig.

| Prioritaet | Anforderung | Begruendung |
|---|---|---|
| Muss | Auftrag erfassen | Ohne Auftrag gibt es keine uebersicht ueber Kunde, Ort und Problem. |
| Muss | Mitarbeiter zuordnen | Thomas muss sehen, wer zu welchem Auftrag faehrt. |
| Muss | Materialverbrauch erfassen | Das Material wird fuer Rechnung und Nachbestellung benoetigt. |
| Muss | Status nach Einsatz erfassen | Das Buero muss wissen, ob ein Auftrag fertig ist oder nochmal angefahren werden muss. |
| Muss | Grund bei nicht fertigem Auftrag erfassen | Sonst ist unklar, ob Material fehlt oder der Kunde noch entscheiden muss. |
| Sollte | Werkzeugstandort erfassen | Teure Werkzeuge wie Bohrhaemmer sollen auffindbar sein. |
| Sollte | Rechnungsvorbereitung unterstuetzen | Wenn Stunden und Material stimmen, kann die Rechnung zuverlaessiger erstellt werden. |
| Kann | Mahnstatus anzeigen | Hilft beim ueberblick ueber offene Rechnungen, ist aber nicht der Kern der ersten Version. |

## 7. Nichtfunktionale Anforderungen

Die App muss einfach und schnell verstaendlich sein. Thomas Brandt sagte sinngemaess, dass ein Mitarbeiter die App nach ungefaehr zehn Minuten verstehen muss. Wenn die Bedienung zu kompliziert ist, wird sie nicht genutzt.

Ausserdem soll die App keine unnoetigen Auswertungen enthalten. Statistiken, Diagramme und umfangreiche Dashboards sind fuer den Kunden nicht wichtig. Der Nutzen liegt darin, dass Auftraege, Material und Rechnungen stimmen.

## 8. Nicht Ziel der ersten Version

Folgende Dinge sollen in der ersten Version nicht umgesetzt werden:

| Nicht Ziel | Grund |
|---|---|
| Komplexe Statistiken | Wird vom Kunden nicht gebraucht |
| Diagramme | Bringt im Alltag wenig Nutzen |
| Lange Schulungen | Mitarbeiter wuerden die App dann nicht nutzen |
| Fotodokumentation | Wurde nicht als notwendig gesehen |
| Grosses Management-Dashboard | Passt nicht zum gewuenschten einfachen System |

## 9. Fazit

Das Anforderungsmodell zeigt, dass Brandt & Soehne Elektro kein kompliziertes System braucht. Das Hauptproblem ist, dass Informationen aktuell zu oft auf Zetteln, im Kopf oder muendlich weitergegeben werden. Dadurch fehlen Daten fuer Planung, Materialbestand und Rechnungen.

Die App sollte deshalb vor allem die einfachen Kernprozesse digital abbilden. Wichtig sind Auftragserfassung, Mitarbeiterzuordnung, Materialverbrauch und Statusrueckmeldung. Alles Weitere sollte nur ergaenzt werden, wenn es den Alltag wirklich einfacher macht.
