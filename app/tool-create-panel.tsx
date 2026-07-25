"use client";

import { useEffect, useState } from "react";
import { ActionForm } from "./action-form";
import { createWerkzeugFormAction } from "./form-actions";
import { SubmitButton } from "./submit-button";
import { useDialogFocus } from "./use-dialog-focus";

type Option = {
  value: string;
  label: string;
};

type ToolCreatePanelProps = {
  defaultStatus: string;
  mitarbeiter: Array<{ id: number; name: string }>;
  statusOptionen: Option[];
};

export function ToolCreatePanel({
  defaultStatus,
  mitarbeiter,
  statusOptionen,
}: ToolCreatePanelProps) {
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
        Werkzeug hinzufuegen
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
            aria-labelledby="create-tool-heading"
            aria-modal="true"
            className="drawer"
            ref={dialogRef}
            role="dialog"
          >
            <div className="drawerHeader">
              <div>
                <p className="eyebrow">Neues Werkzeug</p>
                <h2 id="create-tool-heading">Werkzeug erfassen</h2>
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

            <ActionForm action={createWerkzeugFormAction} className="drawerForm">
              <label>
                Name
                <input name="name" required />
              </label>
              <label>
                Status
                <select name="status" defaultValue={defaultStatus}>
                  {statusOptionen.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Aktueller Ort
                <input
                  name="aktuellerOrt"
                  placeholder="Werkstatt, Fahrzeug, Baustelle ..."
                  required
                />
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
              <div className="drawerFooter">
                <button
                  className="secondaryButton"
                  type="button"
                  onClick={() => setIsOpen(false)}
                >
                  Abbrechen
                </button>
                <SubmitButton pendingLabel="Werkzeug wird gespeichert...">
                  Werkzeug speichern
                </SubmitButton>
              </div>
            </ActionForm>
          </aside>
        </div>
      ) : null}
    </>
  );
}
