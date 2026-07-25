"use client";

import { updateKundeFormAction } from "./form-actions";
import { MasterDataEditDrawer } from "./master-data-edit-drawer";
import { parseAddress } from "@/lib/address";

type Option = {
  value: string;
  label: string;
};

type CustomerEditPanelProps = {
  kunde: {
    id: number;
    name: string;
    telefonnummer: string;
    adresse: string;
    kundentyp: string;
  };
  kundentypOptionen: Option[];
  kundentypLabel: string;
};

export function CustomerEditPanel({
  kunde,
  kundentypOptionen,
  kundentypLabel,
}: CustomerEditPanelProps) {
  const adresse = parseAddress(kunde.adresse);

  return (
    <MasterDataEditDrawer
      action={updateKundeFormAction}
      eyebrow="Kundenstammdaten"
      heading="Kunde bearbeiten"
      pendingLabel="Kundendaten werden gespeichert..."
      submitLabel="Kundendaten speichern"
      triggerLabel={`${kunde.name} bearbeiten`}
      summary={
        <>
          <strong>{kunde.name}</strong>
          <span>{kundentypLabel}</span>
          <span>{kunde.telefonnummer}</span>
          <span>{kunde.adresse || "Adresse fehlt"}</span>
        </>
      }
    >
      <input name="kundeId" type="hidden" value={kunde.id} />
      <label>
        Name
        <input name="name" defaultValue={kunde.name} required />
      </label>
      <label>
        Telefonnummer
        <input
          name="telefonnummer"
          defaultValue={kunde.telefonnummer}
          required
        />
      </label>
      <label>
        Strasse + Nr.
        <input name="strasse" defaultValue={adresse.strasse} required />
      </label>
      <div className="fieldRow">
        <label>
          PLZ
          <input
            autoComplete="postal-code"
            defaultValue={adresse.plz}
            inputMode="numeric"
            maxLength={5}
            minLength={5}
            name="plz"
            pattern="[0-9]{5}"
            required
          />
        </label>
        <label>
          Ort
          <input
            autoComplete="address-level2"
            defaultValue={adresse.ort}
            name="ort"
            required
          />
        </label>
      </div>
      <label>
        Kundentyp
        <select name="kundentyp" defaultValue={kunde.kundentyp}>
          {kundentypOptionen.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </MasterDataEditDrawer>
  );
}
