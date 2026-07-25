"use client";

import { useEffect, useState } from "react";
import { ActionForm } from "./action-form";
import { updateZusatzarbeitFreigabeFormAction } from "./form-actions";
import { SubmitButton } from "./submit-button";
import { useDialogFocus } from "./use-dialog-focus";

type Option = {
  value: string;
  label: string;
};

type AdditionalWorkApprovalPanelProps = {
  auftragId: number;
  zusatzarbeitId: number;
  beschreibung: string;
  geschaetzterBetrag: number;
  freigabeStatus: string;
  freigabeStatusOptionen: Option[];
};

export function AdditionalWorkApprovalPanel({
  auftragId,
  zusatzarbeitId,
  beschreibung,
  geschaetzterBetrag,
  freigabeStatus,
  freigabeStatusOptionen,
}: AdditionalWorkApprovalPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useDialogFocus(isOpen);
  const [status, setStatus] = useState(freigabeStatus);
  const brauchtSchriftlicheFreigabe = geschaetzterBetrag >= 1500;

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
        Freigabe bearbeiten
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
            aria-labelledby="approval-heading"
            aria-modal="true"
            className="drawer"
            ref={dialogRef}
            role="dialog"
          >
            <div className="drawerHeader">
              <div>
                <p className="eyebrow">Zusatzarbeit</p>
                <h2 id="approval-heading">Freigabe bearbeiten</h2>
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

            <div className="approvalSummary">
              <strong>{beschreibung}</strong>
              <span>
                {new Intl.NumberFormat("de-DE", {
                  style: "currency",
                  currency: "EUR",
                }).format(geschaetzterBetrag)}
              </span>
            </div>

            <ActionForm
              action={updateZusatzarbeitFreigabeFormAction}
              className="drawerForm"
            >
              <input name="auftragId" type="hidden" value={auftragId} />
              <input
                name="zusatzarbeitId"
                type="hidden"
                value={zusatzarbeitId}
              />
              <label>
                Freigabestatus
                <select
                  name="freigabeStatus"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  {freigabeStatusOptionen.map((option) => (
                    <option
                      disabled={
                        brauchtSchriftlicheFreigabe &&
                        option.value === "NICHT_ERFORDERLICH"
                      }
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              {brauchtSchriftlicheFreigabe &&
              status !== "SCHRIFTLICH_FREIGEGEBEN" ? (
                <p className="approvalWarning">
                  Diese Zusatzarbeit darf ohne schriftliche Kundenfreigabe nicht
                  ausgefuehrt werden.
                </p>
              ) : null}
              <SubmitButton pendingLabel="Freigabe wird gespeichert...">
                Freigabestatus speichern
              </SubmitButton>
            </ActionForm>
          </aside>
        </div>
      ) : null}
    </>
  );
}
