import { Prioritaet } from "@prisma/client";

export function assertNotdienstVerschiebungBestaetigt(
  prioritaet: Prioritaet,
  notdienstBestaetigt: boolean,
) {
  if (prioritaet === Prioritaet.NOTDIENST && !notdienstBestaetigt) {
    throw new Error(
      "Beim Notdienst muss die Ersatzbesetzung oder sofortige Neuplanung bestaetigt werden.",
    );
  }
}
