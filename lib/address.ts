export type CustomerAddress = {
  strasse: string;
  plz: string;
  ort: string;
};

export function formatAddress({ strasse, plz, ort }: CustomerAddress) {
  return `${strasse}, ${plz} ${ort}`.trim();
}

export function parseAddress(adresse: string): CustomerAddress {
  const [strasse = "", ortsteil = ""] = adresse
    .split(",", 2)
    .map((value) => value.trim());
  const match = ortsteil.match(/^(\d{5})\s+(.+)$/);

  return {
    strasse,
    plz: match?.[1] ?? "",
    ort: match?.[2] ?? ortsteil,
  };
}
