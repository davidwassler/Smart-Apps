import { Kundentyp } from "@prisma/client";
import { ActionForm } from "../action-form";
import { createKundeFormAction } from "../form-actions";
import { kundentypLabels } from "../labels";
import { SubmitButton } from "../submit-button";
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
        <div className="counters">
          <span>{kunden.length} Kunden</span>
        </div>
      </header>

      <section className="formsGrid">
        <ActionForm action={createKundeFormAction} className="panel">
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
          <SubmitButton pendingLabel="Kunde wird gespeichert...">
            Kunde speichern
          </SubmitButton>
        </ActionForm>

        <div className="listPanel wide">
          <h2>Kundenliste</h2>
          {kunden.length === 0 ? (
            <p className="emptyText">Noch keine Kunden erfasst.</p>
          ) : (
            <ul className="compactList">
              {kunden.map((kunde) => (
                <li key={kunde.id}>
                  <strong>{kunde.name}</strong>
                  <span>{kundentypLabels[kunde.kundentyp]}</span>
                  <span>{kunde.telefonnummer}</span>
                  <span>{kunde.adresse}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
