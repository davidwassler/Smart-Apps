import { Kundentyp, MitarbeiterRolle, Prioritaet } from "@prisma/client";
import {
  createAuftrag,
  createKunde,
  createMaterial,
  createMitarbeiter,
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

export default async function Home() {
  const [kunden, mitarbeiter, materialien, auftraege] = await Promise.all([
    prisma.kunde.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.mitarbeiter.findMany({ orderBy: [{ aktiv: "desc" }, { name: "asc" }] }),
    prisma.material.findMany({ orderBy: { name: "asc" } }),
    prisma.auftrag.findMany({
      include: {
        kunde: true,
        mitarbeiter: {
          include: {
            mitarbeiter: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const aktiveMitarbeiter = mitarbeiter.filter((person) => person.aktiv);

  return (
    <main className="page">
      <header className="topbar">
        <div>
          <p className="eyebrow">Brandt & Soehne Elektro</p>
          <h1>Auftraege, Kunden, Mitarbeiter und Material</h1>
        </div>
        <div className="counters" aria-label="Aktueller Datenbestand">
          <span>{auftraege.length} Auftraege</span>
          <span>{kunden.length} Kunden</span>
          <span>{aktiveMitarbeiter.length} aktiv</span>
          <span>{materialien.length} Materialien</span>
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
                    <span>{auftrag.status.replaceAll("_", " ").toLowerCase()}</span>
                    <span>
                      {auftrag.mitarbeiter.length === 0
                        ? "nicht zugeordnet"
                        : auftrag.mitarbeiter
                            .map((entry) => entry.mitarbeiter.name)
                            .join(", ")}
                    </span>
                  </div>
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
                    {material.lagerbestand.toString()} {material.einheit} · {material.lagerort}
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
