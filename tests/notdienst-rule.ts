import assert from "node:assert/strict";
import { Prioritaet } from "@prisma/client";
import { assertNotdienstVerschiebungBestaetigt } from "../lib/notdienst";

assert.doesNotThrow(() =>
  assertNotdienstVerschiebungBestaetigt(Prioritaet.NORMAL, false),
);
assert.doesNotThrow(() =>
  assertNotdienstVerschiebungBestaetigt(Prioritaet.NOTDIENST, true),
);
assert.throws(
  () => assertNotdienstVerschiebungBestaetigt(Prioritaet.NOTDIENST, false),
  /Ersatzbesetzung oder sofortige Neuplanung/,
);

console.log("Notdienst-Regel erfolgreich geprueft.");
