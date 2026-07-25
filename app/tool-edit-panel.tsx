"use client";

import { updateWerkzeugFormAction } from "./form-actions";
import { MasterDataEditDrawer } from "./master-data-edit-drawer";

type Option = {
  value: string;
  label: string;
};

type ToolEditPanelProps = {
  werkzeug: {
    id: number;
    name: string;
    status: string;
    aktuellerOrt: string;
    aktuellerBesitzerId: number | null;
  };
  statusLabel: string;
  statusOptionen: Option[];
  mitarbeiter: Array<{ id: number; name: string }>;
  besitzerName: string;
};

export function ToolEditPanel({
  werkzeug,
  statusLabel,
  statusOptionen,
  mitarbeiter,
  besitzerName,
}: ToolEditPanelProps) {
  return (
    <MasterDataEditDrawer
      action={updateWerkzeugFormAction}
      eyebrow="Werkzeugstammdaten"
      heading="Werkzeug bearbeiten"
      pendingLabel="Werkzeugdaten werden gespeichert..."
      submitLabel="Werkzeugdaten speichern"
      triggerLabel={`${werkzeug.name} bearbeiten`}
      summary={
        <>
          <strong>{werkzeug.name}</strong>
          <span>{statusLabel}</span>
          <span>{werkzeug.aktuellerOrt}</span>
          <span>{besitzerName}</span>
        </>
      }
    >
      <input name="werkzeugId" type="hidden" value={werkzeug.id} />
      <label>
        Name
        <input name="name" defaultValue={werkzeug.name} required />
      </label>
      <label>
        Status
        <select name="status" defaultValue={werkzeug.status}>
          {statusOptionen.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Aktueller Ort
        <input
          name="aktuellerOrt"
          defaultValue={werkzeug.aktuellerOrt}
          required
        />
      </label>
      <label>
        Aktueller Besitzer
        <select
          name="aktuellerBesitzerId"
          defaultValue={werkzeug.aktuellerBesitzerId ?? ""}
        >
          <option value="">Kein Besitzer</option>
          {mitarbeiter.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
      </label>
    </MasterDataEditDrawer>
  );
}
