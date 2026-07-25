"use client";

import { useEffect, useState } from "react";
import { ActionForm } from "./action-form";
import { CustomerPicker } from "./customer-picker";
import { createAuftragFormAction } from "./form-actions";
import { SubmitButton } from "./submit-button";
import { useDialogFocus } from "./use-dialog-focus";

type Option = {
  value: string;
  label: string;
};

type OrderCreatePanelProps = {
  kunden: Array<{ id: number; name: string }>;
  kundentypen: Option[];
  defaultKundentyp: string;
  mitarbeiter: Array<{ id: number; name: string }>;
  prioritaeten: Option[];
  defaultPrioritaet: string;
};

export function OrderCreatePanel({
  kunden,
  kundentypen,
  defaultKundentyp,
  mitarbeiter,
  prioritaeten,
  defaultPrioritaet,
}: OrderCreatePanelProps) {
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
      <button className="primaryAction" type="button" onClick={() => setIsOpen(true)}>
        Auftrag hinzufuegen
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
            aria-labelledby="create-order-heading"
            aria-modal="true"
            className="drawer"
            ref={dialogRef}
            role="dialog"
          >
            <div className="drawerHeader">
              <div>
                <p className="eyebrow">Neuer Auftrag</p>
                <h2 id="create-order-heading">Auftrag erfassen</h2>
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

            <ActionForm action={createAuftragFormAction} className="drawerForm">
              <CustomerPicker
                kunden={kunden}
                kundentypen={kundentypen}
                defaultKundentyp={defaultKundentyp}
              />
              <label>
                Beschreibung
                <textarea
                  name="beschreibung"
                  placeholder="Was soll erledigt werden?"
                  required
                  rows={5}
                />
              </label>
              <label>
                Prioritaet
                <select name="prioritaet" defaultValue={defaultPrioritaet}>
                  {prioritaeten.map((prioritaet) => (
                    <option key={prioritaet.value} value={prioritaet.value}>
                      {prioritaet.label}
                    </option>
                  ))}
                </select>
              </label>
              <fieldset>
                <legend>Mitarbeiter vorlaeufig zuordnen</legend>
                <div className="checkboxGrid">
                  {mitarbeiter.length === 0 ? (
                    <p className="emptyText">
                      Noch keine aktiven Mitarbeiter erfasst.
                    </p>
                  ) : (
                    mitarbeiter.map((person) => (
                      <label className="checkline" key={person.id}>
                        <input
                          name="mitarbeiterIds"
                          type="checkbox"
                          value={person.id}
                        />
                        {person.name}
                      </label>
                    ))
                  )}
                </div>
              </fieldset>
              <div className="drawerActions">
                <button
                  className="secondaryButton"
                  type="button"
                  onClick={() => setIsOpen(false)}
                >
                  Abbrechen
                </button>
                <SubmitButton pendingLabel="Auftrag wird gespeichert...">
                  Auftrag speichern
                </SubmitButton>
              </div>
            </ActionForm>
          </aside>
        </div>
      ) : null}
    </>
  );
}
