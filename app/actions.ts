"use server";

import {
  Kundentyp,
  MitarbeiterRolle,
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
  await prisma.material.create({
    data: {
      name: requireText(formData, "name"),
      einheit: requireText(formData, "einheit"),
      lagerbestand: requireText(formData, "lagerbestand"),
      lagerort: requireText(formData, "lagerort"),
    },
  });

  revalidatePath("/");
}

export async function createAuftrag(formData: FormData) {
  const kundeId = Number(requireText(formData, "kundeId"));
  const mitarbeiterIds = formData
    .getAll("mitarbeiterIds")
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);

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
