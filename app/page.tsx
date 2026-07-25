import {
  AuftragStatus,
  EinsatzStatus,
  Kundentyp,
  MitarbeiterRolle,
  NichtFertigGrund,
  Prioritaet,
} from "@prisma/client";
import {
  createAuftrag,
  createEinsatz,
  createKunde,
  createMaterial,
  createMaterialverbrauch,
  createMitarbeiter,
  saveEinsatzRueckmeldung,
} from "./actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const kundentypLabels: Record<Kundentyp, string> = {
  PRIVATKUNDE: "Privatkunde",
  FIRMENKUNDE: "Firmenkunde",
};

const rollenLabels: Record<MitarbeiterRolle, string> = {
  GESCHAEFTSFUEHRER: "Geschaeftsfuehrer",
  BUERO: "Buero",
  MEISTER: "Meister",
  GESELLE: "Geselle",
  LEHRLING: "Lehrling",
};

const prioritaetLabels: Record<Prioritaet, string> = {
  NORMAL: "Normal",
  DRINGEND: "Dringend",
  NOTDIENST: "Notdienst",
};

const einsatzStatusLabels: Record<EinsatzStatus, string> = {
  GEPLANT: "Geplant",
  DURCHGEFUEHRT: "Durchgefuehrt",
  VERSCHOBEN: "Verschoben",
};

