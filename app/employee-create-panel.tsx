"use client";

import { MitarbeiterRolle } from "@prisma/client";
import { useEffect, useState } from "react";
import { ActionForm } from "./action-form";
import { createMitarbeiterFormAction } from "./form-actions";
import { SubmitButton } from "./submit-button";
import { useDialogFocus } from "./use-dialog-focus";

type Option = {
  value: string;
  label: string;
};

type EmployeeCreatePanelProps = {
  rolleOptionen: Option[];
};

export function EmployeeCreatePanel({
  rolleOptionen,
}: EmployeeCreatePanelProps) {
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
        Mitarbeiter hinzufuegen
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
            aria-labelledby="create-employee-heading"
            aria-modal="true"
            className="drawer"
            ref={dialogRef}
            role="dialog"
          >
            <div className="drawerHeader">
              <div>
                <p className="eyebrow">Neuer Mitarbeiter</p>
                <h2 id="create-employee-heading">Mitarbeiter erfassen</h2>
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
              action={createMitarbeiterFormAction}
              className="drawerForm"
            >
              <label>
                Name
                <input name="name" required />
              </label>
              <label>
                Rolle
                <select
                  name="rolle"
                  defaultValue={MitarbeiterRolle.GESELLE}
                >
                  {rolleOptionen.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Telefonnummer
                <input name="telefonnummer" required />
              </label>
              <label className="checkline">
                <input name="aktiv" type="checkbox" defaultChecked />
                Aktiv verfuegbar
              </label>
              <div className="drawerFooter">
                <button
                  className="secondaryButton"
                  type="button"
                  onClick={() => setIsOpen(false)}
                >
                  Abbrechen
                </button>
                <SubmitButton pendingLabel="Mitarbeiter wird gespeichert...">
                  Mitarbeiter speichern
                </SubmitButton>
              </div>
            </ActionForm>
          </aside>
        </div>
      ) : null}
    </>
  );
}
