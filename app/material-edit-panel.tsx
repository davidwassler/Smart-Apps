"use client";

import { useState } from "react";
import { updateMaterialFormAction } from "./form-actions";
import { MasterDataEditDrawer } from "./master-data-edit-drawer";

type MaterialEditPanelProps = {
  material: {
    id: number;
    name: string;
    einheit: string;
    lagerbestand: string;
    lagerort: string;
  };
};

export function MaterialEditPanel({ material }: MaterialEditPanelProps) {
  const initialEinheitTyp =
    material.einheit === "Stueck" ? "Stueck" : "Laenge";
  const [einheitTyp, setEinheitTyp] = useState(initialEinheitTyp);
  const isStueck = einheitTyp === "Stueck";

  return (
    <MasterDataEditDrawer
      action={updateMaterialFormAction}
      eyebrow="Materialstammdaten"
      heading="Material bearbeiten"
      pendingLabel="Materialdaten werden gespeichert..."
      submitLabel="Materialdaten speichern"
      triggerLabel={`${material.name} bearbeiten`}
      summary={
        <>
          <strong>{material.name}</strong>
          <span>
            {material.lagerbestand} {material.einheit}
          </span>
          <span>{material.lagerort}</span>
        </>
      }
    >
      <input name="materialId" type="hidden" value={material.id} />
      <label>
        Name
        <input name="name" defaultValue={material.name} required />
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
          <select name="laengenEinheit" defaultValue={material.einheit}>
            <option value="mm">mm</option>
            <option value="cm">cm</option>
            <option value="m">m</option>
          </select>
        </label>
      ) : null}
      <label>
        Lagerbestand
        <input
          key={isStueck ? "whole" : "decimal"}
          defaultValue={material.lagerbestand}
          min="0"
          name="lagerbestand"
          required
          step={isStueck ? "1" : "0.01"}
          type="number"
        />
      </label>
      <label>
        Lagerort
        <input name="lagerort" defaultValue={material.lagerort} required />
      </label>
    </MasterDataEditDrawer>
  );
}
