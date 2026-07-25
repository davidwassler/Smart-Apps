"use client";

import { type ReactNode } from "react";
import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  pendingLabel?: string;
};

export function SubmitButton({
  children,
  className,
  disabled = false,
  pendingLabel = "Wird gespeichert...",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      aria-busy={pending}
      aria-disabled={pending || disabled}
      className={className}
      disabled={pending || disabled}
      type="submit"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
