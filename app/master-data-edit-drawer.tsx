"use client";

import { type ReactNode, useEffect, useId, useState } from "react";
import { ActionForm } from "./action-form";
import type { ActionState } from "./action-state";
import { SubmitButton } from "./submit-button";
import { useDialogFocus } from "./use-dialog-focus";

type MasterDataEditDrawerProps = {
  action: (
    state: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
  children: ReactNode;
  eyebrow: string;
  heading: string;
  pendingLabel: string;
  submitLabel: string;
  summary: ReactNode;
  triggerLabel: string;
};

export function MasterDataEditDrawer({
  action,
  children,
  eyebrow,
  heading,
  pendingLabel,
  submitLabel,
  summary,
  triggerLabel,
}: MasterDataEditDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const headingId = useId();
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
        aria-label={triggerLabel}
        className="recordEditButton"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        <span className="recordEditSummary">{summary}</span>
        <span className="recordEditHint">Bearbeiten</span>
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
            aria-labelledby={headingId}
            aria-modal="true"
            className="drawer"
            ref={dialogRef}
            role="dialog"
          >
            <div className="drawerHeader">
              <div>
                <p className="eyebrow">{eyebrow}</p>
                <h2 id={headingId}>{heading}</h2>
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

            <ActionForm action={action} className="drawerForm">
              {children}
              <div className="drawerFooter">
                <button
                  className="secondaryButton"
                  type="button"
                  onClick={() => setIsOpen(false)}
                >
                  Abbrechen
                </button>
                <SubmitButton pendingLabel={pendingLabel}>
                  {submitLabel}
                </SubmitButton>
              </div>
            </ActionForm>
          </aside>
        </div>
      ) : null}
    </>
  );
}
