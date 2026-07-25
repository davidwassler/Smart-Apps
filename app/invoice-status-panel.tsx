"use client";

import { useEffect, useState } from "react";
import { ActionForm } from "./action-form";
import { updateRechnungStatusFormAction } from "./form-actions";
import { SubmitButton } from "./submit-button";
import { useDialogFocus } from "./use-dialog-focus";

type Option = {
  value: string;
  label: string;
};

type InvoiceStatusPanelProps = {
  rechnungId: number;
  auftragId: number;
  aktuellerStatus: string;
  statusOptionen: Option[];
};

export function InvoiceStatusPanel({
  rechnungId,
  auftragId,
  aktuellerStatus,
  statusOptionen,
}: InvoiceStatusPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useDialogFocus(isOpen);

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

  if (statusOptionen.length === 0) {
    return null;
  }

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        Status aktualisieren
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
            aria-labelledby="invoice-status-heading"
            aria-modal="true"
            className="drawer"
            ref={dialogRef}
            role="dialog"
          >
            <div className="drawerHeader">
              <div>
                <p className="eyebrow">Aktuell: {aktuellerStatus}</p>
                <h2 id="invoice-status-heading">
                  Rechnungsstatus aktualisieren
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

            <ActionForm
              action={updateRechnungStatusFormAction}
              className="drawerForm"
            >
              <input name="rechnungId" type="hidden" value={rechnungId} />
              <input name="auftragId" type="hidden" value={auftragId} />
              <label>
                Neuer Status
                <select name="zuStatus" defaultValue={statusOptionen[0].value}>
                  {statusOptionen.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Notiz
                <textarea
                  name="notiz"
                  placeholder="Zahlungseingang oder Mahnschritt dokumentieren"
                  required
                  rows={4}
                />
              </label>
              <div className="drawerFooter">
                <button
                  className="secondaryButton"
                  type="button"
                  onClick={() => setIsOpen(false)}
                >
                  Abbrechen
                </button>
                <SubmitButton pendingLabel="Status wird gespeichert...">
                  Status speichern
                </SubmitButton>
              </div>
            </ActionForm>
          </aside>
        </div>
      ) : null}
    </>
  );
}
