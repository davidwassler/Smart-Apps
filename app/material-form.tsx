"use client";

import { useState } from "react";
import { createMaterial } from "./actions";

export function MaterialForm() {
  const [einheit, setEinheit] = useState("Stueck");
  const isStueck = einheit === "Stueck";

  return (
    <form action={createMaterial} className="panel">
      <h2>Material erfassen</h2>
      <label>
        Name
        <input name="name" required />
      </label>
      <label>
        Einheit
        <select
          name="einheit"
          value={einheit}
          onChange={(event) => setEinheit(event.target.value)}
        >
          <option value="Stueck">Stueck</option>
          <option value="Laenge">Laenge</option>
        </select>
      </label>
      <label>
        Lagerbestand
        <input
          name="lagerbestand"
          type="number"
          step={isStueck ? "1" : "0.01"}
          min="0"
          defaultValue="0"
          required
        />
      </label>
      <label>
        Lagerort
        <input name="lagerort" required />
      </label>
      <button type="submit">Material speichern</button>
    </form>
  );
}
