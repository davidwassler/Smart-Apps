"use server";

import type { ActionState } from "./action-state";
import {
  createAuftrag,
  createEinsatz,
  createKunde,
  createMaterial,
  createMaterialverbrauch,
  createMitarbeiter,
  createRechnung,
  createWerkzeug,
  createZusatzarbeit,
  saveEinsatzRueckmeldung,
  updateAuftrag,
  updateAuftragKunde,
  updateKunde,
  updateMaterial,
  updateMitarbeiter,
  updateRechnungStatus,
  updateWerkzeug,
  updateZusatzarbeitFreigabe,
  verschiebeEinsatz,
} from "./actions";

function isRedirectError(error: unknown) {
  if (!error || typeof error !== "object" || !("digest" in error)) {
    return false;
  }

  return String(error.digest).startsWith("NEXT_REDIRECT");
}

function getMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error) || error.message.trim() === "") {
    return fallback;
  }

  if (
    error.message.includes("Invalid `") ||
    error.message.includes("Prisma") ||
    error.message.includes("Unique constraint") ||
    error.message.includes("Foreign key")
  ) {
    return fallback;
  }

  return error.message;
}

async function runAction(
  action: (formData: FormData) => Promise<unknown>,
  formData: FormData,
  successMessage: string,
  fallbackError: string,
): Promise<ActionState> {
  try {
    await action(formData);
    return {
      status: "success",
      message: successMessage,
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      status: "error",
      message: getMessage(error, fallbackError),
    };
  }
}

export async function createKundeFormAction(
  _state: ActionState,
  formData: FormData,
) {
  return runAction(
    createKunde,
    formData,
    "Kunde wurde gespeichert.",
    "Kunde konnte nicht gespeichert werden.",
  );
}

export async function createMitarbeiterFormAction(
  _state: ActionState,
  formData: FormData,
) {
  return runAction(
    createMitarbeiter,
    formData,
    "Mitarbeiter wurde gespeichert.",
    "Mitarbeiter konnte nicht gespeichert werden.",
  );
}

export async function updateKundeFormAction(
  _state: ActionState,
  formData: FormData,
) {
  return runAction(
    updateKunde,
    formData,
    "Kundendaten wurden gespeichert.",
    "Kundendaten konnten nicht gespeichert werden.",
  );
}

export async function updateMitarbeiterFormAction(
  _state: ActionState,
  formData: FormData,
) {
  return runAction(
    updateMitarbeiter,
    formData,
    "Mitarbeiterdaten wurden gespeichert.",
    "Mitarbeiterdaten konnten nicht gespeichert werden.",
  );
}

export async function createMaterialFormAction(
  _state: ActionState,
  formData: FormData,
) {
  return runAction(
    createMaterial,
    formData,
    "Material wurde gespeichert.",
    "Material konnte nicht gespeichert werden.",
  );
}

export async function createAuftragFormAction(
  _state: ActionState,
  formData: FormData,
) {
  return runAction(
    createAuftrag,
    formData,
    "Auftrag wurde gespeichert.",
    "Auftrag konnte nicht gespeichert werden.",
  );
}

export async function updateMaterialFormAction(
  _state: ActionState,
  formData: FormData,
) {
  return runAction(
    updateMaterial,
    formData,
    "Materialdaten wurden gespeichert.",
    "Materialdaten konnten nicht gespeichert werden.",
  );
}

export async function updateAuftragFormAction(
  _state: ActionState,
  formData: FormData,
) {
  return runAction(
    updateAuftrag,
    formData,
    "Auftragsdaten wurden gespeichert.",
    "Auftragsdaten konnten nicht gespeichert werden.",
  );
}

export async function updateAuftragKundeFormAction(
  _state: ActionState,
  formData: FormData,
) {
  return runAction(
    updateAuftragKunde,
    formData,
    "Kundendaten wurden gespeichert.",
    "Kundendaten konnten nicht gespeichert werden.",
  );
}

export async function createEinsatzFormAction(
  _state: ActionState,
  formData: FormData,
) {
  return runAction(
    createEinsatz,
    formData,
    "Einsatz wurde gespeichert.",
    "Einsatz konnte nicht gespeichert werden.",
  );
}

export async function verschiebeEinsatzFormAction(
  _state: ActionState,
  formData: FormData,
) {
  return runAction(
    verschiebeEinsatz,
    formData,
    "Einsatz wurde verschoben.",
    "Einsatz konnte nicht verschoben werden.",
  );
}

export async function saveEinsatzRueckmeldungFormAction(
  _state: ActionState,
  formData: FormData,
) {
  return runAction(
    saveEinsatzRueckmeldung,
    formData,
    "Rueckmeldung wurde gespeichert.",
    "Rueckmeldung konnte nicht gespeichert werden.",
  );
}

export async function createMaterialverbrauchFormAction(
  _state: ActionState,
  formData: FormData,
) {
  return runAction(
    createMaterialverbrauch,
    formData,
    "Materialverbrauch wurde gespeichert.",
    "Materialverbrauch konnte nicht gespeichert werden.",
  );
}

export async function createZusatzarbeitFormAction(
  _state: ActionState,
  formData: FormData,
) {
  return runAction(
    createZusatzarbeit,
    formData,
    "Zusatzarbeit wurde gespeichert.",
    "Zusatzarbeit konnte nicht gespeichert werden.",
  );
}

export async function updateZusatzarbeitFreigabeFormAction(
  _state: ActionState,
  formData: FormData,
) {
  return runAction(
    updateZusatzarbeitFreigabe,
    formData,
    "Freigabestatus wurde gespeichert.",
    "Freigabestatus konnte nicht gespeichert werden.",
  );
}

export async function createRechnungFormAction(
  _state: ActionState,
  formData: FormData,
) {
  return runAction(
    createRechnung,
    formData,
    "Rechnung wurde gespeichert.",
    "Rechnung konnte nicht gespeichert werden.",
  );
}

export async function updateRechnungStatusFormAction(
  _state: ActionState,
  formData: FormData,
) {
  return runAction(
    updateRechnungStatus,
    formData,
    "Rechnungsstatus wurde gespeichert.",
    "Rechnungsstatus konnte nicht gespeichert werden.",
  );
}

export async function createWerkzeugFormAction(
  _state: ActionState,
  formData: FormData,
) {
  return runAction(
    createWerkzeug,
    formData,
    "Werkzeug wurde gespeichert.",
    "Werkzeug konnte nicht gespeichert werden.",
  );
}

export async function updateWerkzeugFormAction(
  _state: ActionState,
  formData: FormData,
) {
  return runAction(
    updateWerkzeug,
    formData,
    "Werkzeugdaten wurden gespeichert.",
    "Werkzeugdaten konnten nicht gespeichert werden.",
  );
}
