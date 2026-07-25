import { WerkzeugStatus } from "@prisma/client";
import { createWerkzeug } from "../actions";
import { werkzeugStatusLabels } from "../labels";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function WerkzeugePage() {
  const [werkzeuge, mitarbeiter] = await Promise.all([
    prisma.werkzeug.findMany({
      include: {
        aktuellerBesitzer: true,
      },
      orderBy: [{ status: "asc" }, { name: "asc" }],
    }),
    prisma.mitarbeiter.findMany({
      where: {
        aktiv: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return (
    <main className="page">
      <header className="topbar">
        <div>
          <p className="eyebrow">Standorte</p>
          <h1>Werkzeuge</h1>
        </div>
        <div className="counters">
          <span>{werkzeuge.length} Werkzeuge</span>
        </div>
      </header>

      <section className="formsGrid">
        <form action={createWerkzeug} className="panel">
          <h2>Werkzeug erfassen</h2>
          <label>
            Name
            <input name="name" required />
          </label>
          <label>
            Status
            <select name="status" defaultValue={WerkzeugStatus.VERFUEGBAR}>
              {Object.entries(werkzeugStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Aktueller Ort
            <input name="aktuellerOrt" placeholder="Werkstatt, Fahrzeug, Baustelle ..." required />
          </label>
          <label>
            Aktueller Besitzer
            <select name="aktuellerBesitzerId" defaultValue="">
              <option value="">Kein Besitzer</option>
              {mitarbeiter.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Werkzeug speichern</button>
        </form>

        <div className="listPanel wide">
          <h2>Werkzeugliste</h2>
          {werkzeuge.length === 0 ? (
            <p className="emptyText">Noch keine Werkzeuge erfasst.</p>
          ) : (
            <ul className="compactList">
              {werkzeuge.map((werkzeug) => (
                <li key={werkzeug.id}>
                  <strong>{werkzeug.name}</strong>
                  <span>{werkzeugStatusLabels[werkzeug.status]}</span>
                  <span>{werkzeug.aktuellerOrt}</span>
                  <span>
                    {werkzeug.aktuellerBesitzer
                      ? werkzeug.aktuellerBesitzer.name
                      : "kein Besitzer"}
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
