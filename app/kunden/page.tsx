import { CustomerCreatePanel } from "../customer-create-panel";
import { CustomerEditPanel } from "../customer-edit-panel";
import { kundentypLabels } from "../labels";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function KundenPage() {
  const kunden = await prisma.kunde.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <main className="page">
      <header className="topbar">
        <div>
          <p className="eyebrow">Stammdaten</p>
          <h1>Kunden</h1>
        </div>
        <div className="topbarActions">
          <div className="counters">
            <span>{kunden.length} Kunden</span>
          </div>
          <CustomerCreatePanel
            kundentypOptionen={Object.entries(kundentypLabels).map(
              ([value, label]) => ({ value, label }),
            )}
          />
        </div>
      </header>

      <section className="listSection">
        <div className="listPanel">
          <h2>Kundenliste</h2>
          {kunden.length === 0 ? (
            <p className="emptyText">Noch keine Kunden erfasst.</p>
          ) : (
            <ul className="compactList">
              {kunden.map((kunde) => (
                <li className="editableListItem" key={kunde.id}>
                  <CustomerEditPanel
                    kunde={{
                      id: kunde.id,
                      name: kunde.name,
                      telefonnummer: kunde.telefonnummer,
                      adresse: kunde.adresse,
                      kundentyp: kunde.kundentyp,
                    }}
                    kundentypLabel={kundentypLabels[kunde.kundentyp]}
                    kundentypOptionen={Object.entries(kundentypLabels).map(
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
