import { WerkzeugStatus } from "@prisma/client";
import { werkzeugStatusLabels } from "../labels";
import { ToolCreatePanel } from "../tool-create-panel";
import { ToolEditPanel } from "../tool-edit-panel";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function WerkzeugePage() {
  const [werkzeuge, mitarbeiter] = await Promise.all([
    prisma.werkzeug.findMany({
      include: {
        aktuellerBesitzer: true,
        uebergaben: {
          include: {
            mitarbeiter: true,
          },
          orderBy: {
            uebergebenAm: "desc",
          },
        },
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
        <div className="topbarActions">
          <div className="counters">
            <span>{werkzeuge.length} Werkzeuge</span>
          </div>
          <ToolCreatePanel
            defaultStatus={WerkzeugStatus.VERFUEGBAR}
            mitarbeiter={mitarbeiter.map((person) => ({
              id: person.id,
              name: person.name,
            }))}
            statusOptionen={Object.entries(werkzeugStatusLabels).map(
              ([value, label]) => ({ value, label }),
            )}
          />
        </div>
      </header>

      <section className="listSection">
        <div className="listPanel">
          <h2>Werkzeugliste</h2>
          {werkzeuge.length === 0 ? (
            <p className="emptyText">Noch keine Werkzeuge erfasst.</p>
          ) : (
            <ul className="compactList">
              {werkzeuge.map((werkzeug) => (
                <li className="editableListItem" key={werkzeug.id}>
                  <ToolEditPanel
                    besitzerName={
                      werkzeug.aktuellerBesitzer
                        ? werkzeug.aktuellerBesitzer.name
                        : "kein Besitzer"
                    }
                    mitarbeiter={mitarbeiter.map((person) => ({
                      id: person.id,
                      name: person.name,
                    }))}
                    statusLabel={werkzeugStatusLabels[werkzeug.status]}
                    statusOptionen={Object.entries(werkzeugStatusLabels).map(
                      ([value, label]) => ({ value, label }),
                    )}
                    werkzeug={{
                      id: werkzeug.id,
                      name: werkzeug.name,
                      status: werkzeug.status,
                      aktuellerOrt: werkzeug.aktuellerOrt,
                      aktuellerBesitzerId: werkzeug.aktuellerBesitzerId,
                    }}
                  />
                  {werkzeug.uebergaben.length > 0 ? (
                    <div className="historyList">
                      {werkzeug.uebergaben.map((uebergabe) => (
                        <span key={uebergabe.id}>
                          {new Intl.DateTimeFormat("de-DE", {
                            dateStyle: "short",
                            timeStyle: "short",
                          }).format(uebergabe.uebergebenAm)}
                          : {uebergabe.ort}
                          {uebergabe.mitarbeiter ? ` / ${uebergabe.mitarbeiter.name}` : ""}
                          {uebergabe.notiz ? ` / ${uebergabe.notiz}` : ""}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
