import { EmployeeCreatePanel } from "../employee-create-panel";
import { EmployeeEditPanel } from "../employee-edit-panel";
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
        <div className="topbarActions">
          <div className="counters">
            <span>{mitarbeiter.length} gesamt</span>
            <span>{aktiveMitarbeiter.length} aktiv</span>
          </div>
          <EmployeeCreatePanel
            rolleOptionen={Object.entries(rollenLabels).map(
              ([value, label]) => ({ value, label }),
            )}
          />
        </div>
      </header>

      <section className="listSection">
        <div className="listPanel">
          <h2>Mitarbeiterliste</h2>
          {mitarbeiter.length === 0 ? (
            <p className="emptyText">Noch keine Mitarbeiter erfasst.</p>
          ) : (
            <ul className="compactList">
              {mitarbeiter.map((person) => (
                <li className="editableListItem" key={person.id}>
                  <EmployeeEditPanel
                    mitarbeiter={{
                      id: person.id,
                      name: person.name,
                      rolle: person.rolle,
                      telefonnummer: person.telefonnummer,
                      aktiv: person.aktiv,
                    }}
                    rolleLabel={rollenLabels[person.rolle]}
                    rolleOptionen={Object.entries(rollenLabels).map(
                      ([value, label]) => ({ value, label }),
                    )}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
