"use client";

import { useEffect, useState } from "react";
import { createRechnung } from "./actions";

type InvoicePreparationPanelProps = {
  auftragId: number;
  kundeName: string;
  beschreibung: string;
  defaultDatum: string;
  einsaetze: Array<{
    id: number;
    datum: string;
    team: string;
    rueckmeldung: string;
  }>;
  materialien: Array<{
    id: number;
    name: string;
    menge: string;
    einheit: string;
  }>;
  zusatzarbeiten: Array<{
    id: number;
    beschreibung: string;
    betrag: string;
    freigabe: string;
  }>;
};

export function InvoicePreparationPanel({
  auftragId,
  kundeName,
  beschreibung,
  defaultDatum,
  einsaetze,
  materialien,
  zusatzarbeiten,
}: InvoicePreparationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

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
      <button type="button" onClick={() => setIsOpen(true)}>
        Rechnung vorbereiten
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
            aria-labelledby="invoice-preparation-heading"
            aria-modal="true"
            className="drawer"
            role="dialog"
          >
            <div className="drawerHeader">
              <div>
                <p className="eyebrow">Auftrag #{auftragId}</p>
                <h2 id="invoice-preparation-heading">
                  Rechnung vorbereiten
                </h2>
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

            <form action={createRechnung} className="drawerForm">
              <input name="auftragId" type="hidden" value={auftragId} />

              <section className="drawerSection invoiceOrderSummary">
                <div className="drawerSectionHeading">
                  <h3>{kundeName}</h3>
                  <p>{beschreibung}</p>
                </div>
              </section>

              <section className="drawerSection">
                <div className="drawerSectionHeading">
                  <h3>Einsaetze und Rueckmeldungen</h3>
                  <p>{einsaetze.length} Eintraege</p>
                </div>
                <ul className="invoiceBasisList">
                  {einsaetze.map((einsatz) => (
                    <li key={einsatz.id}>
                      <div>
                        <strong>{einsatz.datum}</strong>
                        <span>{einsatz.team}</span>
                      </div>
                      <p>{einsatz.rueckmeldung}</p>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="drawerSection">
                <div className="drawerSectionHeading">
                  <h3>Material</h3>
                  <p>{materialien.length} Positionen</p>
                </div>
                {materialien.length === 0 ? (
                  <p className="emptyText">Kein Materialverbrauch erfasst.</p>
                ) : (
                  <ul className="invoiceCompactList">
                    {materialien.map((material) => (
                      <li key={material.id}>
                        <strong>{material.name}</strong>
                        <span>
                          {material.menge} {material.einheit}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="drawerSection">
                <div className="drawerSectionHeading">
                  <h3>Zusatzarbeiten</h3>
                  <p>{zusatzarbeiten.length} Positionen</p>
                </div>
                {zusatzarbeiten.length === 0 ? (
                  <p className="emptyText">Keine Zusatzarbeiten erfasst.</p>
                ) : (
                  <ul className="invoiceBasisList">
                    {zusatzarbeiten.map((zusatzarbeit) => (
                      <li key={zusatzarbeit.id}>
                        <div>
                          <strong>{zusatzarbeit.beschreibung}</strong>
                          <span>{zusatzarbeit.freigabe}</span>
                        </div>
                        <p>{zusatzarbeit.betrag}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="drawerSection">
                <div className="drawerSectionHeading">
                  <h3>Rechnungsdaten</h3>
                </div>
                <div className="fieldRow">
                  <label>
                    Rechnungsdatum
                    <input
                      defaultValue={defaultDatum}
                      max={defaultDatum}
                      name="erstelltAm"
                      required
                      type="date"
                    />
                  </label>
                  <label>
                    Rechnungsbetrag
                    <input
                      inputMode="decimal"
                      min="0.01"
                      name="betrag"
                      placeholder="0,00"
                      required
                      step="0.01"
                      type="number"
                    />
                  </label>
                </div>
              </section>

              <div className="drawerFooter">
                <button
                  className="secondaryButton"
                  type="button"
                  onClick={() => setIsOpen(false)}
                >
                  Abbrechen
                </button>
                <button type="submit">Rechnung speichern</button>
              </div>
            </form>
          </aside>
        </div>
      ) : null}
    </>
  );
}
