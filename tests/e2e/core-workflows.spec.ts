import { expect, test, type Locator } from "@playwright/test";

async function selectOptionContaining(select: Locator, text: string) {
  const value = await select
    .locator("option")
    .filter({ hasText: text })
    .first()
    .getAttribute("value");

  if (!value) {
    throw new Error(`Keine Option mit "${text}" gefunden.`);
  }

  await select.selectOption(value);
}

test("Kernablaeufe vom Auftrag bis zur bezahlten Rechnung", async ({
  page,
}) => {
  await page.goto("/");

  const createButton = page.getByRole("button", {
    name: "Auftrag hinzufuegen",
  });
  await createButton.click();

  let dialog = page.getByRole("dialog", { name: "Auftrag erfassen" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Auswahl")).toBeFocused();
  await dialog.getByLabel("Auswahl").selectOption({ label: "Familie Neumann" });
  await dialog
    .getByLabel("Beschreibung")
    .fill("E2E-Pruefauftrag fuer die Kernablaeufe.");
  await dialog.getByLabel("Prioritaet").selectOption({ label: "Notdienst" });
  await dialog.getByLabel("Jana Keller").check();
  await dialog.getByRole("button", { name: "Auftrag speichern" }).click();

  await expect(page).toHaveURL(/\/auftraege\/\d+$/);
  await expect(
    page.getByText("E2E-Pruefauftrag fuer die Kernablaeufe."),
  ).toBeVisible();

  await page.getByRole("button", { name: "Einsatz planen" }).click();
  dialog = page.getByRole("dialog", { name: "Einsatz planen" });
  await expect(dialog.getByLabel("Datum")).toBeFocused();
  await dialog.getByLabel("Datum").fill("2026-07-30");
  await dialog.getByLabel(/Jana Keller/).check();
  await dialog.getByRole("button", { name: "Einsatz speichern" }).click();
  await expect(dialog.getByRole("status")).toHaveText(
    "Einsatz wurde gespeichert.",
  );
  await dialog.getByRole("button", { name: "Fenster schliessen" }).click();

  await page
    .getByRole("button", { name: "Rueckmeldung erfassen" })
    .first()
    .click();
  dialog = page.getByRole("dialog", { name: "Rueckmeldung erfassen" });
  await dialog
    .getByLabel("Rueckmeldung")
    .fill("E2E-Einsatz erfolgreich abgeschlossen.");
  await dialog
    .getByRole("button", { name: "Rueckmeldung speichern" })
    .click();
  await expect(
    page.getByText("E2E-Einsatz erfolgreich abgeschlossen.").first(),
  ).toBeVisible();
  await expect(page.getByText("Technisch fertig").first()).toBeVisible();

  await page
    .getByRole("button", { name: "Materialverbrauch erfassen" })
    .click();
  dialog = page.getByRole("dialog", {
    name: "Materialverbrauch erfassen",
  });
  await selectOptionContaining(dialog.getByLabel("Material"), "Steckdose");
  await dialog.getByLabel("Menge").fill("1");
  await dialog.getByLabel("Erfasst von").selectOption({ label: "Jana Keller" });
  await dialog.getByRole("button", { name: "Verbrauch speichern" }).click();
  await expect(dialog.getByRole("status")).toHaveText(
    "Materialverbrauch wurde gespeichert.",
  );
  await dialog.getByRole("button", { name: "Fenster schliessen" }).click();
  await expect(page.getByText("Steckdose reinweiss").first()).toBeVisible();

  await page.getByRole("button", { name: "Rechnung vorbereiten" }).click();
  dialog = page.getByRole("dialog", { name: "Rechnung vorbereiten" });
  await dialog.getByLabel("Rechnungsbetrag").fill("129.90");
  await dialog.getByRole("button", { name: "Rechnung speichern" }).click();
  await expect(page.getByText("129,90").first()).toBeVisible();
  await expect(page.getByText("Offen").first()).toBeVisible();
  const auftragsverlauf = page.getByRole("region", {
    name: "Auftragsverlauf",
  });
  const rechnungErstellt = auftragsverlauf
    .getByRole("listitem")
    .filter({ hasText: "Rechnung erstellt" });
  await expect(
    rechnungErstellt.getByText("Offen", { exact: true }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Status aktualisieren" }).click();
  dialog = page.getByRole("dialog", {
    name: "Rechnungsstatus aktualisieren",
  });
  await dialog.getByLabel("Neuer Status").selectOption({ label: "Bezahlt" });
  await dialog
    .getByLabel("Notiz")
    .fill("E2E-Zahlung vollstaendig eingegangen.");
  await dialog.getByRole("button", { name: "Status speichern" }).click();
  await expect(page.getByText("Bezahlt").first()).toBeVisible();
  await expect(
    page.getByText("E2E-Zahlung vollstaendig eingegangen."),
  ).toBeVisible();
  await expect(
    rechnungErstellt.getByText("Offen", { exact: true }),
  ).toBeVisible();
  await expect(
    auftragsverlauf
      .getByRole("listitem")
      .filter({ hasText: "Rechnungsstatus aktualisiert" })
      .getByText("Bezahlt", { exact: true }),
  ).toBeVisible();

  await page
    .getByRole("link", { name: "Zurueck zur Auftragsuebersicht" })
    .click();
  const bezahlterNotdienst = page
    .locator(".orderRow")
    .filter({ hasText: "E2E-Pruefauftrag fuer die Kernablaeufe." });
  await expect(bezahlterNotdienst).toHaveClass(/orderRowPaid/);
  await expect(bezahlterNotdienst).not.toHaveClass(/orderRowNotdienst/);

  await page.goto("/rechnungen");
  const bezahlteRechnung = page
    .locator(".invoiceRow")
    .filter({ hasText: "E2E-Pruefauftrag fuer die Kernablaeufe." });
  await expect(bezahlteRechnung).toHaveClass(/invoiceRowPaid/);
});

test("Notdienstfehler bleibt verstaendlich und erhaelt Eingaben", async ({
  page,
}) => {
  await page.goto("/?q=Backofenbereich");
  await page.locator(".orderRow").click();

  await page
    .getByRole("button", { name: "Einsatz verschieben" })
    .first()
    .click();
  const dialog = page.getByRole("dialog", { name: "Einsatz verschieben" });
  const begruendung = dialog.getByLabel("Begruendung");
  const bestaetigung = dialog.getByRole("checkbox");
  const text = "E2E-Ersatztermin mit dem Team abgestimmt.";

  await dialog.getByLabel("Neues Einsatzdatum").fill("2026-07-30");
  await begruendung.fill(text);
  await bestaetigung.evaluate((element) => element.removeAttribute("required"));
  await dialog
    .getByRole("button", { name: "Verschiebung speichern" })
    .click();

  await expect(dialog.getByRole("alert")).toContainText(
    "Ersatzbesetzung oder sofortige Neuplanung",
  );
  await expect(begruendung).toHaveValue(text);

  await bestaetigung.check();
  await dialog
    .getByRole("button", { name: "Verschiebung speichern" })
    .click();
  await expect(dialog.getByRole("status")).toHaveText(
    "Einsatz wurde verschoben.",
  );
});

test("Auftragsdialog bleibt auf kleinem Bildschirm bedienbar", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const createButton = page.getByRole("button", {
    name: "Auftrag hinzufuegen",
  });
  await createButton.click();
  const dialog = page.getByRole("dialog", { name: "Auftrag erfassen" });
  const box = await dialog.boundingBox();

  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.width).toBeLessThanOrEqual(390);
  await expect(dialog.getByLabel("Auswahl")).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(createButton).toBeFocused();
});

test("Stammdaten lassen sich aus den Listen bearbeiten", async ({ page }) => {
  await page.goto("/kunden");
  await page
    .getByRole("button", { name: "Familie Neumann bearbeiten" })
    .click();
  let dialog = page.getByRole("dialog", { name: "Kunde bearbeiten" });
  await expect(dialog.getByLabel("Strasse + Nr.")).toHaveValue("Ahornweg 12");
  await expect(dialog.getByLabel("PLZ")).toHaveValue("33609");
  await expect(dialog.getByLabel("Ort")).toHaveValue("Bielefeld");
  await dialog.getByLabel("Strasse + Nr.").fill("Ahornweg 14");
  await dialog
    .getByRole("button", { name: "Kundendaten speichern" })
    .click();
  await expect(dialog.getByRole("status")).toHaveText(
    "Kundendaten wurden gespeichert.",
  );
  await dialog.getByRole("button", { name: "Fenster schliessen" }).click();
  await expect(page.getByText("Ahornweg 14, 33609 Bielefeld")).toBeVisible();

  await page.goto("/mitarbeiter");
  await page
    .getByRole("button", { name: "Jana Keller bearbeiten" })
    .click();
  dialog = page.getByRole("dialog", { name: "Mitarbeiter bearbeiten" });
  await dialog.getByLabel("Telefonnummer").fill("0171 1000099");
  await dialog
    .getByRole("button", { name: "Mitarbeiterdaten speichern" })
    .click();
  await expect(dialog.getByRole("status")).toHaveText(
    "Mitarbeiterdaten wurden gespeichert.",
  );
  await dialog.getByRole("button", { name: "Fenster schliessen" }).click();
  await expect(page.getByText("0171 1000099")).toBeVisible();

  await page.goto("/material");
  await page
    .getByRole("button", { name: "Steckdose reinweiss bearbeiten" })
    .click();
  dialog = page.getByRole("dialog", { name: "Material bearbeiten" });
  await dialog.getByLabel("Lagerort").fill("Fahrzeug 3");
  await dialog
    .getByRole("button", { name: "Materialdaten speichern" })
    .click();
  await expect(dialog.getByRole("status")).toHaveText(
    "Materialdaten wurden gespeichert.",
  );
  await dialog.getByRole("button", { name: "Fenster schliessen" }).click();
  await expect(page.getByText("Fahrzeug 3")).toBeVisible();

  await page.goto("/werkzeuge");
  await expect(
    page.getByRole("heading", { name: "Standort wechseln" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Werkzeug hinzufuegen" })
    .click();
  dialog = page.getByRole("dialog", { name: "Werkzeug erfassen" });
  await dialog.getByLabel("Name").fill("E2E-Messgeraet");
  await dialog.getByLabel("Aktueller Ort").fill("Werkstatt");
  await dialog.getByRole("button", { name: "Werkzeug speichern" }).click();
  await expect(dialog.getByRole("status")).toHaveText(
    "Werkzeug wurde gespeichert.",
  );
  await dialog.getByRole("button", { name: "Fenster schliessen" }).click();
  await expect(
    page.getByRole("button", { name: "E2E-Messgeraet bearbeiten" }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: "Bohrhammer Bosch GBH bearbeiten" })
    .click();
  dialog = page.getByRole("dialog", { name: "Werkzeug bearbeiten" });
  await dialog.getByLabel("Name").fill("Bohrhammer Bosch GBH 18V");
  await dialog
    .getByRole("button", { name: "Werkzeugdaten speichern" })
    .click();
  await expect(dialog.getByRole("status")).toHaveText(
    "Werkzeugdaten wurden gespeichert.",
  );
  await dialog.getByRole("button", { name: "Fenster schliessen" }).click();
  await expect(
    page.getByRole("button", {
      name: "Bohrhammer Bosch GBH 18V bearbeiten",
    }),
  ).toBeVisible();
});
