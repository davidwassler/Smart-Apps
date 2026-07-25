import { AuftragStatus, EinsatzStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  createEinsatz,
  saveEinsatzRueckmeldung,
} from "../../actions";
import {
  auftragStatusLabels,
  einsatzStatusLabels,
  kundentypLabels,
  nichtFertigGrundLabels,
  prioritaetLabels,
  rollenLabels,
  rueckmeldeStatus,
} from "../../labels";
import { MaterialUsageForm } from "../../material-usage-form";
import { OrderEditPanel } from "../../order-edit-panel";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const auftragId = Number(id);

  if (!Number.isInteger(auftragId) || auftragId <= 0) {
    notFound();
  }

  const [auftrag, mitarbeiter, materialien] = await Promise.all([
    prisma.auftrag.findUnique({
      where: { id: auftragId },
      include: {
        kunde: true,
        mitarbeiter: {
          include: {
            mitarbeiter: true,
          },
        },
        einsaetze: {
          include: {
            mitarbeiter: {
              include: {
                mitarbeiter: true,
              },
            },
          },
          orderBy: [{ datum: "desc" }, { updatedAt: "desc" }],
        },
        materialverbraeuche: {
          include: {
            material: true,
            erfasstVon: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.mitarbeiter.findMany({
      orderBy: [{ aktiv: "desc" }, { name: "asc" }],
    }),
    prisma.material.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!auftrag) {
    notFound();
  }

  const istAbgeschlossen =
    auftrag.status === AuftragStatus.BEZAHLT ||
    auftrag.status === AuftragStatus.ESKALIERT;
  const kundenDatenUnvollstaendig =
    auftrag.kunde.telefonnummer.trim() === "" ||
    auftrag.kunde.adresse.trim() === "";
  const aktiveMitarbeiter = mitarbeiter.filter((person) => person.aktiv);

  return (
    <main className="page">
      <Link className="backLink" href="/">
        Zurueck zur Auftragsuebersicht
      </Link>

      <header className="detailHeader">
        <div>
          <p className="eyebrow">Auftrag #{auftrag.id}</p>
          <h1>{auftrag.kunde.name}</h1>
          <p className="pageIntro">{auftrag.beschreibung}</p>
        </div>
        <div className="detailHeaderActions">
          <span className={`statusBadge status-${auftrag.status.toLowerCase()}`}>
            {auftragStatusLabels[auftrag.status]}
          </span>
          <OrderEditPanel
            key={`${auftrag.id}-${auftrag.updatedAt.toISOString()}`}
            auftrag={{
              id: auftrag.id,
              beschreibung: auftrag.beschreibung,
              status: auftrag.status,
              prioritaet: auftrag.prioritaet,
              nichtFertigGrund: auftrag.nichtFertigGrund,
              mitarbeiterIds: auftrag.mitarbeiter.map(
                (entry) => entry.mitarbeiterId,
              ),
            }}
            kunde={{
              id: auftrag.kunde.id,
              name: auftrag.kunde.name,
              telefonnummer: auftrag.kunde.telefonnummer,
              adresse: auftrag.kunde.adresse,
              kundentyp: auftrag.kunde.kundentyp,
            }}
            mitarbeiter={mitarbeiter.map((person) => ({
              id: person.id,
              name: person.name,
              aktiv: person.aktiv,
            }))}
            statusOptionen={Object.entries(auftragStatusLabels).map(
              ([value, label]) => ({ value, label }),
            )}
            prioritaetOptionen={Object.entries(prioritaetLabels).map(
              ([value, label]) => ({ value, label }),
            )}
            grundOptionen={Object.entries(nichtFertigGrundLabels).map(
              ([value, label]) => ({ value, label }),
            )}
            kundentypOptionen={Object.entries(kundentypLabels).map(
              ([value, label]) => ({ value, label }),
            )}
          />
        </div>
      </header>

      <section className="detailFacts" aria-label="Auftragsdaten">
        <div>
          <span>Prioritaet</span>
          <strong>{prioritaetLabels[auftrag.prioritaet]}</strong>
        </div>
        <div>
          <span>Auftragsteam</span>
          <strong>
            {auftrag.mitarbeiter.length === 0
              ? "Noch nicht zugeordnet"
              : auftrag.mitarbeiter
                  .map((entry) => entry.mitarbeiter.name)
                  .join(", ")}
          </strong>
        </div>
        <div>
          <span>Kontakt</span>
          <strong>
            {auftrag.kunde.telefonnummer || "Telefonnummer fehlt"}
          </strong>
          <small>{auftrag.kunde.adresse || "Adresse fehlt"}</small>
        </div>
        <div>
          <span>Letzte Aenderung</span>
          <strong>
            {new Intl.DateTimeFormat("de-DE").format(auftrag.updatedAt)}
          </strong>
          {kundenDatenUnvollstaendig ? (
            <small className="warningText">Kundendaten ergaenzen</small>
          ) : null}
        </div>
      </section>

      {auftrag.nichtFertigGrund ? (
        <p className="attentionNote">
          Aktueller Hinderungsgrund:{" "}
          <strong>{nichtFertigGrundLabels[auftrag.nichtFertigGrund]}</strong>
        </p>
      ) : null}

      {!istAbgeschlossen ? (
        <section className="workGrid" aria-label="Arbeit am Auftrag">
          <div className="panel">
            <div className="panelHeading">
              <div>
                <p className="eyebrow">Termin</p>
                <h2>Einsatz planen</h2>
              </div>
            </div>
            <form action={createEinsatz}>
              <input name="auftragId" type="hidden" value={auftrag.id} />
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
                    <p className="emptyText">
                      Noch keine aktiven Mitarbeiter erfasst.
                    </p>
                  ) : (
                    aktiveMitarbeiter.map((person) => (
                      <label className="checkline" key={person.id}>
                        <input
                          name="mitarbeiterIds"
                          type="checkbox"
                          value={person.id}
                        />
                        {person.name} ({rollenLabels[person.rolle]})
                      </label>
                    ))
                  )}
                </div>
              </fieldset>
              <button type="submit" disabled={aktiveMitarbeiter.length === 0}>
                Einsatz speichern
              </button>
            </form>
          </div>

          <div className="panel">
            <div className="panelHeading">
              <div>
                <p className="eyebrow">Lager</p>
                <h2>Materialverbrauch erfassen</h2>
              </div>
            </div>
            <MaterialUsageForm
              auftragId={auftrag.id}
              materialien={materialien.map((material) => ({
                id: material.id,
                name: material.name,
                einheit: material.einheit,
                lagerbestand: material.lagerbestand.toString(),
              }))}
              mitarbeiter={aktiveMitarbeiter.map((person) => ({
                id: person.id,
                name: person.name,
              }))}
            />
          </div>
        </section>
      ) : (
        <p className="attentionNote">
          Dieser Auftrag ist abgeschlossen. Planung und Verbrauchserfassung sind
          daher nicht mehr aktiv.
        </p>
      )}

      <section className="detailSection" aria-labelledby="assignments-heading">
        <div className="sectionHeading">
          <div>
            <h2 id="assignments-heading">Einsaetze und Rueckmeldungen</h2>
            <p>{auftrag.einsaetze.length} Eintraege</p>
          </div>
        </div>
        {auftrag.einsaetze.length === 0 ? (
          <p className="emptyText">Fuer diesen Auftrag ist noch kein Einsatz geplant.</p>
        ) : (
          <ul className="recordList">
            {auftrag.einsaetze.map((einsatz) => (
              <li key={einsatz.id}>
                <div className="recordHeader">
                  <div>
                    <strong>
                      {new Intl.DateTimeFormat("de-DE").format(einsatz.datum)}
                    </strong>
                    <p>
                      {einsatz.mitarbeiter
                        .map((entry) => entry.mitarbeiter.name)
                        .join(", ")}
                    </p>
                  </div>
                  <span className="statusBadge">
                    {einsatzStatusLabels[einsatz.status]}
                  </span>
                </div>
                {einsatz.rueckmeldung ? (
                  <p className="noteText">{einsatz.rueckmeldung}</p>
                ) : (
                  <form action={saveEinsatzRueckmeldung} className="feedbackForm">
                    <input name="einsatzId" type="hidden" value={einsatz.id} />
                    <input name="auftragId" type="hidden" value={auftrag.id} />
                    <label>
                      Rueckmeldung
                      <textarea name="rueckmeldung" required rows={3} />
                    </label>
                    <div className="fieldRow">
                      <label>
                        Neuer Auftragsstatus
                        <select
                          name="auftragStatus"
                          defaultValue={AuftragStatus.TECHNISCH_FERTIG}
                        >
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
                          {Object.entries(nichtFertigGrundLabels).map(
                            ([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ),
                          )}
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

      <section className="detailSection" aria-labelledby="materials-heading">
        <div className="sectionHeading">
          <div>
            <h2 id="materials-heading">Verbrauchtes Material</h2>
            <p>{auftrag.materialverbraeuche.length} Eintraege</p>
          </div>
        </div>
        {auftrag.materialverbraeuche.length === 0 ? (
          <p className="emptyText">
            Fuer diesen Auftrag wurde noch kein Materialverbrauch erfasst.
          </p>
        ) : (
          <ul className="materialRecords">
            {auftrag.materialverbraeuche.map((verbrauch) => (
              <li key={verbrauch.id}>
                <strong>{verbrauch.material.name}</strong>
                <span>
                  {verbrauch.menge.toString()} {verbrauch.material.einheit}
                </span>
                <span>{verbrauch.erfasstVon.name}</span>
                <span>
                  {new Intl.DateTimeFormat("de-DE").format(verbrauch.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
