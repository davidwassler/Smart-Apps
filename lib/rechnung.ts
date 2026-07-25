import { AuftragStatus } from "@prisma/client";

export function assertRechnungVorbereitbar(
  auftragStatus: AuftragStatus,
  rechnungVorhanden: boolean,
  blockierendeZusatzarbeiten: number,
) {
  if (auftragStatus !== AuftragStatus.TECHNISCH_FERTIG) {
    throw new Error(
      "Eine Rechnung kann erst fuer einen technisch fertigen Auftrag vorbereitet werden.",
    );
  }

  if (rechnungVorhanden) {
    throw new Error("Fuer diesen Auftrag ist bereits eine Rechnung vorhanden.");
  }

  if (blockierendeZusatzarbeiten > 0) {
    throw new Error(
      "Vor der Rechnung muessen alle Zusatzarbeiten ab 1.500 Euro schriftlich freigegeben sein.",
    );
  }
}

const kaufmaennischeAuftragStatus: AuftragStatus[] = [
  AuftragStatus.RECHNUNG_ERSTELLT,
  AuftragStatus.BEZAHLT,
  AuftragStatus.GEMAHNT,
  AuftragStatus.ESKALIERT,
];

export function assertAuftragStatusPasstZurRechnung(
  bisherigerStatus: AuftragStatus,
  neuerStatus: AuftragStatus,
  rechnungVorhanden: boolean,
) {
  if (rechnungVorhanden && neuerStatus !== bisherigerStatus) {
    throw new Error(
      "Der kaufmaennische Auftragsstatus wird ueber die Rechnung gepflegt.",
    );
  }

  if (
    !rechnungVorhanden &&
    kaufmaennischeAuftragStatus.includes(neuerStatus)
  ) {
    throw new Error(
      "Der Status Rechnung erstellt setzt eine gespeicherte Rechnung voraus.",
    );
  }
}
