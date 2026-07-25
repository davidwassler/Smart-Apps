"use client";

import { useState } from "react";
import { createMaterial } from "./actions";

export function MaterialForm() {
  const [einheitTyp, setEinheitTyp] = useState("Stueck");
  const isStueck = einheitTyp === "Stueck";

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
          name="einheitTyp"
          value={einheitTyp}
          onChange={(event) => setEinheitTyp(event.target.value)}
        >
          <option value="Stueck">Stueck</option>
          <option value="Laenge">Laenge</option>
        </select>
      </label>
      {!isStueck ? (
        <label>
          Laengeneinheit
          <select name="laengenEinheit" defaultValue="m">
            <option value="mm">mm</option>
            <option value="cm">cm</option>
            <option value="m">m</option>
          </select>
        </label>
      ) : null}
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
