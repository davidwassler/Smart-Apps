import {
  AuftragStatus,
  EinsatzStatus,
  Kundentyp,
  MitarbeiterRolle,
  NichtFertigGrund,
  Prioritaet,
} from "@prisma/client";

export const kundentypLabels: Record<Kundentyp, string> = {
  PRIVATKUNDE: "Privatkunde",
  FIRMENKUNDE: "Firmenkunde",
};

export const rollenLabels: Record<MitarbeiterRolle, string> = {
  GESCHAEFTSFUEHRER: "Geschaeftsfuehrer",
  BUERO: "Buero",
  MEISTER: "Meister",
  GESELLE: "Geselle",
  LEHRLING: "Lehrling",
};

export const prioritaetLabels: Record<Prioritaet, string> = {
  NORMAL: "Normal",
  DRINGEND: "Dringend",
  NOTDIENST: "Notdienst",
};

export const einsatzStatusLabels: Record<EinsatzStatus, string> = {
  GEPLANT: "Geplant",
  DURCHGEFUEHRT: "Durchgefuehrt",
  VERSCHOBEN: "Verschoben",
};

export const auftragStatusLabels: Record<AuftragStatus, string> = {
  AUFGENOMMEN: "Aufgenommen",
  GEPLANT: "Geplant",
  IN_BEARBEITUNG: "In Bearbeitung",
  PAUSIERT: "Pausiert",
  WARTET_AUF_MATERIAL: "Wartet auf Material",
  WARTET_AUF_KUNDENENTSCHEIDUNG: "Wartet auf Kundenentscheidung",
  TECHNISCH_FERTIG: "Technisch fertig",
  RECHNUNG_ERSTELLT: "Rechnung erstellt",
  BEZAHLT: "Bezahlt",
  GEMAHNT: "Gemahnt",
  ESKALIERT: "Eskaliert",
};

export const rueckmeldeStatus = [
  AuftragStatus.IN_BEARBEITUNG,
  AuftragStatus.PAUSIERT,
  AuftragStatus.WARTET_AUF_MATERIAL,
  AuftragStatus.WARTET_AUF_KUNDENENTSCHEIDUNG,
  AuftragStatus.TECHNISCH_FERTIG,
];

export const nichtFertigGrundLabels: Record<NichtFertigGrund, string> = {
  FEHLENDES_MATERIAL: "Fehlendes Material",
  FEHLENDES_ERSATZTEIL: "Fehlendes Ersatzteil",
  OFFENE_KUNDENENTSCHEIDUNG: "Offene Kundenentscheidung",
  FOLGEEINSATZ_NOETIG: "Folgeeinsatz noetig",
};
