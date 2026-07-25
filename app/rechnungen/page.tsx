import { RechnungStatus } from "@prisma/client";
import Link from "next/link";
import { rechnungStatusLabels } from "../labels";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type InvoiceOverviewPageProps = {
  searchParams: Promise<{
    status?: string | string[];
  }>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function InvoiceOverviewPage({
  searchParams,
}: InvoiceOverviewPageProps) {
  const params = await searchParams;
  const statusValue = firstParam(params.status);
  const status = Object.values(RechnungStatus).includes(
    statusValue as RechnungStatus,
  )
    ? (statusValue as RechnungStatus)
    : "";
  const rechnungen = await prisma.rechnung.findMany({
    include: {
      auftrag: {
        include: {
          kunde: true,
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }, { erstelltAm: "desc" }],
  });
  const sichtbareRechnungen = rechnungen.filter(
    (rechnung) => status === "" || rechnung.status === status,
  );
  const offen = rechnungen.filter(
    (rechnung) => rechnung.status === RechnungStatus.OFFEN,
  ).length;
  const mahnungen = rechnungen.filter(
    (rechnung) =>
      rechnung.status === RechnungStatus.MAHNUNG_1 ||
      rechnung.status === RechnungStatus.MAHNUNG_2,
  ).length;
  const bezahlt = rechnungen.filter(
    (rechnung) => rechnung.status === RechnungStatus.BEZAHLT,
  ).length;
  const eskaliert = rechnungen.filter(
    (rechnung) => rechnung.status === RechnungStatus.ANWALT,
  ).length;
  const returnTo = status
    ? `/rechnungen?${new URLSearchParams({ status }).toString()}`
    : "/rechnungen";

  return (
    <main className="page">
      <header className="topbar">
        <div>
          <p className="eyebrow">Kaufmaennischer Ablauf</p>
          <h1>Rechnungen</h1>
        </div>
        <div className="counters" aria-label="Rechnungskennzahlen">
          <span>{offen} offen</span>
          <span>{mahnungen} in Mahnung</span>
          <span>{bezahlt} bezahlt</span>
          <span>{eskaliert} beim Anwalt</span>
        </div>
      </header>

      <section className="filterPanel" aria-label="Rechnungen filtern">
        <form className="invoiceFilter">
          <label>
            Rechnungsstatus
            <select name="status" defaultValue={status}>
              <option value="">Alle Status</option>
              {Object.entries(rechnungStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <div className="filterActions">
            <button type="submit">Anwenden</button>
            {status ? (
              <Link className="filterReset" href="/rechnungen">
                Zuruecksetzen
              </Link>
            ) : null}
          </div>
        </form>
      </section>

      <section className="listSection" aria-labelledby="invoice-list-heading">
        <div className="sectionHeading">
          <div>
            <p className="eyebrow">Uebersicht</p>
            <h2 id="invoice-list-heading">Rechnungen</h2>
            <p>{sichtbareRechnungen.length} Eintraege</p>
          </div>
        </div>

        {sichtbareRechnungen.length === 0 ? (
          <div className="emptyState">
            <strong>Keine Rechnungen gefunden</strong>
            <p>Fuer diesen Status gibt es aktuell keine Eintraege.</p>
          </div>
        ) : (
          <div className="invoiceTable">
            <div className="invoiceTableHeader" aria-hidden="true">
              <span>Auftrag</span>
              <span>Kunde</span>
              <span>Rechnungsdatum</span>
              <span>Betrag</span>
              <span>Status</span>
              <span>Letzte Aenderung</span>
            </div>
            <div className="invoiceRows">
              {sichtbareRechnungen.map((rechnung) => (
                <Link
                  className="invoiceRow"
                  href={`/auftraege/${rechnung.auftragId}?${new URLSearchParams({
                    returnTo,
                  }).toString()}`}
                  key={rechnung.id}
                >
                  <span className="invoiceOrder" data-label="Auftrag">
                    <strong>#{rechnung.auftragId}</strong>
                    <small>{rechnung.auftrag.beschreibung}</small>
                  </span>
                  <span data-label="Kunde">{rechnung.auftrag.kunde.name}</span>
                  <span data-label="Rechnungsdatum">
                    {new Intl.DateTimeFormat("de-DE").format(
                      rechnung.erstelltAm,
                    )}
                  </span>
                  <span data-label="Betrag">
                    {new Intl.NumberFormat("de-DE", {
                      style: "currency",
                      currency: "EUR",
                    }).format(rechnung.betrag.toNumber())}
                  </span>
                  <span data-label="Status">
                    <span
                      className={`invoiceBadge invoice-${rechnung.status.toLowerCase()}`}
                    >
                      {rechnungStatusLabels[rechnung.status]}
                    </span>
                  </span>
                  <span data-label="Letzte Aenderung">
                    {new Intl.DateTimeFormat("de-DE").format(
                      rechnung.updatedAt,
                    )}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
