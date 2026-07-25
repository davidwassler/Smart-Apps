import assert from "node:assert/strict";
import { AuftragStatus } from "@prisma/client";
import {
  assertAuftragStatusPasstZurRechnung,
  assertRechnungVorbereitbar,
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

console.log("Rechnungsregel erfolgreich geprueft.");
