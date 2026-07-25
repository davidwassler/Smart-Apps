"use client";

import { useEffect, useRef } from "react";

const focusableFormControl =
  'form input:not([type="hidden"]):not([disabled]), form select:not([disabled]), form textarea:not([disabled]), form button:not([disabled])';

export function useDialogFocus(isOpen: boolean) {
  const dialogRef = useRef<HTMLElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    openerRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const frame = window.requestAnimationFrame(() => {
      dialogRef.current
        ?.querySelector<HTMLElement>(focusableFormControl)
        ?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      openerRef.current?.focus();
    };
  }, [isOpen]);

  return dialogRef;
}
