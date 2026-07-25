"use client";

import { updateMitarbeiterFormAction } from "./form-actions";
import { MasterDataEditDrawer } from "./master-data-edit-drawer";

type Option = {
  value: string;
  label: string;
};

type EmployeeEditPanelProps = {
  mitarbeiter: {
    id: number;
    name: string;
    rolle: string;
    telefonnummer: string;
    aktiv: boolean;
  };
  rolleOptionen: Option[];
  rolleLabel: string;
};

export function EmployeeEditPanel({
  mitarbeiter,
  rolleOptionen,
  rolleLabel,
}: EmployeeEditPanelProps) {
  return (
    <MasterDataEditDrawer
      action={updateMitarbeiterFormAction}
      eyebrow="Mitarbeiterstammdaten"
      heading="Mitarbeiter bearbeiten"
      pendingLabel="Mitarbeiterdaten werden gespeichert..."
      submitLabel="Mitarbeiterdaten speichern"
      triggerLabel={`${mitarbeiter.name} bearbeiten`}
      summary={
        <>
          <strong>{mitarbeiter.name}</strong>
          <span>{rolleLabel}</span>
          <span>{mitarbeiter.telefonnummer}</span>
          <span>{mitarbeiter.aktiv ? "aktiv" : "inaktiv"}</span>
        </>
      }
    >
      <input name="mitarbeiterId" type="hidden" value={mitarbeiter.id} />
      <label>
        Name
        <input name="name" defaultValue={mitarbeiter.name} required />
      </label>
      <label>
        Rolle
        <select name="rolle" defaultValue={mitarbeiter.rolle}>
          {rolleOptionen.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Telefonnummer
        <input
          name="telefonnummer"
          defaultValue={mitarbeiter.telefonnummer}
          required
        />
      </label>
      <label className="checkline">
        <input name="aktiv" type="checkbox" defaultChecked={mitarbeiter.aktiv} />
        Aktiv verfuegbar
      </label>
    </MasterDataEditDrawer>
  );
}
