"use client";

import { useEffect, useState } from "react";
import { verschiebeEinsatz } from "./actions";

type AssignmentReschedulePanelProps = {
  einsatzId: number;
  einsatzDatum: string;
  istNotdienst: boolean;
};

export function AssignmentReschedulePanel({
  einsatzId,
  einsatzDatum,
  istNotdienst,
}: AssignmentReschedulePanelProps) {
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
      <button
        className="secondaryButton timelineAction"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        Einsatz verschieben
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
            aria-labelledby={`reschedule-heading-${einsatzId}`}
            aria-modal="true"
            className="drawer"
            role="dialog"
          >
            <div className="drawerHeader">
              <div>
                <p className="eyebrow">Bisheriger Termin: {einsatzDatum}</p>
                <h2 id={`reschedule-heading-${einsatzId}`}>
                  Einsatz verschieben
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

            <form action={verschiebeEinsatz} className="drawerForm">
              <input name="einsatzId" type="hidden" value={einsatzId} />
              {istNotdienst ? (
                <div className="emergencyNotice">
                  <strong>Notdienst hat Vorrang</strong>
                  <p>
                    Der Termin darf nur verschoben werden, wenn die
                    Ersatzbesetzung oder sofortige Neuplanung geklaert ist.
                  </p>
                </div>
              ) : null}
              <label>
                Neues Einsatzdatum
                <input name="neuesDatum" type="date" required />
              </label>
              <label>
                Begruendung
                <textarea
                  name="begruendung"
                  placeholder="Warum muss der Einsatz verschoben werden?"
                  required
                  rows={4}
                />
              </label>
              {istNotdienst ? (
                <label className="checkline emergencyConfirmation">
                  <input
                    name="notdienstBestaetigt"
                    required
                    type="checkbox"
                  />
                  Ersatzbesetzung oder sofortige Neuplanung ist verbindlich
                  geklaert.
                </label>
              ) : null}
              <button type="submit">Verschiebung speichern</button>
            </form>
          </aside>
        </div>
      ) : null}
    </>
  );
}
