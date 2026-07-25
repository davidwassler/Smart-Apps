"use client";

import { Kundentyp } from "@prisma/client";
import { useEffect, useState } from "react";
import { ActionForm } from "./action-form";
import { createKundeFormAction } from "./form-actions";
import { SubmitButton } from "./submit-button";
import { useDialogFocus } from "./use-dialog-focus";

type Option = {
  value: string;
  label: string;
};

type CustomerCreatePanelProps = {
  kundentypOptionen: Option[];
};

export function CustomerCreatePanel({
  kundentypOptionen,
}: CustomerCreatePanelProps) {
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

  return (
    <>
      <button
        className="primaryAction"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        Kunde hinzufuegen
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
            aria-labelledby="create-customer-heading"
            aria-modal="true"
            className="drawer"
            ref={dialogRef}
            role="dialog"
          >
            <div className="drawerHeader">
              <div>
                <p className="eyebrow">Neuer Kunde</p>
                <h2 id="create-customer-heading">Kunde erfassen</h2>
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

            <ActionForm action={createKundeFormAction} className="drawerForm">
              <label>
                Name
                <input name="name" required />
              </label>
              <label>
                Telefonnummer
                <input name="telefonnummer" required />
              </label>
              <label>
                Strasse + Nr.
                <input name="strasse" required />
              </label>
              <div className="fieldRow">
                <label>
                  PLZ
                  <input
                    autoComplete="postal-code"
                    inputMode="numeric"
                    maxLength={5}
                    minLength={5}
                    name="plz"
                    pattern="[0-9]{5}"
                    required
                  />
                </label>
                <label>
                  Ort
                  <input autoComplete="address-level2" name="ort" required />
                </label>
              </div>
              <label>
                Kundentyp
                <select name="kundentyp" defaultValue={Kundentyp.PRIVATKUNDE}>
                  {kundentypOptionen.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="drawerFooter">
                <button
                  className="secondaryButton"
                  type="button"
                  onClick={() => setIsOpen(false)}
                >
                  Abbrechen
                </button>
                <SubmitButton pendingLabel="Kunde wird gespeichert...">
                  Kunde speichern
                </SubmitButton>
              </div>
            </ActionForm>
          </aside>
        </div>
      ) : null}
    </>
  );
}
