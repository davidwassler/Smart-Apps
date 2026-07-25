"use client";

import { useEffect, useState } from "react";
import { ActionForm } from "./action-form";
import { AdditionalWorkForm } from "./additional-work-form";
import { createEinsatzFormAction } from "./form-actions";
import { MaterialUsageForm } from "./material-usage-form";
import { SubmitButton } from "./submit-button";
import { useDialogFocus } from "./use-dialog-focus";

type Option = {
  value: string;
  label: string;
};

type OrderActionPanelsProps = {
  auftragId: number;
  mitarbeiter: Array<{
    id: number;
    name: string;
    rolle: string;
  }>;
  einsatzStatusOptionen: Option[];
  defaultEinsatzStatus: string;
  materialien: Array<{
    id: number;
    name: string;
    einheit: string;
    lagerbestand: string;
  }>;
  freigabeStatusOptionen: Option[];
  istNotdienst: boolean;
};

type ActivePanel = "einsatz" | "material" | "zusatzarbeit" | null;

export function OrderActionPanels({
  auftragId,
  mitarbeiter,
  einsatzStatusOptionen,
  defaultEinsatzStatus,
  materialien,
  freigabeStatusOptionen,
  istNotdienst,
}: OrderActionPanelsProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const dialogRef = useDialogFocus(activePanel !== null);

  useEffect(() => {
    if (!activePanel) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActivePanel(null);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [activePanel]);

  return (
    <>
      <section
        className="detailBlock orderActions"
        aria-labelledby="order-actions-heading"
      >
        <div>
          <p className="eyebrow">Bearbeitung</p>
          <h2 id="order-actions-heading">Aktionen</h2>
        </div>
        <div className="actionButtons">
          <button type="button" onClick={() => setActivePanel("einsatz")}>
            Einsatz planen
          </button>
          <button
            className="secondaryButton"
            type="button"
            onClick={() => setActivePanel("material")}
          >
            Materialverbrauch erfassen
          </button>
          <button
            className="secondaryButton"
            type="button"
            onClick={() => setActivePanel("zusatzarbeit")}
          >
            Zusatzarbeit erfassen
          </button>
        </div>
      </section>

      {activePanel ? (
        <div
          className="drawerBackdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              setActivePanel(null);
            }
          }}
        >
          <aside
            aria-labelledby="order-action-heading"
            aria-modal="true"
            className="drawer"
            ref={dialogRef}
            role="dialog"
          >
            <div className="drawerHeader">
              <div>
                <p className="eyebrow">Auftrag #{auftragId}</p>
                <h2 id="order-action-heading">
                  {activePanel === "einsatz"
                    ? "Einsatz planen"
                    : activePanel === "material"
                      ? "Materialverbrauch erfassen"
                      : "Zusatzarbeit erfassen"}
                </h2>
              </div>
              <button
                aria-label="Fenster schliessen"
                className="iconButton"
                title="Schliessen"
                type="button"
                onClick={() => setActivePanel(null)}
              >
                x
              </button>
            </div>

            {activePanel === "einsatz" ? (
              <ActionForm
                action={createEinsatzFormAction}
                className="drawerForm"
              >
                <input name="auftragId" type="hidden" value={auftragId} />
                <div className="fieldRow">
                  <label>
                    Datum
                    <input name="datum" type="date" required />
                  </label>
                  <label>
                    Status
                    <select name="status" defaultValue={defaultEinsatzStatus}>
                      {einsatzStatusOptionen
                        .filter(
                          (option) =>
                            !istNotdienst || option.value !== "VERSCHOBEN",
                        )
                        .map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                    </select>
                  </label>
                </div>
                <fieldset>
                  <legend>Mitarbeiter fuer Einsatz</legend>
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
                          {person.name} ({person.rolle})
                        </label>
                      ))
                    )}
                  </div>
                </fieldset>
                <SubmitButton
                  disabled={mitarbeiter.length === 0}
                  pendingLabel="Einsatz wird gespeichert..."
                >
                  Einsatz speichern
                </SubmitButton>
              </ActionForm>
            ) : activePanel === "material" ? (
              <MaterialUsageForm
                auftragId={auftragId}
                materialien={materialien}
                mitarbeiter={mitarbeiter.map((person) => ({
                  id: person.id,
                  name: person.name,
                }))}
              />
            ) : (
              <AdditionalWorkForm
                auftragId={auftragId}
                freigabeStatusOptionen={freigabeStatusOptionen}
              />
            )}
          </aside>
        </div>
      ) : null}
    </>
  );
}
