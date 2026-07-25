import { WerkzeugStatus } from "@prisma/client";
import { ActionForm } from "../action-form";
import {
  createWerkzeugFormAction,
  updateWerkzeugStandortFormAction,
} from "../form-actions";
import { werkzeugStatusLabels } from "../labels";
import { SubmitButton } from "../submit-button";
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
        <div className="counters">
          <span>{werkzeuge.length} Werkzeuge</span>
        </div>
      </header>

      <section className="formsGrid">
        <ActionForm action={createWerkzeugFormAction} className="panel">
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
          <SubmitButton pendingLabel="Werkzeug wird gespeichert...">
            Werkzeug speichern
          </SubmitButton>
        </ActionForm>

        <ActionForm action={updateWerkzeugStandortFormAction} className="panel">
          <h2>Standort wechseln</h2>
          <label>
            Werkzeug
            <select name="werkzeugId" required defaultValue="">
              <option value="" disabled>
                Werkzeug auswaehlen
              </option>
              {werkzeuge.map((werkzeug) => (
                <option key={werkzeug.id} value={werkzeug.id}>
                  {werkzeug.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Neuer Status
            <select name="status" defaultValue={WerkzeugStatus.BEI_MITARBEITER}>
              {Object.entries(werkzeugStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Neuer Ort
            <input name="aktuellerOrt" placeholder="Werkstatt, Fahrzeug, Baustelle ..." required />
          </label>
          <label>
            Neuer Besitzer
            <select name="aktuellerBesitzerId" defaultValue="">
              <option value="">Kein Besitzer</option>
              {mitarbeiter.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Notiz
            <textarea name="notiz" rows={3} />
          </label>
          <SubmitButton
            disabled={werkzeuge.length === 0}
            pendingLabel="Standort wird gespeichert..."
          >
            Standort speichern
          </SubmitButton>
        </ActionForm>

        <div className="listPanel wide">
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
