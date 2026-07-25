import { AuftragStatus, Kundentyp, Prioritaet } from "@prisma/client";
import Link from "next/link";
import { OrderCreatePanel } from "./order-create-panel";
import {
  auftragStatusLabels,
  kundentypLabels,
  prioritaetLabels,
} from "./labels";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [kunden, mitarbeiter, auftraege] = await Promise.all([
    prisma.kunde.findMany({ orderBy: { name: "asc" } }),
    prisma.mitarbeiter.findMany({ orderBy: [{ aktiv: "desc" }, { name: "asc" }] }),
    prisma.auftrag.findMany({
      include: {
        kunde: true,
        mitarbeiter: {
          include: {
            mitarbeiter: true,
          },
        },
        _count: {
          select: {
            einsaetze: true,
            materialverbraeuche: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const aktiveMitarbeiter = mitarbeiter.filter((person) => person.aktiv);
  const offeneAuftraege = auftraege.filter(
    (auftrag) =>
      auftrag.status !== AuftragStatus.BEZAHLT &&
      auftrag.status !== AuftragStatus.ESKALIERT,
  );
  const geplanteAuftraege = auftraege.filter(
    (auftrag) => auftrag.status === AuftragStatus.GEPLANT,
  );
  const auftraegeInArbeit = auftraege.filter(
    (auftrag) => auftrag.status === AuftragStatus.IN_BEARBEITUNG,
  );
  const wartendeStatus = new Set<AuftragStatus>([
    AuftragStatus.PAUSIERT,
    AuftragStatus.WARTET_AUF_MATERIAL,
    AuftragStatus.WARTET_AUF_KUNDENENTSCHEIDUNG,
  ]);
  const wartendeAuftraege = auftraege.filter((auftrag) =>
    wartendeStatus.has(auftrag.status),
  );

  return (
    <main className="page">
      <header className="topbar">
        <div>
          <p className="eyebrow">Brandt & Soehne Elektro</p>
          <h1>Auftragsuebersicht</h1>
          <p className="pageIntro">
            Alle Auftraege und ihr aktueller Arbeitsstand auf einen Blick.
          </p>
        </div>
        <OrderCreatePanel
          kunden={kunden.map((kunde) => ({ id: kunde.id, name: kunde.name }))}
          kundentypen={Object.entries(kundentypLabels).map(([value, label]) => ({
            value,
            label,
          }))}
          defaultKundentyp={Kundentyp.PRIVATKUNDE}
          mitarbeiter={aktiveMitarbeiter.map((person) => ({
            id: person.id,
            name: person.name,
          }))}
          prioritaeten={Object.entries(prioritaetLabels).map(([value, label]) => ({
            value,
            label,
          }))}
          defaultPrioritaet={Prioritaet.NORMAL}
        />
      </header>

      <section className="kpiGrid" aria-label="Kurze Statusuebersicht">
        <div className="kpi">
          <span>Offene Auftraege</span>
          <strong>{offeneAuftraege.length}</strong>
        </div>
        <div className="kpi">
          <span>Geplant</span>
          <strong>{geplanteAuftraege.length}</strong>
        </div>
        <div className="kpi">
          <span>In Bearbeitung</span>
          <strong>{auftraegeInArbeit.length}</strong>
        </div>
        <div className="kpi">
          <span>Wartend</span>
          <strong>{wartendeAuftraege.length}</strong>
        </div>
      </section>

      <section className="ordersSection" aria-labelledby="orders-heading">
        <div className="sectionHeading">
          <div>
            <h2 id="orders-heading">Alle Auftraege</h2>
            <p>{auftraege.length} Auftraege insgesamt</p>
          </div>
        </div>

        {auftraege.length === 0 ? (
          <div className="emptyState">
            <strong>Noch keine Auftraege erfasst.</strong>
            <p>Lege den ersten Auftrag ueber den Button oben rechts an.</p>
          </div>
        ) : (
          <div className="orderTable">
            <div className="orderTableHeader" aria-hidden="true">
              <span>Auftrag</span>
              <span>Kunde</span>
              <span>Status</span>
              <span>Prioritaet</span>
              <span>Team</span>
              <span>Aktualisiert</span>
            </div>
            <div className="orderRows">
              {auftraege.map((auftrag) => {
                const kundenDatenUnvollstaendig =
                  auftrag.kunde.telefonnummer.trim() === "" ||
                  auftrag.kunde.adresse.trim() === "";

                return (
                  <Link
                    className="orderRow"
                    href={`/auftraege/${auftrag.id}`}
                    key={auftrag.id}
                  >
                    <span className="orderDescription">
                      <strong>#{auftrag.id}</strong>
                      <span>{auftrag.beschreibung}</span>
                    </span>
                    <span data-label="Kunde">
                      {auftrag.kunde.name}
                      {kundenDatenUnvollstaendig ? (
                        <small className="warningText">Daten ergaenzen</small>
                      ) : null}
                    </span>
                    <span data-label="Status">
                      <span className={`statusBadge status-${auftrag.status.toLowerCase()}`}>
                        {auftragStatusLabels[auftrag.status]}
                      </span>
                    </span>
                    <span data-label="Prioritaet">
                      {prioritaetLabels[auftrag.prioritaet]}
                    </span>
                    <span data-label="Team">
                      {auftrag.mitarbeiter.length === 0
                        ? "Nicht zugeordnet"
                        : auftrag.mitarbeiter
                            .map((entry) => entry.mitarbeiter.name)
                            .join(", ")}
                    </span>
                    <span data-label="Aktualisiert">
                      {new Intl.DateTimeFormat("de-DE").format(auftrag.updatedAt)}
                      <small>
                        {auftrag._count.einsaetze} Einsaetze,{" "}
                        {auftrag._count.materialverbraeuche} Verbraeuche
                      </small>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
