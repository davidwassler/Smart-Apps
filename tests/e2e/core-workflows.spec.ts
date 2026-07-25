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
