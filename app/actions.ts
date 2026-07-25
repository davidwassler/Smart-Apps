"use server";

import {
  AuftragStatus,
  EinsatzStatus,
  FreigabeStatus,
  Kundentyp,
  MitarbeiterRolle,
  NichtFertigGrund,
  Prioritaet,
  RechnungStatus,
  WerkzeugStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertNotdienstVerschiebungBestaetigt } from "@/lib/notdienst";
import { prisma } from "@/lib/prisma";
import { formatAddress } from "@/lib/address";
import {
  assertAuftragStatusPasstZurRechnung,
  assertRechnungVorbereitbar,
  assertRechnungStatuswechselErlaubt,
  getAuftragStatusFuerRechnung,
} from "@/lib/rechnung";

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
  return Array.from(
    new Set(
      formData
        .getAll(name)
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0),
    ),
  );
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

function requireMoney(formData: FormData, name: string) {
  const rawValue = requireText(formData, name);
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(rawValue)) {
    throw new Error(`${name} muss ein positiver Betrag mit maximal zwei Nachkommastellen sein.`);
  }

  const value = Number(rawValue.replace(",", "."));
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} muss groesser als 0 sein.`);
  }

  return value;
}

function requireFreigabeStatus(formData: FormData) {
  const value = requireText(formData, "freigabeStatus");
  if (!Object.values(FreigabeStatus).includes(value as FreigabeStatus)) {
    throw new Error("Ungueltiger Freigabestatus.");
  }

  return value as FreigabeStatus;
}

function assertFreigabeFuerBetrag(
  geschaetzterBetrag: number,
  freigabeStatus: FreigabeStatus,
) {
  if (
    geschaetzterBetrag >= 1500 &&
    freigabeStatus === FreigabeStatus.NICHT_ERFORDERLICH
  ) {
    throw new Error(
      "Zusatzarbeiten ab 1.500 Euro brauchen eine schriftliche Freigabe.",
    );
  }
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

function addressField(prefix: string, field: string) {
  return prefix === ""
    ? field
    : `${prefix}${field[0].toUpperCase()}${field.slice(1)}`;
}

function customerAddress(formData: FormData, prefix = "", optional = false) {
  const fieldNames = {
    strasse: addressField(prefix, "strasse"),
    plz: addressField(prefix, "plz"),
    ort: addressField(prefix, "ort"),
  };
  const values = {
    strasse: optionalText(formData, fieldNames.strasse),
    plz: optionalText(formData, fieldNames.plz),
    ort: optionalText(formData, fieldNames.ort),
  };
  const isEmpty =
    values.strasse === "" && values.plz === "" && values.ort === "";

  if (optional && isEmpty) {
    return "";
  }

  if (values.strasse === "" || values.plz === "" || values.ort === "") {
    throw new Error("Strasse, PLZ und Ort muessen vollstaendig angegeben werden.");
  }

  if (!/^\d{5}$/.test(values.plz)) {
    throw new Error("Die PLZ muss aus genau 5 Ziffern bestehen.");
  }

  return formatAddress(values);
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
      adresse: customerAddress(formData),
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

export async function updateKunde(formData: FormData) {
  const kundeId = Number(requireText(formData, "kundeId"));

  if (!Number.isInteger(kundeId) || kundeId <= 0) {
    throw new Error("Ungueltiger Kunde.");
  }

  await prisma.kunde.update({
    where: { id: kundeId },
    data: {
      name: requireText(formData, "name"),
      telefonnummer: requireText(formData, "telefonnummer"),
      adresse: customerAddress(formData),
      kundentyp: requireText(formData, "kundentyp") as Kundentyp,
    },
  });

  revalidatePath("/");
  revalidatePath("/kunden");
  revalidatePath("/rechnungen");
  revalidatePath("/auftraege/[id]", "page");
}

export async function updateMitarbeiter(formData: FormData) {
  const mitarbeiterId = Number(requireText(formData, "mitarbeiterId"));

  if (!Number.isInteger(mitarbeiterId) || mitarbeiterId <= 0) {
    throw new Error("Ungueltiger Mitarbeiter.");
  }

  await prisma.mitarbeiter.update({
    where: { id: mitarbeiterId },
    data: {
      name: requireText(formData, "name"),
      rolle: requireText(formData, "rolle") as MitarbeiterRolle,
      telefonnummer: requireText(formData, "telefonnummer"),
      aktiv: formData.get("aktiv") === "on",
    },
  });

  revalidatePath("/");
  revalidatePath("/mitarbeiter");
  revalidatePath("/werkzeuge");
  revalidatePath("/auftraege/[id]", "page");
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

export async function updateMaterial(formData: FormData) {
  const materialId = Number(requireText(formData, "materialId"));
  const einheit = requireMaterialEinheit(formData);
  const lagerbestand = requireNonNegativeNumber(formData, "lagerbestand");

  if (!Number.isInteger(materialId) || materialId <= 0) {
    throw new Error("Ungueltiges Material.");
  }

  if (einheit === "Stueck") {
    assertWholeNumber(lagerbestand, "Lagerbestand");
  }

  await prisma.material.update({
    where: { id: materialId },
    data: {
      name: requireText(formData, "name"),
      einheit,
      lagerbestand,
      lagerort: requireText(formData, "lagerort"),
    },
  });

  revalidatePath("/material");
  revalidatePath("/auftraege/[id]", "page");
}

export async function createAuftrag(formData: FormData) {
  const kundeIdValue = optionalText(formData, "kundeId");
  const kundeId =
    kundeIdValue === "" || kundeIdValue === "__new" ? null : Number(kundeIdValue);
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

  let auftragId: number;

  if (kundeId) {
    const auftrag = await prisma.auftrag.create({
      data: {
        kundeId,
        beschreibung,
        prioritaet,
        mitarbeiter,
      },
    });
    auftragId = auftrag.id;
  } else {
    auftragId = await prisma.$transaction(async (tx) => {
      const kunde = await tx.kunde.create({
        data: {
          name: requireText(formData, "neuerKundeName"),
          telefonnummer: requireText(formData, "neuerKundeTelefonnummer"),
          adresse: customerAddress(formData, "neuerKunde", true),
          kundentyp: requireText(formData, "neuerKundeKundentyp") as Kundentyp,
        },
      });

      const auftrag = await tx.auftrag.create({
        data: {
          kundeId: kunde.id,
          beschreibung,
          prioritaet,
          mitarbeiter,
        },
      });

      return auftrag.id;
    });
  }

  revalidatePath("/");
  revalidatePath("/kunden");
  redirect(`/auftraege/${auftragId}`);
}

export async function updateAuftrag(formData: FormData) {
  const auftragId = Number(requireText(formData, "auftragId"));
  const status = requireText(formData, "status") as AuftragStatus;
  const mitarbeiterIds = selectedIds(formData, "mitarbeiterIds");
  const nichtFertigGrundValue = optionalText(formData, "nichtFertigGrund");
  const nichtFertigGrund =
    nichtFertigGrundValue === ""
      ? null
      : (nichtFertigGrundValue as NichtFertigGrund);
  const statusBrauchtGrund =
    status === AuftragStatus.PAUSIERT ||
    status === AuftragStatus.WARTET_AUF_MATERIAL ||
    status === AuftragStatus.WARTET_AUF_KUNDENENTSCHEIDUNG;

  if (statusBrauchtGrund && !nichtFertigGrund) {
    throw new Error("Wartende oder pausierte Auftraege brauchen einen Grund.");
  }

  const bisherigerAuftrag = await prisma.auftrag.findUnique({
    where: {
      id: auftragId,
    },
    select: {
      status: true,
      rechnung: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!bisherigerAuftrag) {
    throw new Error("Auftrag wurde nicht gefunden.");
  }

  assertAuftragStatusPasstZurRechnung(
    bisherigerAuftrag.status,
    status,
    Boolean(bisherigerAuftrag.rechnung),
  );

  await prisma.$transaction([
    prisma.auftragMitarbeiter.deleteMany({
      where: {
        auftragId,
      },
    }),
    prisma.auftrag.update({
      where: {
        id: auftragId,
      },
      data: {
        beschreibung: requireText(formData, "beschreibung"),
        prioritaet: requireText(formData, "prioritaet") as Prioritaet,
        status,
        nichtFertigGrund: statusBrauchtGrund ? nichtFertigGrund : null,
        mitarbeiter:
          mitarbeiterIds.length > 0
            ? {
                create: mitarbeiterIds.map((mitarbeiterId) => ({
                  mitarbeiterId,
                })),
              }
            : undefined,
      },
    }),
  ]);

  revalidatePath("/");
  revalidatePath(`/auftraege/${auftragId}`);
}

export async function updateAuftragKunde(formData: FormData) {
  const auftragId = Number(requireText(formData, "auftragId"));
  const kundeId = Number(requireText(formData, "kundeId"));
  const auftrag = await prisma.auftrag.findUnique({
    where: {
      id: auftragId,
    },
    select: {
      kundeId: true,
    },
  });

  if (!auftrag || auftrag.kundeId !== kundeId) {
    throw new Error("Kunde gehoert nicht zu diesem Auftrag.");
  }

  await prisma.kunde.update({
    where: {
      id: kundeId,
    },
    data: {
      name: requireText(formData, "name"),
      telefonnummer: requireText(formData, "telefonnummer"),
      adresse: customerAddress(formData),
      kundentyp: requireText(formData, "kundentyp") as Kundentyp,
    },
  });

  revalidatePath("/");
  revalidatePath("/kunden");
  revalidatePath(`/auftraege/${auftragId}`);
}

export async function createEinsatz(formData: FormData) {
  const auftragId = Number(requireText(formData, "auftragId"));
  const mitarbeiterIds = selectedIds(formData, "mitarbeiterIds");
  const status = requireText(formData, "status") as EinsatzStatus;

  await assertEinsatzTeamAllowed(mitarbeiterIds);

  if (status === EinsatzStatus.VERSCHOBEN) {
    const auftrag = await prisma.auftrag.findUnique({
      where: {
        id: auftragId,
      },
      select: {
        prioritaet: true,
      },
    });

    if (!auftrag) {
      throw new Error("Auftrag wurde nicht gefunden.");
    }

    if (auftrag.prioritaet === Prioritaet.NOTDIENST) {
      throw new Error(
        "Ein Notdienst kann nicht als bereits verschobener Einsatz angelegt werden.",
      );
    }
  }

  await prisma.einsatz.create({
    data: {
      auftragId,
      datum: new Date(requireText(formData, "datum")),
      status,
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
  revalidatePath(`/auftraege/${auftragId}`);
}

export async function verschiebeEinsatz(formData: FormData) {
  const einsatzId = Number(requireText(formData, "einsatzId"));
  const begruendung = requireText(formData, "begruendung");
  const neuesDatumText = requireText(formData, "neuesDatum");
  const neuesDatum = new Date(neuesDatumText);
  const notdienstBestaetigt =
    formData.get("notdienstBestaetigt") === "on";

  if (!Number.isInteger(einsatzId) || einsatzId <= 0) {
    throw new Error("Ungueltiger Einsatz.");
  }

  if (Number.isNaN(neuesDatum.getTime())) {
    throw new Error("Ungueltiges neues Einsatzdatum.");
  }

  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  if (neuesDatum < heute) {
    throw new Error("Das neue Einsatzdatum darf nicht in der Vergangenheit liegen.");
  }

  const einsatz = await prisma.einsatz.findUnique({
    where: {
      id: einsatzId,
    },
    include: {
      auftrag: {
        select: {
          id: true,
          prioritaet: true,
          status: true,
        },
      },
    },
  });

  if (!einsatz) {
    throw new Error("Einsatz wurde nicht gefunden.");
  }

  if (einsatz.status !== EinsatzStatus.GEPLANT) {
    throw new Error("Nur geplante Einsaetze koennen verschoben werden.");
  }

  if (
    einsatz.auftrag.status === AuftragStatus.BEZAHLT ||
    einsatz.auftrag.status === AuftragStatus.ESKALIERT
  ) {
    throw new Error("Abgeschlossene Auftraege koennen nicht verschoben werden.");
  }

  if (
    einsatz.datum.toISOString().slice(0, 10) ===
    neuesDatum.toISOString().slice(0, 10)
  ) {
    throw new Error("Das neue Einsatzdatum muss sich vom bisherigen Datum unterscheiden.");
  }

  assertNotdienstVerschiebungBestaetigt(
    einsatz.auftrag.prioritaet,
    notdienstBestaetigt,
  );

  await prisma.$transaction([
    prisma.einsatzVerschiebung.create({
      data: {
        einsatzId,
        vorherigesDatum: einsatz.datum,
        neuesDatum,
        begruendung,
        notdienstBestaetigt,
      },
    }),
    prisma.einsatz.update({
      where: {
        id: einsatzId,
      },
      data: {
        datum: neuesDatum,
      },
    }),
    prisma.auftrag.update({
      where: {
        id: einsatz.auftrag.id,
      },
      data: {
        updatedAt: new Date(),
      },
    }),
  ]);

  revalidatePath("/");
  revalidatePath(`/auftraege/${einsatz.auftrag.id}`);
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
  revalidatePath(`/auftraege/${auftragId}`);
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
  revalidatePath(`/auftraege/${auftragId}`);
}

export async function createZusatzarbeit(formData: FormData) {
  const auftragId = Number(requireText(formData, "auftragId"));
  const geschaetzterBetrag = requireMoney(formData, "geschaetzterBetrag");
  const freigabeStatus = requireFreigabeStatus(formData);

  assertFreigabeFuerBetrag(geschaetzterBetrag, freigabeStatus);

  await prisma.zusatzarbeit.create({
    data: {
      auftragId,
      beschreibung: requireText(formData, "beschreibung"),
      geschaetzterBetrag,
      freigabeStatus,
    },
  });

  revalidatePath("/");
  revalidatePath(`/auftraege/${auftragId}`);
}

export async function updateZusatzarbeitFreigabe(formData: FormData) {
  const auftragId = Number(requireText(formData, "auftragId"));
  const zusatzarbeitId = Number(requireText(formData, "zusatzarbeitId"));
  const freigabeStatus = requireFreigabeStatus(formData);
  const zusatzarbeit = await prisma.zusatzarbeit.findFirst({
    where: {
      id: zusatzarbeitId,
      auftragId,
    },
    select: {
      geschaetzterBetrag: true,
    },
  });

  if (!zusatzarbeit) {
    throw new Error("Zusatzarbeit wurde nicht gefunden.");
  }

  assertFreigabeFuerBetrag(
    zusatzarbeit.geschaetzterBetrag.toNumber(),
    freigabeStatus,
  );

  await prisma.zusatzarbeit.update({
    where: {
      id: zusatzarbeitId,
    },
    data: {
      freigabeStatus,
    },
  });

  revalidatePath("/");
  revalidatePath(`/auftraege/${auftragId}`);
}

export async function createRechnung(formData: FormData) {
  const auftragId = Number(requireText(formData, "auftragId"));
  const betrag = requireMoney(formData, "betrag");
  const erstelltAm = new Date(requireText(formData, "erstelltAm"));

  if (!Number.isInteger(auftragId) || auftragId <= 0) {
    throw new Error("Ungueltiger Auftrag.");
  }

  if (Number.isNaN(erstelltAm.getTime())) {
    throw new Error("Ungueltiges Rechnungsdatum.");
  }

  const morgen = new Date();
  morgen.setHours(24, 0, 0, 0);
  if (erstelltAm >= morgen) {
    throw new Error("Das Rechnungsdatum darf nicht in der Zukunft liegen.");
  }

  const auftrag = await prisma.auftrag.findUnique({
    where: {
      id: auftragId,
    },
    select: {
      status: true,
      rechnung: {
        select: {
          id: true,
        },
      },
      zusatzarbeiten: {
        select: {
          geschaetzterBetrag: true,
          freigabeStatus: true,
        },
      },
    },
  });

  if (!auftrag) {
    throw new Error("Auftrag wurde nicht gefunden.");
  }

  const blockierendeZusatzarbeiten = auftrag.zusatzarbeiten.filter(
    (zusatzarbeit) =>
      zusatzarbeit.geschaetzterBetrag.toNumber() >= 1500 &&
      zusatzarbeit.freigabeStatus !== FreigabeStatus.SCHRIFTLICH_FREIGEGEBEN,
  ).length;

  assertRechnungVorbereitbar(
    auftrag.status,
    Boolean(auftrag.rechnung),
    blockierendeZusatzarbeiten,
  );

  await prisma.$transaction([
    prisma.rechnung.create({
      data: {
        auftragId,
        erstelltAm,
        betrag,
        status: RechnungStatus.OFFEN,
      },
    }),
    prisma.auftrag.update({
      where: {
        id: auftragId,
      },
      data: {
        status: AuftragStatus.RECHNUNG_ERSTELLT,
        nichtFertigGrund: null,
      },
    }),
  ]);

  revalidatePath("/");
  revalidatePath(`/auftraege/${auftragId}`);
}

export async function updateRechnungStatus(formData: FormData) {
  const rechnungId = Number(requireText(formData, "rechnungId"));
  const auftragId = Number(requireText(formData, "auftragId"));
  const zuStatusText = requireText(formData, "zuStatus");
  const notiz = requireText(formData, "notiz");

  if (
    !Number.isInteger(rechnungId) ||
    rechnungId <= 0 ||
    !Number.isInteger(auftragId) ||
    auftragId <= 0
  ) {
    throw new Error("Ungueltige Rechnung oder ungueltiger Auftrag.");
  }

  if (
    !Object.values(RechnungStatus).includes(
      zuStatusText as RechnungStatus,
    )
  ) {
    throw new Error("Ungueltiger Rechnungsstatus.");
  }

  const zuStatus = zuStatusText as RechnungStatus;
  const rechnung = await prisma.rechnung.findFirst({
    where: {
      id: rechnungId,
      auftragId,
    },
    select: {
      status: true,
    },
  });

  if (!rechnung) {
    throw new Error("Rechnung wurde nicht gefunden.");
  }

  assertRechnungStatuswechselErlaubt(rechnung.status, zuStatus);
  const auftragStatus = getAuftragStatusFuerRechnung(zuStatus);

  await prisma.$transaction(async (tx) => {
    const aktualisiert = await tx.rechnung.updateMany({
      where: {
        id: rechnungId,
        auftragId,
        status: rechnung.status,
      },
      data: {
        status: zuStatus,
      },
    });

    if (aktualisiert.count !== 1) {
      throw new Error(
        "Der Rechnungsstatus wurde zwischenzeitlich geaendert. Bitte neu laden.",
      );
    }

    await tx.rechnungStatuswechsel.create({
      data: {
        rechnungId,
        vonStatus: rechnung.status,
        zuStatus,
        notiz,
      },
    });

    await tx.auftrag.update({
      where: {
        id: auftragId,
      },
      data: {
        status: auftragStatus,
        nichtFertigGrund: null,
      },
    });
  });

  revalidatePath("/");
  revalidatePath("/rechnungen");
  revalidatePath(`/auftraege/${auftragId}`);
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

export async function updateWerkzeug(formData: FormData) {
  const werkzeugId = Number(requireText(formData, "werkzeugId"));
  const status = requireText(formData, "status") as WerkzeugStatus;
  const aktuellerOrt = requireText(formData, "aktuellerOrt");
  const aktuellerBesitzerValue = optionalText(
    formData,
    "aktuellerBesitzerId",
  );
  const aktuellerBesitzerId =
    aktuellerBesitzerValue === "" ? null : Number(aktuellerBesitzerValue);

  if (!Number.isInteger(werkzeugId) || werkzeugId <= 0) {
    throw new Error("Ungueltiges Werkzeug.");
  }

  if (status === WerkzeugStatus.BEI_MITARBEITER && !aktuellerBesitzerId) {
    throw new Error("Werkzeug bei Mitarbeiter braucht einen Besitzer.");
  }

  const bisherigesWerkzeug = await prisma.werkzeug.findUnique({
    where: { id: werkzeugId },
  });

  if (!bisherigesWerkzeug) {
    throw new Error("Werkzeug wurde nicht gefunden.");
  }

  const standortGeaendert =
    bisherigesWerkzeug.status !== status ||
    bisherigesWerkzeug.aktuellerOrt !== aktuellerOrt ||
    bisherigesWerkzeug.aktuellerBesitzerId !== aktuellerBesitzerId;

  await prisma.$transaction(async (tx) => {
    await tx.werkzeug.update({
      where: { id: werkzeugId },
      data: {
        name: requireText(formData, "name"),
        status,
        aktuellerOrt,
        aktuellerBesitzerId,
      },
    });

    if (standortGeaendert) {
      await tx.werkzeugUebergabe.create({
        data: {
          werkzeugId,
          mitarbeiterId: aktuellerBesitzerId,
          ort: aktuellerOrt,
          notiz: "Bei Stammdatenbearbeitung aktualisiert",
        },
      });
    }
  });

  revalidatePath("/werkzeuge");
}
