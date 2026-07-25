import {
  AuftragStatus,
  EinsatzStatus,
  FreigabeStatus,
  Kundentyp,
  MitarbeiterRolle,
  Prioritaet,
  WerkzeugStatus,
} from "@prisma/client";
import { prisma } from "../lib/prisma";

const demoNames = {
  kunden: [
    "Familie Neumann",
    "Baeckerei Kranz GmbH",
    "Hausverwaltung Lindenhof",
  ],
  materialien: [
    "NYM-J 3x1,5",
    "NYM-J 5x2,5",
    "Steckdose reinweiss",
    "LS-Schalter B16",
    "Aderendhuelsen Sortiment",
  ],
  mitarbeiter: [
    "Thomas Brandt",
    "Sabine Brandt",
    "Martin Krueger",
    "Jana Keller",
    "Lukas Brandt",
  ],
  werkzeuge: [
    "Bohrhammer Bosch GBH",
    "Pruefgeraet Benning",
    "Kabeltrommel 50m",
  ],
};

async function clearDemoData() {
  await prisma.werkzeugUebergabe.deleteMany({
    where: {
      werkzeug: {
        name: {
          in: demoNames.werkzeuge,
        },
      },
    },
  });
  await prisma.werkzeug.deleteMany({
    where: {
      name: {
        in: demoNames.werkzeuge,
      },
    },
  });
  await prisma.materialverbrauch.deleteMany({
    where: {
      OR: [
        {
          material: {
            name: {
              in: demoNames.materialien,
            },
          },
        },
        {
          auftrag: {
            kunde: {
              name: {
                in: demoNames.kunden,
              },
            },
          },
        },
      ],
    },
  });
  await prisma.zusatzarbeit.deleteMany({
    where: {
      auftrag: {
        kunde: {
          name: {
            in: demoNames.kunden,
          },
        },
      },
    },
  });
  await prisma.einsatzMitarbeiter.deleteMany({
    where: {
      einsatz: {
        auftrag: {
          kunde: {
            name: {
              in: demoNames.kunden,
            },
          },
        },
      },
    },
  });
  await prisma.einsatz.deleteMany({
    where: {
      auftrag: {
        kunde: {
          name: {
            in: demoNames.kunden,
          },
        },
      },
    },
  });
  await prisma.auftragMitarbeiter.deleteMany({
    where: {
      auftrag: {
        kunde: {
          name: {
            in: demoNames.kunden,
          },
        },
      },
    },
  });
  await prisma.rechnung.deleteMany({
    where: {
      auftrag: {
        kunde: {
          name: {
            in: demoNames.kunden,
          },
        },
      },
    },
  });
  await prisma.auftrag.deleteMany({
    where: {
      kunde: {
        name: {
          in: demoNames.kunden,
        },
      },
    },
  });
  await prisma.material.deleteMany({
    where: {
      name: {
        in: demoNames.materialien,
      },
    },
  });
  await prisma.kunde.deleteMany({
    where: {
      name: {
        in: demoNames.kunden,
      },
    },
  });
  await prisma.mitarbeiter.deleteMany({
    where: {
      name: {
        in: demoNames.mitarbeiter,
      },
    },
  });
}

