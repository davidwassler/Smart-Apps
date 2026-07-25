import assert from "node:assert/strict";
import { AuftragStatus, RechnungStatus } from "@prisma/client";
import {
  assertAuftragStatusPasstZurRechnung,
  assertRechnungVorbereitbar,
  assertRechnungStatuswechselErlaubt,
  getAuftragStatusFuerRechnung,
  getErlaubteRechnungStatuswechsel,
} from "../lib/rechnung";

assert.doesNotThrow(() =>
  assertRechnungVorbereitbar(AuftragStatus.TECHNISCH_FERTIG, false, 0),
);
assert.throws(
  () => assertRechnungVorbereitbar(AuftragStatus.GEPLANT, false, 0),
  /technisch fertigen Auftrag/,
);
assert.doesNotThrow(() =>
  assertAuftragStatusPasstZurRechnung(
    AuftragStatus.TECHNISCH_FERTIG,
    AuftragStatus.TECHNISCH_FERTIG,
    false,
  ),
);
assert.doesNotThrow(() =>
  assertAuftragStatusPasstZurRechnung(
    AuftragStatus.RECHNUNG_ERSTELLT,
    AuftragStatus.RECHNUNG_ERSTELLT,
    true,
  ),
);
assert.throws(
  () =>
    assertAuftragStatusPasstZurRechnung(
      AuftragStatus.TECHNISCH_FERTIG,
      AuftragStatus.RECHNUNG_ERSTELLT,
      false,
    ),
  /gespeicherte Rechnung/,
);
assert.throws(
  () =>
    assertAuftragStatusPasstZurRechnung(
      AuftragStatus.RECHNUNG_ERSTELLT,
      AuftragStatus.TECHNISCH_FERTIG,
      true,
    ),
  /ueber die Rechnung/,
);
assert.throws(
  () => assertRechnungVorbereitbar(AuftragStatus.TECHNISCH_FERTIG, true, 0),
  /bereits eine Rechnung/,
);
assert.throws(
  () => assertRechnungVorbereitbar(AuftragStatus.TECHNISCH_FERTIG, false, 1),
  /schriftlich freigegeben/,
);
assert.deepEqual(getErlaubteRechnungStatuswechsel(RechnungStatus.OFFEN), [
  RechnungStatus.BEZAHLT,
  RechnungStatus.MAHNUNG_1,
]);
assert.doesNotThrow(() =>
  assertRechnungStatuswechselErlaubt(
    RechnungStatus.MAHNUNG_2,
    RechnungStatus.ANWALT,
  ),
);
assert.doesNotThrow(() =>
  assertRechnungStatuswechselErlaubt(
    RechnungStatus.ANWALT,
    RechnungStatus.BEZAHLT,
  ),
);
assert.throws(
  () =>
    assertRechnungStatuswechselErlaubt(
      RechnungStatus.OFFEN,
      RechnungStatus.MAHNUNG_2,
    ),
  /Ungueltiger Rechnungsstatuswechsel/,
);
assert.throws(
  () =>
    assertRechnungStatuswechselErlaubt(
      RechnungStatus.BEZAHLT,
      RechnungStatus.OFFEN,
    ),
  /Ungueltiger Rechnungsstatuswechsel/,
);
assert.equal(
  getAuftragStatusFuerRechnung(RechnungStatus.MAHNUNG_1),
  AuftragStatus.GEMAHNT,
);
assert.equal(
  getAuftragStatusFuerRechnung(RechnungStatus.ANWALT),
  AuftragStatus.ESKALIERT,
);
assert.equal(
  getAuftragStatusFuerRechnung(RechnungStatus.BEZAHLT),
  AuftragStatus.BEZAHLT,
);

console.log("Rechnungsregel erfolgreich geprueft.");
