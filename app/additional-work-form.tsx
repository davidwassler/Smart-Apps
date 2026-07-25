"use client";

import { useState } from "react";
import { createZusatzarbeit } from "./actions";

type Option = {
  value: string;
  label: string;
};

type AdditionalWorkFormProps = {
  auftragId: number;
  freigabeStatusOptionen: Option[];
};

export function AdditionalWorkForm({
  auftragId,
  freigabeStatusOptionen,
}: AdditionalWorkFormProps) {
  const [betrag, setBetrag] = useState("");
  const [freigabeStatus, setFreigabeStatus] = useState("NICHT_ERFORDERLICH");
  const brauchtSchriftlicheFreigabe = Number(betrag) >= 1500;
  const istSchriftlichFreigegeben =
    freigabeStatus === "SCHRIFTLICH_FREIGEGEBEN";

  function updateBetrag(value: string) {
    setBetrag(value);
    if (Number(value) >= 1500 && freigabeStatus === "NICHT_ERFORDERLICH") {
      setFreigabeStatus("ANGEFRAGT");
    }
  }

  return (
    <form action={createZusatzarbeit} className="drawerForm">
      <input name="auftragId" type="hidden" value={auftragId} />
      <label>
        Beschreibung
        <textarea
          name="beschreibung"
          placeholder="Welche zusaetzliche Arbeit ist erforderlich?"
          required
          rows={5}
        />
      </label>
      <label>
        Geschaetzter Betrag in Euro
        <input
          name="geschaetzterBetrag"
          type="number"
          min="0.01"
          step="0.01"
          required
          value={betrag}
          onChange={(event) => updateBetrag(event.target.value)}
        />
      </label>
      <label>
        Freigabestatus
        <select
          name="freigabeStatus"
          value={freigabeStatus}
          onChange={(event) => setFreigabeStatus(event.target.value)}
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
      {brauchtSchriftlicheFreigabe && !istSchriftlichFreigegeben ? (
        <p className="approvalWarning">
          Vor der Ausfuehrung ist ein schriftliches, unterschriebenes Angebot
          erforderlich.
        </p>
      ) : null}
      <button type="submit">Zusatzarbeit speichern</button>
    </form>
  );
}
