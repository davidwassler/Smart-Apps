# Kalibrierung

## 1. Business Rule: Lehrling nicht allein einplanen

**Aussage:** Ein Lehrling kann keinem Einsatz allein zugeordnet werden. Es muss zusaetzlich mindestens ein Geselle oder Meister eingeplant sein.

**Konfidenz:** 10/10

**Wie geprueft?** Ich habe versucht, einen Einsatz nur mit einem Lehrling zu speichern. Die App verhindert das und verlangt zusaetzlich einen Gesellen oder Meister.

---

## 2. Business Rule: Notdienst-Einsatz verschieben

**Aussage:** Ein geplanter Notdienst-Einsatz kann nur verschoben werden, wenn eine Begruendung angegeben und die Ersatzbesetzung oder sofortige Neuplanung bestaetigt wurde.

**Konfidenz:** 10/10

**Wie geprueft?** Ich habe versucht, einen Notdienst-Termin ohne Begruendung und Bestaetigung zu verschieben. Die App lehnt das ab. Mit beiden Angaben laesst sich der neue Termin speichern.

---

## 3. Datenmodell: Auftraege und Mitarbeiter

**Aussage:** Auftraege und Mitarbeiter haben eine n:m-Beziehung. Einem Auftrag koennen mehrere Mitarbeiter zugeordnet werden und ein Mitarbeiter kann an mehreren Auftraegen beteiligt sein.

**Konfidenz:** 10/10

**Wie geprueft?** In der App koennen einem Auftrag mehrere Mitarbeiter zugewiesen werden. Derselbe Mitarbeiter kann ausserdem bei mehreren verschiedenen Auftraegen eingetragen sein.

---

## 4. Widerspruchsaufloesung: Bezahlter Notdienst-Auftrag

**Aussage:** Bei einem bezahlten Notdienst-Auftrag hat der aktuelle Abschlussstatus Vorrang vor der urspruenglichen Notdienst-Markierung. Der Auftrag wird deshalb in der uebersicht gruen statt rot dargestellt.

**Konfidenz:** 9/10

**Wie geprueft?** Ich habe einen Notdienst-Auftrag bis zum Status Bezahlt durchgefuehrt. Danach wird seine Zeile in der Auftragsuebersicht mit einem hellgruenen Hintergrund angezeigt.

---

## 5. Freie Aussage: Rechnungsverlauf

**Aussage:** Der Eintrag Rechnung erstellt zeigt im Auftragsverlauf weiterhin den damaligen Rechnungsstatus Offen. Eine spaetere Zahlung wird als eigener Statuswechsel mit Bezahlt angezeigt.

**Konfidenz:** 10/10

**Wie geprueft?** Ich habe zuerst eine Rechnung erstellt und sie anschliessend als bezahlt markiert. Im Verlauf bleibt Rechnung erstellt Offen, erhalten und Bezahlt erscheint als eigener Schritt.