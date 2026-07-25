"use client";

import { useEffect, useState } from "react";
import { updateAuftrag, updateAuftragKunde } from "./actions";

type Option = {
  value: string;
  label: string;
};

type OrderEditPanelProps = {
  auftrag: {
    id: number;
    beschreibung: string;
    status: string;
    prioritaet: string;
    nichtFertigGrund: string | null;
    mitarbeiterIds: number[];
  };
  kunde: {
    id: number;
    name: string;
    telefonnummer: string;
    adresse: string;
    kundentyp: string;
  };
  mitarbeiter: Array<{
    id: number;
    name: string;
    aktiv: boolean;
  }>;
  statusOptionen: Option[];
  prioritaetOptionen: Option[];
  grundOptionen: Option[];
  kundentypOptionen: Option[];
};

const statusMitGrund = new Set([
  "PAUSIERT",
  "WARTET_AUF_MATERIAL",
  "WARTET_AUF_KUNDENENTSCHEIDUNG",
]);

export function OrderEditPanel({
  auftrag,
  kunde,
  mitarbeiter,
  statusOptionen,
  prioritaetOptionen,
  grundOptionen,
  kundentypOptionen,
}: OrderEditPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState(auftrag.status);
  const brauchtGrund = statusMitGrund.has(status);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return (
    <>
      <button
        className="secondaryButton"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        Auftrag bearbeiten
      </button>

      {isOpen ? (
        <div
          className="drawerBackdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              setIsOpen(false);
            }
          }}
        >
          <aside
            aria-labelledby="edit-order-heading"
            aria-modal="true"
            className="drawer"
            role="dialog"
          >
            <div className="drawerHeader">
              <div>
                <p className="eyebrow">Auftrag #{auftrag.id}</p>
                <h2 id="edit-order-heading">Auftrag bearbeiten</h2>
              </div>
              <button
                aria-label="Fenster schliessen"
                className="iconButton"
                title="Schliessen"
                type="button"
                onClick={() => setIsOpen(false)}
              >
                x
              </button>
            </div>

            <section className="drawerSection" aria-labelledby="order-data-heading">
              <div className="drawerSectionHeading">
                <h3 id="order-data-heading">Auftragsdaten</h3>
                <p>Beschreibung, Arbeitsstand und Team pflegen.</p>
              </div>
              <form action={updateAuftrag} className="drawerForm">
                <input name="auftragId" type="hidden" value={auftrag.id} />
                <label>
                  Beschreibung
                  <textarea
                    name="beschreibung"
                    defaultValue={auftrag.beschreibung}
                    required
                    rows={5}
                  />
                </label>
                <div className="fieldRow">
                  <label>
                    Prioritaet
                    <select name="prioritaet" defaultValue={auftrag.prioritaet}>
                      {prioritaetOptionen.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Status
                    <select
                      name="status"
                      value={status}
                      onChange={(event) => setStatus(event.target.value)}
                    >
                      {statusOptionen.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {brauchtGrund ? (
                  <label>
                    Hinderungsgrund
                    <select
                      name="nichtFertigGrund"
                      defaultValue={auftrag.nichtFertigGrund ?? ""}
                      required
                    >
                      <option value="" disabled>
                        Grund auswaehlen
                      </option>
                      {grundOptionen.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <input name="nichtFertigGrund" type="hidden" value="" />
                )}
                <fieldset>
                  <legend>Auftragsteam</legend>
                  <div className="checkboxGrid">
                    {mitarbeiter.length === 0 ? (
                      <p className="emptyText">
                        Noch keine Mitarbeiter erfasst.
                      </p>
                    ) : (
                      mitarbeiter.map((person) => (
                        <label className="checkline" key={person.id}>
                          <input
                            name="mitarbeiterIds"
                            type="checkbox"
                            value={person.id}
                            defaultChecked={auftrag.mitarbeiterIds.includes(
                              person.id,
                            )}
                          />
                          {person.name}
                          {!person.aktiv ? " (inaktiv)" : ""}
                        </label>
                      ))
                    )}
                  </div>
                </fieldset>
                <button type="submit">Auftragsdaten speichern</button>
              </form>
            </section>

            <section
              className="drawerSection"
              aria-labelledby="customer-data-heading"
            >
              <div className="drawerSectionHeading">
                <h3 id="customer-data-heading">Kundendaten</h3>
                <p>Fehlende Stammdaten direkt am Auftrag vervollstaendigen.</p>
              </div>
              <form action={updateAuftragKunde} className="drawerForm">
                <input name="auftragId" type="hidden" value={auftrag.id} />
                <input name="kundeId" type="hidden" value={kunde.id} />
                <label>
                  Name oder Firma
                  <input name="name" defaultValue={kunde.name} required />
                </label>
                <div className="fieldRow">
                  <label>
                    Telefonnummer
                    <input
                      name="telefonnummer"
                      defaultValue={kunde.telefonnummer}
                      required
                    />
                  </label>
                  <label>
                    Kundentyp
                    <select name="kundentyp" defaultValue={kunde.kundentyp}>
                      {kundentypOptionen.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label>
                  Adresse
                  <input name="adresse" defaultValue={kunde.adresse} required />
                </label>
                <button type="submit">Kundendaten speichern</button>
              </form>
            </section>

            <div className="drawerFooter">
              <button
                className="secondaryButton"
                type="button"
                onClick={() => setIsOpen(false)}
              >
                Schliessen
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