async function main() {
  await clearDemoData();

  const [
    thomas,
    sabine,
    martin,
    jana,
    lukas,
  ] = await Promise.all([
    prisma.mitarbeiter.create({
      data: {
        name: "Thomas Brandt",
        rolle: MitarbeiterRolle.GESCHAEFTSFUEHRER,
        telefonnummer: "0171 1000001",
      },
    }),
    prisma.mitarbeiter.create({
      data: {
        name: "Sabine Brandt",
        rolle: MitarbeiterRolle.BUERO,
        telefonnummer: "0521 1000002",
      },
    }),
    prisma.mitarbeiter.create({
      data: {
        name: "Martin Krueger",
        rolle: MitarbeiterRolle.MEISTER,
        telefonnummer: "0171 1000003",
      },
    }),
    prisma.mitarbeiter.create({
      data: {
        name: "Jana Keller",
        rolle: MitarbeiterRolle.GESELLE,
        telefonnummer: "0171 1000004",
      },
    }),
    prisma.mitarbeiter.create({
      data: {
        name: "Lukas Brandt",
        rolle: MitarbeiterRolle.LEHRLING,
        telefonnummer: "0171 1000005",
      },
    }),
  ]);

  const [neumann, baeckerei, lindenhof] = await Promise.all([
    prisma.kunde.create({
      data: {
        name: "Familie Neumann",
        telefonnummer: "0521 445566",
        adresse: "Ahornweg 12, 33609 Bielefeld",
        kundentyp: Kundentyp.PRIVATKUNDE,
      },
    }),
    prisma.kunde.create({
      data: {
        name: "Baeckerei Kranz GmbH",
        telefonnummer: "0521 778899",
        adresse: "Marktstrasse 4, 33602 Bielefeld",
        kundentyp: Kundentyp.FIRMENKUNDE,
      },
    }),
    prisma.kunde.create({
      data: {
        name: "Hausverwaltung Lindenhof",
        telefonnummer: "0521 334455",
        adresse: "Lindenhof 8, 33613 Bielefeld",
        kundentyp: Kundentyp.FIRMENKUNDE,
      },
    }),
  ]);

  const [kabel15, kabel25, steckdose, lsSchalter, huelsen] = await Promise.all([
    prisma.material.create({
      data: {
        name: "NYM-J 3x1,5",
        einheit: "m",
        lagerbestand: 87.5,
        lagerort: "Lager Regal Kabel",
      },
    }),
    prisma.material.create({
      data: {
        name: "NYM-J 5x2,5",
        einheit: "m",
        lagerbestand: 42,
        lagerort: "Fahrzeug 2",
      },
    }),
    prisma.material.create({
      data: {
        name: "Steckdose reinweiss",
        einheit: "Stueck",
        lagerbestand: 36,
        lagerort: "Lager Regal Installation",
      },
    }),
    prisma.material.create({
      data: {
        name: "LS-Schalter B16",
        einheit: "Stueck",
        lagerbestand: 18,
        lagerort: "Fahrzeug 1",
      },
    }),
    prisma.material.create({
      data: {
        name: "Aderendhuelsen Sortiment",
        einheit: "Stueck",
        lagerbestand: 250,
        lagerort: "Werkstatt",
      },
    }),
  ]);

  const notdienst = await prisma.auftrag.create({
    data: {
      kundeId: baeckerei.id,
      beschreibung: "Notdienst: Sicherung fliegt im Backofenbereich regelmaessig raus.",
      prioritaet: Prioritaet.NOTDIENST,
      status: AuftragStatus.TECHNISCH_FERTIG,
      mitarbeiter: {
        create: [{ mitarbeiterId: martin.id }, { mitarbeiterId: lukas.id }],
      },
      einsaetze: {
        create: {
          datum: new Date("2026-07-22T07:30:00"),
          status: EinsatzStatus.DURCHGEFUEHRT,
          rueckmeldung: "Defekten LS-Schalter getauscht, Anlage geprueft.",
          mitarbeiter: {
            create: [{ mitarbeiterId: martin.id }, { mitarbeiterId: lukas.id }],
          },
        },
      },
    },
  });

  const materialWartet = await prisma.auftrag.create({
    data: {
      kundeId: neumann.id,
      beschreibung: "Zwei neue Steckdosen im Arbeitszimmer installieren.",
      prioritaet: Prioritaet.NORMAL,
      status: AuftragStatus.WARTET_AUF_MATERIAL,
      nichtFertigGrund: "FEHLENDES_MATERIAL",
      mitarbeiter: {
        create: [{ mitarbeiterId: jana.id }],
      },
      einsaetze: {
        create: {
          datum: new Date("2026-07-24T09:00:00"),
          status: EinsatzStatus.DURCHGEFUEHRT,
          rueckmeldung: "Leitungsweg geprueft, es fehlt noch passender Kanal.",
          mitarbeiter: {
            create: [{ mitarbeiterId: jana.id }],
          },
        },
      },
    },
  });

  const geplant = await prisma.auftrag.create({
    data: {
      kundeId: lindenhof.id,
      beschreibung: "Treppenhausbeleuchtung auf Bewegungsmelder pruefen und umruessten.",
      prioritaet: Prioritaet.DRINGEND,
      status: AuftragStatus.GEPLANT,
      mitarbeiter: {
        create: [{ mitarbeiterId: thomas.id }, { mitarbeiterId: martin.id }],
      },
      einsaetze: {
        create: {
          datum: new Date("2026-07-29T08:00:00"),
          status: EinsatzStatus.GEPLANT,
          mitarbeiter: {
            create: [{ mitarbeiterId: thomas.id }, { mitarbeiterId: martin.id }],
          },
        },
      },
    },
  });

  await prisma.zusatzarbeit.createMany({
    data: [
      {
        auftragId: notdienst.id,
        beschreibung:
          "Zusaetzliche Absicherung fuer den zweiten Backofenstromkreis.",
        geschaetzterBetrag: 1650,
        freigabeStatus: FreigabeStatus.SCHRIFTLICH_FREIGEGEBEN,
      },
      {
        auftragId: materialWartet.id,
        beschreibung:
          "Zusaetzlichen Kabelkanal entlang der Sockelleiste montieren.",
        geschaetzterBetrag: 480,
        freigabeStatus: FreigabeStatus.NICHT_ERFORDERLICH,
      },
      {
        auftragId: geplant.id,
        beschreibung:
          "Brandschutzgerechte Leitungsfuehrung im Treppenhaus nachruesten.",
        geschaetzterBetrag: 1850,
        freigabeStatus: FreigabeStatus.ANGEFRAGT,
      },
    ],
  });

  await prisma.materialverbrauch.createMany({
    data: [
      {
        auftragId: notdienst.id,
        materialId: lsSchalter.id,
        menge: 1,
        erfasstVonId: martin.id,
      },
      {
        auftragId: notdienst.id,
        materialId: huelsen.id,
        menge: 6,
        erfasstVonId: lukas.id,
      },
      {
        auftragId: materialWartet.id,
        materialId: kabel15.id,
        menge: 8.5,
        erfasstVonId: jana.id,
      },
      {
        auftragId: materialWartet.id,
        materialId: steckdose.id,
        menge: 2,
        erfasstVonId: jana.id,
      },
      {
        auftragId: geplant.id,
        materialId: kabel25.id,
        menge: 3.25,
        erfasstVonId: martin.id,
      },
    ],
  });

  await Promise.all([
    prisma.material.update({
      where: {
        id: lsSchalter.id,
      },
      data: {
        lagerbestand: {
          decrement: 1,
        },
      },
    }),
    prisma.material.update({
      where: {
        id: huelsen.id,
      },
      data: {
        lagerbestand: {
          decrement: 6,
        },
      },
    }),
    prisma.material.update({
      where: {
        id: kabel15.id,
      },
      data: {
        lagerbestand: {
          decrement: 8.5,
        },
      },
    }),
    prisma.material.update({
      where: {
        id: steckdose.id,
      },
      data: {
        lagerbestand: {
          decrement: 2,
        },
      },
    }),
    prisma.material.update({
      where: {
        id: kabel25.id,
      },
      data: {
        lagerbestand: {
          decrement: 3.25,
        },
      },
    }),
  ]);

  await prisma.werkzeug.create({
    data: {
      name: "Bohrhammer Bosch GBH",
      status: WerkzeugStatus.BEI_MITARBEITER,
      aktuellerOrt: "Fahrzeug 1",
      aktuellerBesitzerId: martin.id,
      uebergaben: {
        create: [
          {
            mitarbeiterId: martin.id,
            ort: "Fahrzeug 1",
            notiz: "Fuer Treppenhausauftrag reserviert",
            uebergebenAm: new Date("2026-07-24T16:30:00"),
          },
        ],
      },
    },
  });

  await prisma.werkzeug.create({
    data: {
      name: "Pruefgeraet Benning",
      status: WerkzeugStatus.WERKSTATT,
      aktuellerOrt: "Werkstatt Pruefplatz",
      uebergaben: {
        create: [
          {
            ort: "Werkstatt Pruefplatz",
            notiz: "Nach Kalibrierung zurueckgelegt",
            uebergebenAm: new Date("2026-07-20T12:00:00"),
          },
        ],
      },
    },
  });

  await prisma.werkzeug.create({
    data: {
      name: "Kabeltrommel 50m",
      status: WerkzeugStatus.UNBEKANNT,
      aktuellerOrt: "Unklar, zuletzt Baustelle Lindenhof",
      uebergaben: {
        create: [
          {
            mitarbeiterId: sabine.id,
            ort: "Unklar, zuletzt Baustelle Lindenhof",
            notiz: "Rueckfrage im Team noetig",
            uebergebenAm: new Date("2026-07-23T17:15:00"),
          },
        ],
      },
    },
  });

  console.log("Demo-Daten wurden neu angelegt.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
