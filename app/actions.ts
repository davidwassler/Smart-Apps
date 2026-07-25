"use server";

import {
  AuftragStatus,
  EinsatzStatus,
  Kundentyp,
  MitarbeiterRolle,
  NichtFertigGrund,
  Prioritaet,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function requireText(formData: FormData, name: string) {
  const value = formData.get(name);
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Pflichtfeld fehlt: ${name}`);
  }

  return value.trim();
}

function selectedIds(formData: FormData, name: string) {
  return formData
    .getAll(name)
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);
}

function requirePositiveNumber(formData: FormData, name: string) {
  const value = Number(requireText(formData, name));
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Wert muss groesser als 0 sein: ${name}`);
  }

  return value;
}

function requireNonNegativeNumber(formData: FormData, name: string) {
  const value = Number(requireText(formData, name));
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`Wert darf nicht negativ sein: ${name}`);
  }

  return value;
}

function requireMaterialEinheit(formData: FormData) {
  const einheit = requireText(formData, "einheit");
  if (einheit !== "Stueck" && einheit !== "Laenge") {
    throw new Error("Materialeinheit muss Stueck oder Laenge sein.");
  }

  return einheit;
}

function assertWholeNumber(value: number, fieldName: string) {
  if (!Number.isInteger(value)) {
    throw new Error(`${fieldName} muss bei Einheit Stueck eine ganze Zahl sein.`);
  }
}

async function assertEinsatzTeamAllowed(mitarbeiterIds: number[]) {
  if (mitarbeiterIds.length === 0) {
    throw new Error("Ein Einsatz braucht mindestens einen Mitarbeiter.");
  }

  const team = await prisma.mitarbeiter.findMany({
    where: {
      id: {
        in: mitarbeiterIds,
      },
    },
    select: {
      rolle: true,
    },
  });

  const hasLehrling = team.some((person) => person.rolle === MitarbeiterRolle.LEHRLING);
  const hasGeselleOrMeister = team.some(
    (person) =>
      person.rolle === MitarbeiterRolle.GESELLE ||
      person.rolle === MitarbeiterRolle.MEISTER,
  );

  if (hasLehrling && !hasGeselleOrMeister) {
    throw new Error("Ein Lehrling darf keinem Einsatz alleine zugeordnet werden.");
  }
}

export async function createKunde(formData: FormData) {
  await prisma.kunde.create({
    data: {
      name: requireText(formData, "name"),
      telefonnummer: requireText(formData, "telefonnummer"),
      adresse: requireText(formData, "adresse"),
      kundentyp: requireText(formData, "kundentyp") as Kundentyp,
    },
  });

  revalidatePath("/");
}

export async function createMitarbeiter(formData: FormData) {
  await prisma.mitarbeiter.create({
    data: {
      name: requireText(formData, "name"),
      rolle: requireText(formData, "rolle") as MitarbeiterRolle,
      telefonnummer: requireText(formData, "telefonnummer"),
      aktiv: formData.get("aktiv") === "on",
    },
  });

  revalidatePath("/");
}

export async function createMaterial(formData: FormData) {
  const einheit = requireMaterialEinheit(formData);
  const lagerbestand = requireNonNegativeNumber(formData, "lagerbestand");

  if (einheit === "Stueck") {
    assertWholeNumber(lagerbestand, "Lagerbestand");
  }

  await prisma.material.create({
    data: {
      name: requireText(formData, "name"),
      einheit,
      lagerbestand,
      lagerort: requireText(formData, "lagerort"),
    },
  });

  revalidatePath("/");
}

export async function createAuftrag(formData: FormData) {
  const kundeId = Number(requireText(formData, "kundeId"));
  const mitarbeiterIds = selectedIds(formData, "mitarbeiterIds");

  await prisma.auftrag.create({
    data: {
      kundeId,
      beschreibung: requireText(formData, "beschreibung"),
      prioritaet: requireText(formData, "prioritaet") as Prioritaet,
      mitarbeiter:
        mitarbeiterIds.length > 0
          ? {
              create: mitarbeiterIds.map((mitarbeiterId) => ({
                mitarbeiterId,
              })),
            }
          : undefined,
    },
  });

  revalidatePath("/");
}

export async function createEinsatz(formData: FormData) {
  const auftragId = Number(requireText(formData, "auftragId"));
  const mitarbeiterIds = selectedIds(formData, "mitarbeiterIds");

  await assertEinsatzTeamAllowed(mitarbeiterIds);

  await prisma.einsatz.create({
    data: {
      auftragId,
      datum: new Date(requireText(formData, "datum")),
      status: requireText(formData, "status") as EinsatzStatus,
      mitarbeiter: {
        create: mitarbeiterIds.map((mitarbeiterId) => ({
          mitarbeiterId,
        })),
      },
    },
  });

  await prisma.auftrag.update({
    where: {
      id: auftragId,
    },
    data: {
      status: AuftragStatus.GEPLANT,
    },
  });

  revalidatePath("/");
}

export async function saveEinsatzRueckmeldung(formData: FormData) {
  const einsatzId = Number(requireText(formData, "einsatzId"));
  const auftragId = Number(requireText(formData, "auftragId"));
  const auftragStatus = requireText(formData, "auftragStatus") as AuftragStatus;
  const nichtFertigGrundValue = formData.get("nichtFertigGrund");
  const nichtFertigGrund =
    typeof nichtFertigGrundValue === "string" && nichtFertigGrundValue !== ""
      ? (nichtFertigGrundValue as NichtFertigGrund)
      : null;

  if (auftragStatus !== AuftragStatus.TECHNISCH_FERTIG && !nichtFertigGrund) {
    throw new Error("Nicht fertige Auftraege brauchen einen Grund.");
  }

  await prisma.$transaction([
    prisma.einsatz.update({
      where: {
        id: einsatzId,
      },
      data: {
        status: EinsatzStatus.DURCHGEFUEHRT,
        rueckmeldung: requireText(formData, "rueckmeldung"),
      },
    }),
    prisma.auftrag.update({
      where: {
        id: auftragId,
      },
      data: {
        status: auftragStatus,
        nichtFertigGrund:
          auftragStatus === AuftragStatus.TECHNISCH_FERTIG ? null : nichtFertigGrund,
      },
    }),
  ]);

  revalidatePath("/");
}

export async function createMaterialverbrauch(formData: FormData) {
  const auftragId = Number(requireText(formData, "auftragId"));
  const materialId = Number(requireText(formData, "materialId"));
  const erfasstVonId = Number(requireText(formData, "erfasstVonId"));
  const menge = requirePositiveNumber(formData, "menge");

  const material = await prisma.material.findUnique({
    where: {
      id: materialId,
    },
    select: {
      einheit: true,
      lagerbestand: true,
      name: true,
    },
  });

  if (!material) {
    throw new Error("Material wurde nicht gefunden.");
  }

  if (material.einheit === "Stueck") {
    assertWholeNumber(menge, "Verbrauchsmenge");
  }

  const lagerbestand = material.lagerbestand.toNumber();
  if (menge > lagerbestand) {
    throw new Error(`Nicht genug Bestand fuer ${material.name}.`);
  }

  await prisma.$transaction([
    prisma.materialverbrauch.create({
      data: {
        auftragId,
        materialId,
        erfasstVonId,
        menge,
      },
    }),
    prisma.material.update({
      where: {
        id: materialId,
      },
      data: {
        lagerbestand: {
          decrement: menge,
        },
      },
    }),
  ]);

  revalidatePath("/");
}
