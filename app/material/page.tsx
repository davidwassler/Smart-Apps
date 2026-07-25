import { MaterialForm } from "../material-form";
import { MaterialEditPanel } from "../material-edit-panel";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MaterialPage() {
  const materialien = await prisma.material.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="page">
      <header className="topbar">
        <div>
          <p className="eyebrow">Stammdaten</p>
          <h1>Material</h1>
        </div>
        <div className="counters">
          <span>{materialien.length} Materialien</span>
        </div>
      </header>

      <section className="formsGrid">
        <MaterialForm />

        <div className="listPanel wide">
          <h2>Materialliste</h2>
          {materialien.length === 0 ? (
            <p className="emptyText">Noch kein Material erfasst.</p>
          ) : (
            <ul className="compactList">
              {materialien.map((material) => (
                <li className="editableListItem" key={material.id}>
                  <MaterialEditPanel
                    material={{
                      id: material.id,
                      name: material.name,
                      einheit: material.einheit,
                      lagerbestand: material.lagerbestand.toString(),
                      lagerort: material.lagerort,
                    }}
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
