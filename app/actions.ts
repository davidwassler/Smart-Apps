"use server";

import {
  AuftragStatus,
  EinsatzStatus,
  Kundentyp,
  MitarbeiterRolle,
  NichtFertigGrund,
  Prioritaet,
  WerkzeugStatus,
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

function optionalText(formData: FormData, name: string) {
  const value = formData.get(name);
  if (typeof value !== "string") {
    return "";
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
  const einheitTyp = requireText(formData, "einheitTyp");
  if (einheitTyp === "Stueck") {
    return "Stueck";
  }

  if (einheitTyp !== "Laenge") {
    throw new Error("Materialeinheit muss Stueck oder Laenge sein.");
  }

  const laengenEinheit = requireText(formData, "laengenEinheit");
  if (
    laengenEinheit !== "mm" &&
    laengenEinheit !== "cm" &&
    laengenEinheit !== "m"
  ) {
    throw new Error("Laengeneinheit muss mm, cm oder m sein.");
  }

  return laengenEinheit;
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
  revalidatePath("/kunden");
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
  revalidatePath("/mitarbeiter");
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
  revalidatePath("/material");
}

export async function createAuftrag(formData: FormData) {
  const kundeIdValue = optionalText(formData, "kundeId");
  const kundeId = kundeIdValue === "" ? null : Number(kundeIdValue);
  const mitarbeiterIds = selectedIds(formData, "mitarbeiterIds");
  const beschreibung = requireText(formData, "beschreibung");
  const prioritaet = requireText(formData, "prioritaet") as Prioritaet;
  const mitarbeiter =
    mitarbeiterIds.length > 0
      ? {
          create: mitarbeiterIds.map((mitarbeiterId) => ({
            mitarbeiterId,
          })),
        }
      : undefined;

  if (kundeId) {
    await prisma.auftrag.create({
      data: {
        kundeId,
        beschreibung,
        prioritaet,
        mitarbeiter,
      },
    });
  } else {
    await prisma.$transaction(async (tx) => {
      const kunde = await tx.kunde.create({
        data: {
          name: requireText(formData, "neuerKundeName"),
          telefonnummer: requireText(formData, "neuerKundeTelefonnummer"),
          adresse: optionalText(formData, "neuerKundeAdresse"),
          kundentyp: requireText(formData, "neuerKundeKundentyp") as Kundentyp,
        },
      });

      await tx.auftrag.create({
        data: {
          kundeId: kunde.id,
          beschreibung,
          prioritaet,
          mitarbeiter,
        },
      });
    });
  }

  revalidatePath("/");
  revalidatePath("/kunden");
  revalidatePath("/material");
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

export async function createWerkzeug(formData: FormData) {
  const status = requireText(formData, "status") as WerkzeugStatus;
  const aktuellerBesitzerValue = formData.get("aktuellerBesitzerId");
  const aktuellerBesitzerId =
    typeof aktuellerBesitzerValue === "string" && aktuellerBesitzerValue !== ""
      ? Number(aktuellerBesitzerValue)
      : null;

  if (status === WerkzeugStatus.BEI_MITARBEITER && !aktuellerBesitzerId) {
    throw new Error("Werkzeug bei Mitarbeiter braucht einen Besitzer.");
  }

  await prisma.werkzeug.create({
    data: {
      name: requireText(formData, "name"),
      status,
      aktuellerOrt: requireText(formData, "aktuellerOrt"),
      aktuellerBesitzerId,
      uebergaben: {
        create: {
          mitarbeiterId: aktuellerBesitzerId,
          ort: requireText(formData, "aktuellerOrt"),
          notiz: "Ersterfasster Standort",
        },
      },
    },
  });

  revalidatePath("/werkzeuge");
}

export async function updateWerkzeugStandort(formData: FormData) {
  const werkzeugId = Number(requireText(formData, "werkzeugId"));
  const status = requireText(formData, "status") as WerkzeugStatus;
  const aktuellerOrt = requireText(formData, "aktuellerOrt");
  const aktuellerBesitzerValue = formData.get("aktuellerBesitzerId");
  const aktuellerBesitzerId =
    typeof aktuellerBesitzerValue === "string" && aktuellerBesitzerValue !== ""
      ? Number(aktuellerBesitzerValue)
      : null;
  const notizValue = formData.get("notiz");
  const notiz =
    typeof notizValue === "string" && notizValue.trim() !== ""
      ? notizValue.trim()
      : null;

  if (status === WerkzeugStatus.BEI_MITARBEITER && !aktuellerBesitzerId) {
    throw new Error("Werkzeug bei Mitarbeiter braucht einen Besitzer.");
  }

  await prisma.$transaction([
    prisma.werkzeug.update({
      where: {
        id: werkzeugId,
      },
      data: {
        status,
        aktuellerOrt,
        aktuellerBesitzerId,
      },
    }),
    prisma.werkzeugUebergabe.create({
      data: {
        werkzeugId,
        mitarbeiterId: aktuellerBesitzerId,
        ort: aktuellerOrt,
        notiz,
      },
    }),
  ]);

  revalidatePath("/werkzeuge");
}
