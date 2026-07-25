"use client";

import {
  type ReactNode,
  useActionState,
  useEffect,
  useRef,
} from "react";
import {
  type ActionState,
  initialActionState,
} from "./action-state";

type FeedbackAction = (
  state: ActionState,
  formData: FormData,
) => Promise<ActionState>;

type ActionFormProps = {
  action: FeedbackAction;
  children: ReactNode;
  className?: string;
};

export function ActionForm({
  action,
  children,
  className,
}: ActionFormProps) {
  const [state, formAction] = useActionState(action, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const submittedValuesRef = useRef<Map<string, string[]>>(new Map());

  useEffect(() => {
    if (state.status !== "idle") {
      messageRef.current?.focus();
    }

    if (state.status !== "error" || !formRef.current) {
      return;
    }

    const controls = formRef.current.elements;
    for (const control of controls) {
      if (
        !(control instanceof HTMLInputElement) &&
        !(control instanceof HTMLSelectElement) &&
        !(control instanceof HTMLTextAreaElement)
      ) {
        continue;
      }

      const values = submittedValuesRef.current.get(control.name) ?? [];
      if (control instanceof HTMLInputElement) {
        if (control.type === "checkbox" || control.type === "radio") {
          control.checked = values.includes(control.value);
        } else if (control.type !== "file") {
          control.value = values[0] ?? "";
        }
      } else if (control instanceof HTMLSelectElement && control.multiple) {
        for (const option of control.options) {
          option.selected = values.includes(option.value);
        }
      } else {
        control.value = values[0] ?? "";
      }
    }
  }, [state]);

  return (
    <form
      action={formAction}
      className={className}
      ref={formRef}
      onSubmit={() => {
        const submittedValues = new Map<string, string[]>();
        const formData = new FormData(formRef.current ?? undefined);

        for (const [name, value] of formData.entries()) {
          if (typeof value !== "string") {
            continue;
          }

          submittedValues.set(name, [
            ...(submittedValues.get(name) ?? []),
            value,
          ]);
        }

        submittedValuesRef.current = submittedValues;
      }}
    >
      {state.status !== "idle" ? (
        <div
          className={`formMessage formMessage-${state.status}`}
          ref={messageRef}
          role={state.status === "error" ? "alert" : "status"}
          tabIndex={-1}
        >
          {state.message}
        </div>
      ) : null}
      {children}
    </form>
  );
}