const auftragStatusLabels: Record<AuftragStatus, string> = {
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

const rueckmeldeStatus = [
  AuftragStatus.IN_BEARBEITUNG,
  AuftragStatus.PAUSIERT,
  AuftragStatus.WARTET_AUF_MATERIAL,
  AuftragStatus.WARTET_AUF_KUNDENENTSCHEIDUNG,
  AuftragStatus.TECHNISCH_FERTIG,
];

const nichtFertigGrundLabels: Record<NichtFertigGrund, string> = {
  FEHLENDES_MATERIAL: "Fehlendes Material",
  FEHLENDES_ERSATZTEIL: "Fehlendes Ersatzteil",
  OFFENE_KUNDENENTSCHEIDUNG: "Offene Kundenentscheidung",
  FOLGEEINSATZ_NOETIG: "Folgeeinsatz noetig",
};

export default async function Home() {
  const [kunden, mitarbeiter, materialien, auftraege, einsaetze] = await Promise.all([
    prisma.kunde.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.mitarbeiter.findMany({ orderBy: [{ aktiv: "desc" }, { name: "asc" }] }),
    prisma.material.findMany({ orderBy: { name: "asc" } }),
    prisma.auftrag.findMany({
      include: {
        kunde: true,
        materialverbraeuche: {
          include: {
            erfasstVon: true,
            material: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        mitarbeiter: {
          include: {
            mitarbeiter: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.einsatz.findMany({
      include: {
        auftrag: {
          include: {
            kunde: true,
          },
        },
        mitarbeiter: {
          include: {
            mitarbeiter: true,
          },
        },
      },
      orderBy: [{ datum: "asc" }, { updatedAt: "desc" }],
    }),
  ]);

  const aktiveMitarbeiter = mitarbeiter.filter((person) => person.aktiv);
  const offeneAuftraege = auftraege.filter(
    (auftrag) =>
      auftrag.status !== AuftragStatus.BEZAHLT &&
      auftrag.status !== AuftragStatus.ESKALIERT,
  );

  return (
    <main className="page">
      <header className="topbar">
        <div>
          <p className="eyebrow">Brandt & Soehne Elektro</p>
          <h1>Auftraege, Kunden, Mitarbeiter und Material</h1>
        </div>
        <div className="counters" aria-label="Aktueller Datenbestand">
          <span>{auftraege.length} Auftraege</span>
          <span>{einsaetze.length} Einsaetze</span>
          <span>{kunden.length} Kunden</span>
          <span>{aktiveMitarbeiter.length} aktiv</span>
        </div>
      </header>

      <section className="formsGrid" aria-label="Daten erfassen">
        <form action={createKunde} className="panel">
          <h2>Kunde erfassen</h2>
          <label>
            Name
            <input name="name" required />
          </label>
          <label>
            Telefonnummer
            <input name="telefonnummer" required />
          </label>
          <label>
            Adresse
            <textarea name="adresse" required rows={3} />
          </label>
          <label>
            Kundentyp
            <select name="kundentyp" defaultValue={Kundentyp.PRIVATKUNDE}>
              {Object.entries(kundentypLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Kunde speichern</button>
        </form>

        <form action={createMitarbeiter} className="panel">
          <h2>Mitarbeiter erfassen</h2>
          <label>
            Name
            <input name="name" required />
          </label>
          <label>
            Rolle
            <select name="rolle" defaultValue={MitarbeiterRolle.GESELLE}>
              {Object.entries(rollenLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Telefonnummer
            <input name="telefonnummer" required />
          </label>
          <label className="checkline">
            <input name="aktiv" type="checkbox" defaultChecked />
            Aktiv verfuegbar
          </label>
          <button type="submit">Mitarbeiter speichern</button>
        </form>

        <form action={createMaterial} className="panel">
          <h2>Material erfassen</h2>
          <label>
            Name
            <input name="name" required />
          </label>
          <label>
            Einheit
            <input name="einheit" placeholder="Stueck, Meter ..." required />
          </label>
          <label>
            Lagerbestand
            <input name="lagerbestand" type="number" step="0.01" min="0" defaultValue="0" required />
          </label>
          <label>
            Lagerort
            <input name="lagerort" required />
          </label>
          <button type="submit">Material speichern</button>
        </form>

        <form action={createAuftrag} className="panel wide">
          <h2>Auftrag erfassen</h2>
          <label>
            Kunde
            <select name="kundeId" required defaultValue="">
              <option value="" disabled>
                Kunde auswaehlen
              </option>
              {kunden.map((kunde) => (
                <option key={kunde.id} value={kunde.id}>
                  {kunde.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Beschreibung
            <textarea name="beschreibung" required rows={4} />
          </label>
          <label>
            Prioritaet
            <select name="prioritaet" defaultValue={Prioritaet.NORMAL}>
              {Object.entries(prioritaetLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend>Mitarbeiter zuordnen</legend>
            <div className="checkboxGrid">
              {aktiveMitarbeiter.length === 0 ? (
                <p className="emptyText">Noch keine aktiven Mitarbeiter erfasst.</p>
              ) : (
                aktiveMitarbeiter.map((person) => (
                  <label className="checkline" key={person.id}>
                    <input name="mitarbeiterIds" type="checkbox" value={person.id} />
                    {person.name}
                  </label>
                ))
              )}
            </div>
          </fieldset>
          <button type="submit" disabled={kunden.length === 0}>
            Auftrag speichern
          </button>
        </form>

        <form action={createEinsatz} className="panel wide">
          <h2>Einsatz planen</h2>
          <label>
            Auftrag
            <select name="auftragId" required defaultValue="">
              <option value="" disabled>
                Auftrag auswaehlen
              </option>
              {offeneAuftraege.map((auftrag) => (
                <option key={auftrag.id} value={auftrag.id}>
                  #{auftrag.id} - {auftrag.kunde.name}: {auftrag.beschreibung}
                </option>
              ))}
            </select>
          </label>
          <div className="fieldRow">
            <label>
              Datum
              <input name="datum" type="date" required />
            </label>
            <label>
              Status
              <select name="status" defaultValue={EinsatzStatus.GEPLANT}>
                {Object.entries(einsatzStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <fieldset>
            <legend>Mitarbeiter fuer Einsatz</legend>
            <div className="checkboxGrid">
              {aktiveMitarbeiter.length === 0 ? (
                <p className="emptyText">Noch keine aktiven Mitarbeiter erfasst.</p>
              ) : (
                aktiveMitarbeiter.map((person) => (
                  <label className="checkline" key={person.id}>
                    <input name="mitarbeiterIds" type="checkbox" value={person.id} />
                    {person.name} ({rollenLabels[person.rolle]})
                  </label>
                ))
              )}
            </div>
          </fieldset>
          <button
            type="submit"
            disabled={offeneAuftraege.length === 0 || aktiveMitarbeiter.length === 0}
          >
            Einsatz speichern
          </button>
        </form>

        <form action={createMaterialverbrauch} className="panel wide">
          <h2>Materialverbrauch erfassen</h2>
          <label>
            Auftrag
            <select name="auftragId" required defaultValue="">
              <option value="" disabled>
                Auftrag auswaehlen
              </option>
              {offeneAuftraege.map((auftrag) => (
                <option key={auftrag.id} value={auftrag.id}>
                  #{auftrag.id} - {auftrag.kunde.name}: {auftrag.beschreibung}
                </option>
              ))}
            </select>
          </label>
          <div className="fieldRow">
            <label>
              Material
              <select name="materialId" required defaultValue="">
                <option value="" disabled>
                  Material auswaehlen
                </option>
                {materialien.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.name} ({material.lagerbestand.toString()} {material.einheit})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Menge
              <input name="menge" type="number" step="0.01" min="0.01" required />
            </label>
          </div>
          <label>
            Erfasst von
            <select name="erfasstVonId" required defaultValue="">
              <option value="" disabled>
                Mitarbeiter auswaehlen
              </option>
              {aktiveMitarbeiter.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={
              offeneAuftraege.length === 0 ||
              materialien.length === 0 ||
              aktiveMitarbeiter.length === 0
            }
          >
            Verbrauch speichern
          </button>
        </form>
      </section>

      <section className="listPanel fullWidth" aria-label="Einsaetze und Rueckmeldungen">
        <h2>Einsaetze und Rueckmeldungen</h2>
        {einsaetze.length === 0 ? (
          <p className="emptyText">Noch keine Einsaetze geplant.</p>
        ) : (
          <ul className="itemList">
            {einsaetze.map((einsatz) => (
              <li key={einsatz.id}>
                <div>
                  <strong>
                    {new Intl.DateTimeFormat("de-DE").format(einsatz.datum)} -{" "}
                    {einsatz.auftrag.kunde.name}
                  </strong>
                  <p>{einsatz.auftrag.beschreibung}</p>
                </div>
                <div className="metaRow">
                  <span>{einsatzStatusLabels[einsatz.status]}</span>
                  <span>{auftragStatusLabels[einsatz.auftrag.status]}</span>
                  <span>
                    {einsatz.mitarbeiter
                      .map((entry) => entry.mitarbeiter.name)
                      .join(", ")}
                  </span>
                </div>
                {einsatz.rueckmeldung ? (
                  <p className="noteText">{einsatz.rueckmeldung}</p>
                ) : (
                  <form action={saveEinsatzRueckmeldung} className="inlineForm">
                    <input name="einsatzId" type="hidden" value={einsatz.id} />
                    <input name="auftragId" type="hidden" value={einsatz.auftragId} />
                    <label>
                      Rueckmeldung
                      <textarea name="rueckmeldung" required rows={3} />
                    </label>
                    <div className="fieldRow">
                      <label>
                        Neuer Auftragsstatus
                        <select name="auftragStatus" defaultValue={AuftragStatus.TECHNISCH_FERTIG}>
                          {rueckmeldeStatus.map((status) => (
                            <option key={status} value={status}>
                              {auftragStatusLabels[status]}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Grund wenn nicht fertig
                        <select name="nichtFertigGrund" defaultValue="">
                          <option value="">Kein Grund</option>
                          {Object.entries(nichtFertigGrundLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <button type="submit">Rueckmeldung speichern</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="dataGrid" aria-label="Uebersichten">
        <div className="listPanel">
          <h2>Aktuelle Auftraege</h2>
          {auftraege.length === 0 ? (
            <p className="emptyText">Noch keine Auftraege erfasst.</p>
          ) : (
            <ul className="itemList">
              {auftraege.map((auftrag) => (
                <li key={auftrag.id}>
                  <div>
                    <strong>{auftrag.kunde.name}</strong>
                    <p>{auftrag.beschreibung}</p>
                  </div>
                  <div className="metaRow">
                    <span>{prioritaetLabels[auftrag.prioritaet]}</span>
                    <span>{auftragStatusLabels[auftrag.status]}</span>
                    {auftrag.nichtFertigGrund ? (
                      <span>{nichtFertigGrundLabels[auftrag.nichtFertigGrund]}</span>
                    ) : null}
                    <span>
                      {auftrag.mitarbeiter.length === 0
                        ? "nicht zugeordnet"
                        : auftrag.mitarbeiter
                            .map((entry) => entry.mitarbeiter.name)
                            .join(", ")}
                    </span>
                  </div>
                  {auftrag.materialverbraeuche.length > 0 ? (
                    <div className="subList" aria-label="Materialverbrauch">
                      {auftrag.materialverbraeuche.map((verbrauch) => (
                        <span key={verbrauch.id}>
                          {verbrauch.material.name}: {verbrauch.menge.toString()}{" "}
                          {verbrauch.material.einheit} ({verbrauch.erfasstVon.name})
                        </span>
                      ))}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="listPanel">
          <h2>Kunden</h2>
          {kunden.length === 0 ? (
            <p className="emptyText">Noch keine Kunden erfasst.</p>
          ) : (
            <ul className="compactList">
              {kunden.map((kunde) => (
                <li key={kunde.id}>
                  <strong>{kunde.name}</strong>
                  <span>{kundentypLabels[kunde.kundentyp]}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="listPanel">
          <h2>Mitarbeiter</h2>
          {mitarbeiter.length === 0 ? (
            <p className="emptyText">Noch keine Mitarbeiter erfasst.</p>
          ) : (
            <ul className="compactList">
              {mitarbeiter.map((person) => (
                <li key={person.id}>
                  <strong>{person.name}</strong>
                  <span>{rollenLabels[person.rolle]}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="listPanel">
          <h2>Material</h2>
          {materialien.length === 0 ? (
            <p className="emptyText">Noch kein Material erfasst.</p>
          ) : (
            <ul className="compactList">
              {materialien.map((material) => (
                <li key={material.id}>
                  <strong>{material.name}</strong>
                  <span>
                    {material.lagerbestand.toString()} {material.einheit} / {material.lagerort}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
