"use client";

import { useEffect, useState } from "react";
import { ActionForm } from "./action-form";
import { saveEinsatzRueckmeldungFormAction } from "./form-actions";
import { SubmitButton } from "./submit-button";
import { useDialogFocus } from "./use-dialog-focus";

type Option = {
  value: string;
  label: string;
};

type AssignmentFeedbackPanelProps = {
  auftragId: number;
  einsatzId: number;
  einsatzDatum: string;
  statusOptionen: Option[];
  grundOptionen: Option[];
  defaultStatus: string;
};

export function AssignmentFeedbackPanel({
  auftragId,
  einsatzId,
  einsatzDatum,
  statusOptionen,
  grundOptionen,
  defaultStatus,
}: AssignmentFeedbackPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useDialogFocus(isOpen);
  const [status, setStatus] = useState(defaultStatus);
  const brauchtGrund = status !== "TECHNISCH_FERTIG";

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
        className="secondaryButton timelineAction"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        Rueckmeldung erfassen
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
            aria-labelledby="feedback-heading"
            aria-modal="true"
            className="drawer"
            ref={dialogRef}
            role="dialog"
          >
            <div className="drawerHeader">
              <div>
                <p className="eyebrow">Einsatz vom {einsatzDatum}</p>
                <h2 id="feedback-heading">Rueckmeldung erfassen</h2>
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
              action={saveEinsatzRueckmeldungFormAction}
              className="drawerForm"
            >
              <input name="einsatzId" type="hidden" value={einsatzId} />
              <input name="auftragId" type="hidden" value={auftragId} />
              <label>
                Rueckmeldung
                <textarea name="rueckmeldung" required rows={5} />
              </label>
              <label>
                Neuer Auftragsstatus
                <select
                  name="auftragStatus"
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
              {brauchtGrund ? (
                <label>
                  Grund wenn nicht fertig
                  <select name="nichtFertigGrund" defaultValue="" required>
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
              <SubmitButton pendingLabel="Rueckmeldung wird gespeichert...">
                Rueckmeldung speichern
              </SubmitButton>
            </ActionForm>
          </aside>
        </div>
      ) : null}
    </>
  );
}
