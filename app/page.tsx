import {
  AuftragStatus,
  EinsatzStatus,
  Kundentyp,
  Prioritaet,
} from "@prisma/client";
import Link from "next/link";
import { OrderCreatePanel } from "./order-create-panel";
import {
  auftragStatusLabels,
  kundentypLabels,
  prioritaetLabels,
} from "./labels";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

type HomeProps = {
  searchParams: Promise<SearchParams>;
};

type Sortierung = "updated" | "next" | "priority";
type Bereich = "all" | "open" | "closed";

function firstParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function getNextAssignment(
  einsaetze: Array<{ datum: Date; status: EinsatzStatus }>,
  heute: Date,
) {
  return einsaetze
    .filter(
      (einsatz) =>
        einsatz.status === EinsatzStatus.GEPLANT && einsatz.datum >= heute,
    )
    .sort((links, rechts) => links.datum.getTime() - rechts.datum.getTime())[0];
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
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
        einsaetze: {
          select: {
            datum: true,
            status: true,
          },
          orderBy: { datum: "asc" },
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

  const suchtext = firstParam(params.q).trim();
  const statusValue = firstParam(params.status);
  const prioritaetValue = firstParam(params.prioritaet);
  const mitarbeiterValue = firstParam(params.mitarbeiter);
  const bereichValue = firstParam(params.bereich);
  const sortierungValue = firstParam(params.sortierung);
  const status = Object.values(AuftragStatus).includes(
    statusValue as AuftragStatus,
  )
    ? (statusValue as AuftragStatus)
    : "";
  const prioritaet = Object.values(Prioritaet).includes(
    prioritaetValue as Prioritaet,
  )
    ? (prioritaetValue as Prioritaet)
    : "";
  const mitarbeiterId = Number(mitarbeiterValue);
  const ausgewaehlterMitarbeiter = mitarbeiter.some(
    (person) => person.id === mitarbeiterId,
  )
    ? mitarbeiterId
    : null;
  const bereich: Bereich = ["all", "open", "closed"].includes(bereichValue)
    ? (bereichValue as Bereich)
    : "all";
  const sortierung: Sortierung = ["updated", "next", "priority"].includes(
    sortierungValue,
  )
    ? (sortierungValue as Sortierung)
    : "updated";

  const aktiveMitarbeiter = mitarbeiter.filter((person) => person.aktiv);
  const abgeschlosseneStatus = new Set<AuftragStatus>([
    AuftragStatus.BEZAHLT,
    AuftragStatus.ESKALIERT,
  ]);
  const offeneAuftraege = auftraege.filter(
    (auftrag) => !abgeschlosseneStatus.has(auftrag.status),
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

  const normalisierterSuchtext = suchtext.toLocaleLowerCase("de-DE");
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);

  const gefilterteAuftraege = auftraege.filter((auftrag) => {
    const passtZurSuche =
      normalisierterSuchtext === "" ||
      String(auftrag.id).includes(normalisierterSuchtext) ||
      auftrag.kunde.name
        .toLocaleLowerCase("de-DE")
        .includes(normalisierterSuchtext) ||
      auftrag.beschreibung
        .toLocaleLowerCase("de-DE")
        .includes(normalisierterSuchtext);
    const istAbgeschlossen = abgeschlosseneStatus.has(auftrag.status);
    const passtZumBereich =
      bereich === "all" ||
      (bereich === "open" && !istAbgeschlossen) ||
      (bereich === "closed" && istAbgeschlossen);
    const passtZumStatus = status === "" || auftrag.status === status;
    const passtZurPrioritaet =
      prioritaet === "" || auftrag.prioritaet === prioritaet;
    const passtZumMitarbeiter =
      ausgewaehlterMitarbeiter === null ||
      auftrag.mitarbeiter.some(
        (entry) => entry.mitarbeiterId === ausgewaehlterMitarbeiter,
      );

    return (
      passtZurSuche &&
      passtZumBereich &&
      passtZumStatus &&
      passtZurPrioritaet &&
      passtZumMitarbeiter
    );
  });

  const prioritaetsRang: Record<Prioritaet, number> = {
    NOTDIENST: 0,
    DRINGEND: 1,
    NORMAL: 2,
  };
  const sichtbareAuftraege = [...gefilterteAuftraege].sort((links, rechts) => {
    if (sortierung === "priority") {
      const rangDifferenz =
        prioritaetsRang[links.prioritaet] - prioritaetsRang[rechts.prioritaet];
      return rangDifferenz !== 0
        ? rangDifferenz
        : rechts.updatedAt.getTime() - links.updatedAt.getTime();
    }

    if (sortierung === "next") {
      const linksDatum =
        getNextAssignment(links.einsaetze, heute)?.datum.getTime() ??
        Number.POSITIVE_INFINITY;
      const rechtsDatum =
        getNextAssignment(rechts.einsaetze, heute)?.datum.getTime() ??
        Number.POSITIVE_INFINITY;
      return linksDatum !== rechtsDatum
        ? linksDatum - rechtsDatum
        : rechts.updatedAt.getTime() - links.updatedAt.getTime();
    }

    return rechts.updatedAt.getTime() - links.updatedAt.getTime();
  });

  const aktiveParameter = new URLSearchParams();
  if (suchtext) aktiveParameter.set("q", suchtext);
  if (bereich !== "all") aktiveParameter.set("bereich", bereich);
  if (status) aktiveParameter.set("status", status);
  if (prioritaet) aktiveParameter.set("prioritaet", prioritaet);
  if (ausgewaehlterMitarbeiter) {
    aktiveParameter.set("mitarbeiter", String(ausgewaehlterMitarbeiter));
  }
  if (sortierung !== "updated") {
    aktiveParameter.set("sortierung", sortierung);
  }
  const queryString = aktiveParameter.toString();
  const returnTo = queryString ? `/?${queryString}` : "/";
  const hatAktiveAuswahl = queryString !== "";

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
            <h2 id="orders-heading">Auftraege</h2>
            <p>
              {sichtbareAuftraege.length} von {auftraege.length} sichtbar
            </p>
          </div>
        </div>

        <form className="filterBar" method="get">
          <div className="filterFields">
            <label className="searchField">
              Suche
              <input
                name="q"
                defaultValue={suchtext}
                placeholder="Nummer, Kunde oder Beschreibung"
                type="search"
              />
            </label>
            <label>
              Bereich
              <select name="bereich" defaultValue={bereich}>
                <option value="all">Alle</option>
                <option value="open">Offen</option>
                <option value="closed">Abgeschlossen</option>
              </select>
            </label>
            <label>
              Status
              <select name="status" defaultValue={status}>
                <option value="">Alle Status</option>
                {Object.entries(auftragStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Prioritaet
              <select name="prioritaet" defaultValue={prioritaet}>
                <option value="">Alle Prioritaeten</option>
                {Object.entries(prioritaetLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Mitarbeiter
              <select
                name="mitarbeiter"
                defaultValue={ausgewaehlterMitarbeiter ?? ""}
              >
                <option value="">Alle Mitarbeiter</option>
                {mitarbeiter.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                    {!person.aktiv ? " (inaktiv)" : ""}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Sortierung
              <select name="sortierung" defaultValue={sortierung}>
                <option value="updated">Zuletzt geaendert</option>
                <option value="next">Naechster Einsatz</option>
                <option value="priority">Prioritaet</option>
              </select>
            </label>
          </div>
          <div className="filterActions">
            {hatAktiveAuswahl ? (
              <Link className="filterReset" href="/">
                Zuruecksetzen
              </Link>
            ) : null}
            <button type="submit">Anwenden</button>
          </div>
        </form>

        {auftraege.length === 0 ? (
          <div className="emptyState">
            <strong>Noch keine Auftraege erfasst.</strong>
            <p>Lege den ersten Auftrag ueber den Button oben rechts an.</p>
          </div>
        ) : sichtbareAuftraege.length === 0 ? (
          <div className="emptyState">
            <strong>Keine passenden Auftraege gefunden.</strong>
            <p>Aendere die Suche oder setze die Filter zurueck.</p>
          </div>
        ) : (
          <div className="orderTable">
            <div className="orderTableHeader" aria-hidden="true">
              <span>Auftrag</span>
              <span>Kunde</span>
              <span>Status</span>
              <span>Prioritaet</span>
              <span>Team</span>
              <span>Naechster Einsatz</span>
            </div>
            <div className="orderRows">
              {sichtbareAuftraege.map((auftrag) => {
                const kundenDatenUnvollstaendig =
                  auftrag.kunde.telefonnummer.trim() === "" ||
                  auftrag.kunde.adresse.trim() === "";
                const naechsterEinsatz = getNextAssignment(
                  auftrag.einsaetze,
                  heute,
                );
                const detailParams = new URLSearchParams({ returnTo });

                return (
                  <Link
                    className={`orderRow ${
                      auftrag.prioritaet === Prioritaet.NOTDIENST
                        ? "orderRowNotdienst"
                        : ""
                    }`}
                    href={`/auftraege/${auftrag.id}?${detailParams.toString()}`}
                    key={auftrag.id}
                  >
                    <span className="orderDescription">
                      <strong>#{auftrag.id}</strong>
                      <span>{auftrag.beschreibung}</span>
                      <small>
                        {auftrag._count.einsaetze} Einsaetze,{" "}
                        {auftrag._count.materialverbraeuche} Verbraeuche
                      </small>
                    </span>
                    <span data-label="Kunde">
                      {auftrag.kunde.name}
                      {kundenDatenUnvollstaendig ? (
                        <small className="warningText">Daten ergaenzen</small>
                      ) : null}
                    </span>
                    <span data-label="Status">
                      <span
                        className={`statusBadge status-${auftrag.status.toLowerCase()}`}
                      >
                        {auftragStatusLabels[auftrag.status]}
                      </span>
                    </span>
                    <span data-label="Prioritaet">
                      <span
                        className={`priorityBadge priority-${auftrag.prioritaet.toLowerCase()}`}
                      >
                        {prioritaetLabels[auftrag.prioritaet]}
                      </span>
                    </span>
                    <span data-label="Team">
                      {auftrag.mitarbeiter.length === 0
                        ? "Nicht zugeordnet"
                        : auftrag.mitarbeiter
                            .map((entry) => entry.mitarbeiter.name)
                            .join(", ")}
                    </span>
                    <span data-label="Naechster Einsatz">
                      {naechsterEinsatz
                        ? new Intl.DateTimeFormat("de-DE").format(
                            naechsterEinsatz.datum,
                          )
                        : "Nicht geplant"}
                      <small>
                        Aktualisiert{" "}
                        {new Intl.DateTimeFormat("de-DE").format(
                          auftrag.updatedAt,
                        )}
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
