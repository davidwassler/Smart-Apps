import { MitarbeiterRolle } from "@prisma/client";
import { createMitarbeiter } from "../actions";
import { rollenLabels } from "../labels";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MitarbeiterPage() {
  const mitarbeiter = await prisma.mitarbeiter.findMany({
    orderBy: [{ aktiv: "desc" }, { name: "asc" }],
  });
  const aktiveMitarbeiter = mitarbeiter.filter((person) => person.aktiv);

  return (
    <main className="page">
      <header className="topbar">
        <div>
          <p className="eyebrow">Stammdaten</p>
          <h1>Mitarbeiter</h1>
        </div>
        <div className="counters">
          <span>{mitarbeiter.length} gesamt</span>
          <span>{aktiveMitarbeiter.length} aktiv</span>
        </div>
      </header>

      <section className="formsGrid">
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

        <div className="listPanel wide">
          <h2>Mitarbeiterliste</h2>
          {mitarbeiter.length === 0 ? (
            <p className="emptyText">Noch keine Mitarbeiter erfasst.</p>
          ) : (
            <ul className="compactList">
              {mitarbeiter.map((person) => (
                <li key={person.id}>
                  <strong>{person.name}</strong>
                  <span>{rollenLabels[person.rolle]}</span>
                  <span>{person.telefonnummer}</span>
                  <span>{person.aktiv ? "aktiv" : "inaktiv"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
