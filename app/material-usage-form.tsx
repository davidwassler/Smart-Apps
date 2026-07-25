"use client";

import { useState } from "react";
import { createMaterialverbrauch } from "./actions";

type MaterialOption = {
  id: number;
  name: string;
  einheit: string;
  lagerbestand: string;
};

type MaterialUsageFormProps = {
  auftragId: number;
  materialien: MaterialOption[];
  mitarbeiter: Array<{ id: number; name: string }>;
};

export function MaterialUsageForm({
  auftragId,
  materialien,
  mitarbeiter,
}: MaterialUsageFormProps) {
  const [materialId, setMaterialId] = useState("");
  const selectedMaterial = materialien.find(
    (material) => material.id === Number(materialId),
  );
  const usesWholeNumbers = selectedMaterial?.einheit === "Stueck";

  return (
    <form action={createMaterialverbrauch}>
      <input name="auftragId" type="hidden" value={auftragId} />
      <label>
        Material
        <select
          name="materialId"
          required
          value={materialId}
          onChange={(event) => setMaterialId(event.target.value)}
        >
          <option value="" disabled>
            Material auswaehlen
          </option>
          {materialien.map((material) => (
            <option key={material.id} value={material.id}>
              {material.name} ({material.lagerbestand} {material.einheit})
            </option>
          ))}
        </select>
      </label>
      <div className="fieldRow">
        <label>
          Menge
          <input
            key={usesWholeNumbers ? "whole" : "decimal"}
            name="menge"
            type="number"
            step={usesWholeNumbers ? "1" : "0.01"}
            min={usesWholeNumbers ? "1" : "0.01"}
            required
          />
        </label>
        <label>
          Erfasst von
          <select name="erfasstVonId" required defaultValue="">
            <option value="" disabled>
              Mitarbeiter auswaehlen
            </option>
            {mitarbeiter.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button
        type="submit"
        disabled={materialien.length === 0 || mitarbeiter.length === 0}
      >
        Verbrauch speichern
      </button>
    </form>
  );
}
