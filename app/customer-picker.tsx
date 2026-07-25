"use client";

import { useState } from "react";

type CustomerOption = {
  id: number;
  name: string;
};

type LabelOption = {
  value: string;
  label: string;
};

type CustomerPickerProps = {
  kunden: CustomerOption[];
  kundentypen: LabelOption[];
  defaultKundentyp: string;
};

const newCustomerValue = "__new";

export function CustomerPicker({
  kunden,
  kundentypen,
  defaultKundentyp,
}: CustomerPickerProps) {
  const initialValue = kunden.length === 0 ? newCustomerValue : "";
  const [kundeId, setKundeId] = useState(initialValue);
  const isNewCustomer = kundeId === newCustomerValue;

  return (
    <fieldset className="formSection">
      <legend>Kunde</legend>
      <label>
        Auswahl
        <select
          name="kundeId"
          required
          value={kundeId}
          onChange={(event) => setKundeId(event.target.value)}
        >
          {kunden.length > 0 ? (
            <option value="" disabled>
              Kunde auswaehlen
            </option>
          ) : null}
          <option value={newCustomerValue}>Neuen Kunden anlegen</option>
          {kunden.map((kunde) => (
            <option key={kunde.id} value={kunde.id}>
              {kunde.name}
            </option>
          ))}
        </select>
      </label>

      {isNewCustomer ? (
        <div className="quickCustomer">
          <p className="helpText">
            Diese Kundendaten werden direkt mit dem Auftrag gespeichert.
          </p>
          <div className="fieldRow">
            <label>
              Neuer Kunde
              <input name="neuerKundeName" placeholder="Name oder Firma" required />
            </label>
            <label>
              Telefonnummer
              <input
                name="neuerKundeTelefonnummer"
                placeholder="Rueckrufnummer"
                required
              />
            </label>
          </div>
          <div className="fieldRow">
            <label>
              Strasse + Nr.
              <input
                name="neuerKundeStrasse"
                placeholder="Kann spaeter ergaenzt werden"
              />
            </label>
            <label>
              PLZ
              <input
                inputMode="numeric"
                maxLength={5}
                minLength={5}
                name="neuerKundePlz"
                pattern="[0-9]{5}"
                placeholder="Kann spaeter ergaenzt werden"
              />
            </label>
          </div>
          <div className="fieldRow">
            <label>
              Ort
              <input
                name="neuerKundeOrt"
                placeholder="Kann spaeter ergaenzt werden"
              />
            </label>
            <label>
              Kundentyp
              <select
                name="neuerKundeKundentyp"
                defaultValue={defaultKundentyp}
              >
                {kundentypen.map((kundentyp) => (
                  <option key={kundentyp.value} value={kundentyp.value}>
                    {kundentyp.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      ) : null}
    </fieldset>
  );
}
