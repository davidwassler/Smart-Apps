import { AuftragStatus, EinsatzStatus, Prioritaet } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  auftragStatusLabels,
  einsatzStatusLabels,
  freigabeStatusLabels,
  kundentypLabels,
  nichtFertigGrundLabels,
  prioritaetLabels,
  rechnungStatusLabels,
  rollenLabels,
  rueckmeldeStatus,
} from "../../labels";
import { AdditionalWorkApprovalPanel } from "../../additional-work-approval-panel";
import { AssignmentFeedbackPanel } from "../../assignment-feedback-panel";
import { AssignmentReschedulePanel } from "../../assignment-reschedule-panel";
import { InvoicePreparationPanel } from "../../invoice-preparation-panel";
import { OrderActionPanels } from "../../order-action-panels";
import { OrderEditPanel } from "../../order-edit-panel";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string | string[] }>;
};

export default async function OrderDetailPage({
  params,
  searchParams,
}: OrderDetailPageProps) {
  const [{ id }, detailParams] = await Promise.all([params, searchParams]);
  const auftragId = Number(id);
  const returnToValue =
    typeof detailParams.returnTo === "string" ? detailParams.returnTo : "/";
  const returnTo =
    returnToValue === "/" || returnToValue.startsWith("/?")
      ? returnToValue
      : "/";

  if (!Number.isInteger(auftragId) || auftragId <= 0) {
    notFound();
  }

  const [auftrag, mitarbeiter, materialien] = await Promise.all([
    prisma.auftrag.findUnique({
      where: { id: auftragId },
      include: {
        kunde: true,
        mitarbeiter: {
          include: {
            mitarbeiter: true,
          },
        },
        einsaetze: {
          include: {
            mitarbeiter: {
              include: {
                mitarbeiter: true,
              },
            },
            verschiebungen: {
              orderBy: {
                createdAt: "desc",
              },
            },
          },
          orderBy: [{ datum: "desc" }, { updatedAt: "desc" }],
        },
        materialverbraeuche: {
          include: {
            material: true,
            erfasstVon: true,
          },
          orderBy: { createdAt: "desc" },
        },
        zusatzarbeiten: {
          orderBy: { createdAt: "desc" },
        },
        rechnung: true,
      },
    }),
    prisma.mitarbeiter.findMany({
      orderBy: [{ aktiv: "desc" }, { name: "asc" }],
    }),
    prisma.material.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!auftrag) {
    notFound();
  }

  const istOperativGesperrt =
    auftrag.status === AuftragStatus.RECHNUNG_ERSTELLT ||
    auftrag.status === AuftragStatus.BEZAHLT ||
    auftrag.status === AuftragStatus.GEMAHNT ||
    auftrag.status === AuftragStatus.ESKALIERT;
  const kundenDatenUnvollstaendig =
    auftrag.kunde.telefonnummer.trim() === "" ||
    auftrag.kunde.adresse.trim() === "";
  const aktiveMitarbeiter = mitarbeiter.filter((person) => person.aktiv);
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  const naechsterEinsatz = auftrag.einsaetze
    .filter(
      (einsatz) =>
        einsatz.status === EinsatzStatus.GEPLANT && einsatz.datum >= heute,
    )
    .sort((links, rechts) => links.datum.getTime() - rechts.datum.getTime())[0];
  const letzteRueckmeldung = auftrag.einsaetze
    .filter((einsatz) => einsatz.rueckmeldung)
    .sort(
      (links, rechts) => rechts.updatedAt.getTime() - links.updatedAt.getTime(),
    )[0];
  const nichtFreigegebeneZusatzarbeiten = auftrag.zusatzarbeiten.filter(
    (zusatzarbeit) =>
      zusatzarbeit.geschaetzterBetrag.toNumber() >= 1500 &&
      zusatzarbeit.freigabeStatus !== "SCHRIFTLICH_FREIGEGEBEN",
  );
  const heuteAlsEingabewert = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const kannRechnungVorbereiten =
    auftrag.status === AuftragStatus.TECHNISCH_FERTIG &&
    !auftrag.rechnung &&
    nichtFreigegebeneZusatzarbeiten.length === 0;
  const verlaufEintraege = [
    ...auftrag.einsaetze.map((einsatz) => ({
      typ: "einsatz" as const,
      id: `einsatz-${einsatz.id}`,
      zeitpunkt: einsatz.datum,
      einsatz,
    })),
    ...auftrag.einsaetze.flatMap((einsatz) =>
      einsatz.verschiebungen.map((verschiebung) => ({
        typ: "verschiebung" as const,
        id: `verschiebung-${verschiebung.id}`,
        zeitpunkt: verschiebung.createdAt,
        einsatz,
        verschiebung,
      })),
    ),
    ...auftrag.zusatzarbeiten.map((zusatzarbeit) => ({
      typ: "zusatzarbeit" as const,
      id: `zusatzarbeit-${zusatzarbeit.id}`,
      zeitpunkt: zusatzarbeit.createdAt,
      zusatzarbeit,
    })),
    ...(auftrag.rechnung
      ? [
          {
            typ: "rechnung" as const,
            id: `rechnung-${auftrag.rechnung.id}`,
            zeitpunkt: auftrag.rechnung.createdAt,
            rechnung: auftrag.rechnung,
          },
        ]
      : []),
  ].sort(
    (links, rechts) =>
      rechts.zeitpunkt.getTime() - links.zeitpunkt.getTime(),
  );

  return (
    <main className="page">
      <Link className="backLink" href={returnTo}>
        Zurueck zur Auftragsuebersicht
      </Link>

      <header className="detailHeader">
        <div>
          <p className="eyebrow">Auftrag #{auftrag.id}</p>
          <h1>{auftrag.kunde.name}</h1>
          <p className="pageIntro">{auftrag.beschreibung}</p>
        </div>
        <div className="detailHeaderActions">
          {auftrag.prioritaet === Prioritaet.NOTDIENST ? (
            <span className="priorityBadge priority-notdienst">Notdienst</span>
          ) : null}
          <span className={`statusBadge status-${auftrag.status.toLowerCase()}`}>
            {auftragStatusLabels[auftrag.status]}
          </span>
          <OrderEditPanel
            key={`${auftrag.id}-${auftrag.updatedAt.toISOString()}`}
            auftrag={{
              id: auftrag.id,
              beschreibung: auftrag.beschreibung,
              status: auftrag.status,
              prioritaet: auftrag.prioritaet,
              nichtFertigGrund: auftrag.nichtFertigGrund,
              mitarbeiterIds: auftrag.mitarbeiter.map(
                (entry) => entry.mitarbeiterId,
              ),
            }}
            kunde={{
              id: auftrag.kunde.id,
              name: auftrag.kunde.name,
              telefonnummer: auftrag.kunde.telefonnummer,
              adresse: auftrag.kunde.adresse,
              kundentyp: auftrag.kunde.kundentyp,
            }}
            mitarbeiter={mitarbeiter.map((person) => ({
              id: person.id,
              name: person.name,
              aktiv: person.aktiv,
            }))}
            statusOptionen={Object.entries(auftragStatusLabels)
              .filter(([value]) =>
                auftrag.rechnung
                  ? value === auftrag.status
                  : value !== AuftragStatus.RECHNUNG_ERSTELLT &&
                    value !== AuftragStatus.BEZAHLT &&
                    value !== AuftragStatus.GEMAHNT &&
                    value !== AuftragStatus.ESKALIERT,
              )
              .map(([value, label]) => ({ value, label }))}
            prioritaetOptionen={Object.entries(prioritaetLabels).map(
              ([value, label]) => ({ value, label }),
            )}
            grundOptionen={Object.entries(nichtFertigGrundLabels).map(
              ([value, label]) => ({ value, label }),
            )}
            kundentypOptionen={Object.entries(kundentypLabels).map(
              ([value, label]) => ({ value, label }),
            )}
          />
        </div>
      </header>

      <section className="detailBlock" aria-labelledby="order-data-heading">
        <div className="blockHeading">
          <div>
            <p className="eyebrow">Grundlagen</p>
            <h2 id="order-data-heading">Auftragsdaten</h2>
          </div>
        </div>
        <div className="detailFacts">
          <div>
            <span>Prioritaet</span>
            <strong>{prioritaetLabels[auftrag.prioritaet]}</strong>
          </div>
          <div>
            <span>Naechster Einsatz</span>
            <strong>
              {naechsterEinsatz
                ? new Intl.DateTimeFormat("de-DE").format(naechsterEinsatz.datum)
                : "Noch nicht geplant"}
            </strong>
          </div>
          <div>
            <span>Auftragsteam</span>
            <strong>
              {auftrag.mitarbeiter.length === 0
                ? "Noch nicht zugeordnet"
                : auftrag.mitarbeiter
                    .map((entry) => entry.mitarbeiter.name)
                    .join(", ")}
            </strong>
          </div>
          <div>
            <span>Kontakt</span>
            <strong>
              {auftrag.kunde.telefonnummer || "Telefonnummer fehlt"}
            </strong>
            <small>{auftrag.kunde.adresse || "Adresse fehlt"}</small>
            {kundenDatenUnvollstaendig ? (
              <small className="warningText">Kundendaten ergaenzen</small>
            ) : null}
          </div>
        </div>
      </section>

      <section
        className="detailBlock currentStateBlock"
        aria-labelledby="current-state-heading"
      >
        <div className="blockHeading">
          <div>
            <p className="eyebrow">Aktueller Arbeitsstand</p>
            <h2 id="current-state-heading">Letzter Stand</h2>
          </div>
          <span className={`statusBadge status-${auftrag.status.toLowerCase()}`}>
            {auftragStatusLabels[auftrag.status]}
          </span>
        </div>
        {letzteRueckmeldung ? (
          <div className="currentStateContent">
            <strong>
              Rueckmeldung vom{" "}
              {new Intl.DateTimeFormat("de-DE").format(letzteRueckmeldung.datum)}
            </strong>
            <p>{letzteRueckmeldung.rueckmeldung}</p>
            <span>
              {letzteRueckmeldung.mitarbeiter.length === 0
                ? "Kein Einsatzteam hinterlegt"
                : letzteRueckmeldung.mitarbeiter
                    .map((entry) => entry.mitarbeiter.name)
                    .join(", ")}
            </span>
          </div>
        ) : (
          <div className="currentStateContent">
            <strong>Noch keine Einsatzrueckmeldung</strong>
            <p>
              Der Auftrag befindet sich aktuell im Status{" "}
              {auftragStatusLabels[auftrag.status]}.
            </p>
          </div>
        )}
        {auftrag.nichtFertigGrund ? (
          <div className="blockWarning">
            <span>Hinderungsgrund</span>
            <strong>{nichtFertigGrundLabels[auftrag.nichtFertigGrund]}</strong>
          </div>
        ) : null}
        {auftrag.prioritaet === Prioritaet.NOTDIENST ? (
          <div className="emergencyNotice">
            <strong>Notdienst hat Vorrang</strong>
            <p>
              Geplante Einsaetze duerfen nur mit Begruendung und bestaetigter
              Ersatzbesetzung oder sofortiger Neuplanung verschoben werden.
            </p>
          </div>
        ) : null}
        {nichtFreigegebeneZusatzarbeiten.length > 0 ? (
          <div className="blockWarning">
            <span>Ausfuehrung gesperrt</span>
            <strong>
              {nichtFreigegebeneZusatzarbeiten.length} Zusatzarbeit
              {nichtFreigegebeneZusatzarbeiten.length === 1 ? "" : "en"} ohne
              schriftliche Freigabe
            </strong>
          </div>
        ) : null}
      </section>

      {!istOperativGesperrt ? (
        <OrderActionPanels
          key={`${auftrag.id}-${auftrag.updatedAt.toISOString()}`}
          auftragId={auftrag.id}
          mitarbeiter={aktiveMitarbeiter.map((person) => ({
            id: person.id,
            name: person.name,
            rolle: rollenLabels[person.rolle],
          }))}
          einsatzStatusOptionen={Object.entries(einsatzStatusLabels).map(
            ([value, label]) => ({ value, label }),
          )}
          defaultEinsatzStatus={EinsatzStatus.GEPLANT}
          materialien={materialien.map((material) => ({
            id: material.id,
            name: material.name,
            einheit: material.einheit,
            lagerbestand: material.lagerbestand.toString(),
          }))}
          freigabeStatusOptionen={Object.entries(freigabeStatusLabels).map(
            ([value, label]) => ({ value, label }),
          )}
          istNotdienst={auftrag.prioritaet === Prioritaet.NOTDIENST}
        />
      ) : (
        <p className="closedNotice">
          Fuer diesen Auftrag wurde der kaufmaennische Ablauf begonnen. Neue
          Planungen, Verbraeuche und Zusatzarbeiten koennen daher nicht mehr
          erfasst werden.
        </p>
      )}

      <section className="detailBlock" aria-labelledby="additional-work-heading">
        <div className="sectionHeading">
          <div>
            <p className="eyebrow">Freigaben</p>
            <h2 id="additional-work-heading">Zusatzarbeiten</h2>
            <p>{auftrag.zusatzarbeiten.length} Eintraege</p>
          </div>
        </div>
        {auftrag.zusatzarbeiten.length === 0 ? (
          <p className="emptyText">
            Fuer diesen Auftrag wurden noch keine Zusatzarbeiten erfasst.
          </p>
        ) : (
          <ul className="additionalWorkList">
            {auftrag.zusatzarbeiten.map((zusatzarbeit) => {
              const betrag = zusatzarbeit.geschaetzterBetrag.toNumber();
              const brauchtSchriftlicheFreigabe = betrag >= 1500;
              const istGesperrt =
                brauchtSchriftlicheFreigabe &&
                zusatzarbeit.freigabeStatus !==
                  "SCHRIFTLICH_FREIGEGEBEN";

              return (
                <li className={istGesperrt ? "approvalRequired" : ""} key={zusatzarbeit.id}>
                  <div className="additionalWorkMain">
                    <strong>{zusatzarbeit.beschreibung}</strong>
                    <span>
                      {new Intl.NumberFormat("de-DE", {
                        style: "currency",
                        currency: "EUR",
                      }).format(betrag)}
                    </span>
                  </div>
                  <div className="additionalWorkStatus">
                    <span
                      className={`approvalBadge approval-${zusatzarbeit.freigabeStatus.toLowerCase()}`}
                    >
                      {freigabeStatusLabels[zusatzarbeit.freigabeStatus]}
                    </span>
                    {istGesperrt ? (
                      <small>Vor Ausfuehrung schriftlich freigeben</small>
                    ) : null}
                  </div>
                  <AdditionalWorkApprovalPanel
                    key={`${zusatzarbeit.id}-${zusatzarbeit.updatedAt.toISOString()}`}
                    auftragId={auftrag.id}
                    zusatzarbeitId={zusatzarbeit.id}
                    beschreibung={zusatzarbeit.beschreibung}
                    geschaetzterBetrag={betrag}
                    freigabeStatus={zusatzarbeit.freigabeStatus}
                    freigabeStatusOptionen={Object.entries(
                      freigabeStatusLabels,
                    ).map(([value, label]) => ({ value, label }))}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="detailBlock" aria-labelledby="invoice-heading">
        <div className="sectionHeading">
          <div>
            <p className="eyebrow">Kaufmaennischer Abschluss</p>
            <h2 id="invoice-heading">Rechnung</h2>
            <p>
              {auftrag.rechnung
                ? rechnungStatusLabels[auftrag.rechnung.status]
                : "Noch nicht vorbereitet"}
            </p>
          </div>
          {kannRechnungVorbereiten ? (
            <InvoicePreparationPanel
              key={`${auftrag.id}-${auftrag.updatedAt.toISOString()}`}
              auftragId={auftrag.id}
              kundeName={auftrag.kunde.name}
              beschreibung={auftrag.beschreibung}
              defaultDatum={heuteAlsEingabewert}
              einsaetze={auftrag.einsaetze
                .filter((einsatz) => einsatz.rueckmeldung)
                .map((einsatz) => ({
                  id: einsatz.id,
                  datum: new Intl.DateTimeFormat("de-DE").format(einsatz.datum),
                  team:
                    einsatz.mitarbeiter.length === 0
                      ? "Kein Einsatzteam hinterlegt"
                      : einsatz.mitarbeiter
                          .map((entry) => entry.mitarbeiter.name)
                          .join(", "),
                  rueckmeldung: einsatz.rueckmeldung ?? "",
                }))}
              materialien={auftrag.materialverbraeuche.map((verbrauch) => ({
                id: verbrauch.id,
                name: verbrauch.material.name,
                menge: new Intl.NumberFormat("de-DE").format(
                  verbrauch.menge.toNumber(),
                ),
                einheit: verbrauch.material.einheit,
              }))}
              zusatzarbeiten={auftrag.zusatzarbeiten.map((zusatzarbeit) => ({
                id: zusatzarbeit.id,
                beschreibung: zusatzarbeit.beschreibung,
                betrag: new Intl.NumberFormat("de-DE", {
                  style: "currency",
                  currency: "EUR",
                }).format(zusatzarbeit.geschaetzterBetrag.toNumber()),
                freigabe: freigabeStatusLabels[zusatzarbeit.freigabeStatus],
              }))}
            />
          ) : null}
        </div>

        {auftrag.rechnung ? (
          <div className="invoiceFacts">
            <div>
              <span>Rechnungsdatum</span>
              <strong>
                {new Intl.DateTimeFormat("de-DE").format(
                  auftrag.rechnung.erstelltAm,
                )}
              </strong>
            </div>
            <div>
              <span>Rechnungsbetrag</span>
              <strong>
                {new Intl.NumberFormat("de-DE", {
                  style: "currency",
                  currency: "EUR",
                }).format(auftrag.rechnung.betrag.toNumber())}
              </strong>
            </div>
            <div>
              <span>Rechnungsstatus</span>
              <strong>{rechnungStatusLabels[auftrag.rechnung.status]}</strong>
            </div>
          </div>
        ) : auftrag.status === AuftragStatus.TECHNISCH_FERTIG &&
          nichtFreigegebeneZusatzarbeiten.length > 0 ? (
          <div className="blockWarning">
            <span>Rechnung blockiert</span>
            <strong>
              Zuerst muessen alle Zusatzarbeiten ab 1.500 Euro schriftlich
              freigegeben werden.
            </strong>
          </div>
        ) : !kannRechnungVorbereiten ? (
          <p className="emptyText">
            Die Rechnung kann vorbereitet werden, sobald der Auftrag technisch
            fertig ist.
          </p>
        ) : (
          <div className="invoiceReadiness">
            <span>{auftrag.einsaetze.length} Einsaetze</span>
            <span>{auftrag.materialverbraeuche.length} Materialpositionen</span>
            <span>{auftrag.zusatzarbeiten.length} Zusatzarbeiten</span>
          </div>
        )}
      </section>

      <section className="detailBlock" aria-labelledby="assignments-heading">
        <div className="sectionHeading">
          <div>
            <p className="eyebrow">Chronologie</p>
            <h2 id="assignments-heading">Auftragsverlauf</h2>
            <p>
              {auftrag.einsaetze.length} Einsaetze,{" "}
              {auftrag.einsaetze.reduce(
                (summe, einsatz) => summe + einsatz.verschiebungen.length,
                0,
              )}{" "}
              Verschiebungen, {auftrag.zusatzarbeiten.length} Zusatzarbeiten
              {auftrag.rechnung ? ", 1 Rechnung" : ""}
            </p>
          </div>
        </div>
        <ul className="timelineList">
          {verlaufEintraege.map((eintrag) =>
            eintrag.typ === "einsatz" ? (
              <li className="timelineItem" key={eintrag.id}>
                <span className="timelineMarker" aria-hidden="true" />
                <div className="timelineContent">
                  <div className="recordHeader">
                    <div>
                      <strong>
                        Einsatz am{" "}
                        {new Intl.DateTimeFormat("de-DE").format(
                          eintrag.einsatz.datum,
                        )}
                      </strong>
                      <p>
                        {eintrag.einsatz.mitarbeiter.length === 0
                          ? "Kein Einsatzteam hinterlegt"
                          : eintrag.einsatz.mitarbeiter
                              .map((entry) => entry.mitarbeiter.name)
                              .join(", ")}
                      </p>
                    </div>
                    <span className="statusBadge">
                      {einsatzStatusLabels[eintrag.einsatz.status]}
                    </span>
                  </div>
                  {eintrag.einsatz.rueckmeldung ? (
                    <div className="timelineFeedback">
                      <span>Rueckmeldung</span>
                      <p>{eintrag.einsatz.rueckmeldung}</p>
                    </div>
                  ) : (
                    <div className="timelinePending">
                      <span>Rueckmeldung offen</span>
                      <div className="timelineActions">
                        {eintrag.einsatz.status === EinsatzStatus.GEPLANT ? (
                          <AssignmentReschedulePanel
                            key={`${eintrag.einsatz.id}-${eintrag.einsatz.updatedAt.toISOString()}`}
                            einsatzId={eintrag.einsatz.id}
                            einsatzDatum={new Intl.DateTimeFormat(
                              "de-DE",
                            ).format(eintrag.einsatz.datum)}
                            istNotdienst={
                              auftrag.prioritaet === Prioritaet.NOTDIENST
                            }
                          />
                        ) : null}
                        <AssignmentFeedbackPanel
                          auftragId={auftrag.id}
                          einsatzId={eintrag.einsatz.id}
                          einsatzDatum={new Intl.DateTimeFormat("de-DE").format(
                            eintrag.einsatz.datum,
                          )}
                          statusOptionen={rueckmeldeStatus.map((status) => ({
                            value: status,
                            label: auftragStatusLabels[status],
                          }))}
                          grundOptionen={Object.entries(
                            nichtFertigGrundLabels,
                          ).map(([value, label]) => ({ value, label }))}
                          defaultStatus={AuftragStatus.TECHNISCH_FERTIG}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </li>
            ) : eintrag.typ === "verschiebung" ? (
              <li className="timelineItem timelineReschedule" key={eintrag.id}>
                <span className="timelineMarker" aria-hidden="true" />
                <div className="timelineContent">
                  <div className="recordHeader">
                    <div>
                      <strong>Einsatz verschoben</strong>
                      <p>
                        Dokumentiert am{" "}
                        {new Intl.DateTimeFormat("de-DE").format(
                          eintrag.verschiebung.createdAt,
                        )}
                      </p>
                    </div>
                    {eintrag.verschiebung.notdienstBestaetigt ? (
                      <span className="priorityBadge priority-notdienst">
                        Notdienst bestaetigt
                      </span>
                    ) : (
                      <span className="statusBadge">Termin geaendert</span>
                    )}
                  </div>
                  <div className="timelineFeedback rescheduleDetails">
                    <span>Terminwechsel</span>
                    <p>
                      {new Intl.DateTimeFormat("de-DE").format(
                        eintrag.verschiebung.vorherigesDatum,
                      )}{" "}
                      auf{" "}
                      {new Intl.DateTimeFormat("de-DE").format(
                        eintrag.verschiebung.neuesDatum,
                      )}
                    </p>
                    <small>{eintrag.verschiebung.begruendung}</small>
                  </div>
                </div>
              </li>
            ) : eintrag.typ === "rechnung" ? (
              <li className="timelineItem timelineInvoice" key={eintrag.id}>
                <span className="timelineMarker" aria-hidden="true" />
                <div className="timelineContent">
                  <div className="recordHeader">
                    <div>
                      <strong>Rechnung erstellt</strong>
                      <p>
                        Rechnungsdatum{" "}
                        {new Intl.DateTimeFormat("de-DE").format(
                          eintrag.rechnung.erstelltAm,
                        )}
                      </p>
                    </div>
                    <span className="statusBadge">
                      {rechnungStatusLabels[eintrag.rechnung.status]}
                    </span>
                  </div>
                  <div className="timelineFeedback invoiceTimelineDetails">
                    <span>Rechnungsbetrag</span>
                    <p>
                      {new Intl.NumberFormat("de-DE", {
                        style: "currency",
                        currency: "EUR",
                      }).format(eintrag.rechnung.betrag.toNumber())}
                    </p>
                  </div>
                </div>
              </li>
            ) : (
              <li className="timelineItem timelineAdditionalWork" key={eintrag.id}>
                <span className="timelineMarker" aria-hidden="true" />
                <div className="timelineContent">
                  <div className="recordHeader">
                    <div>
                      <strong>Zusatzarbeit erfasst</strong>
                      <p>
                        {new Intl.DateTimeFormat("de-DE").format(
                          eintrag.zusatzarbeit.createdAt,
                        )}
                      </p>
                    </div>
                    <span
                      className={`approvalBadge approval-${eintrag.zusatzarbeit.freigabeStatus.toLowerCase()}`}
                    >
                      {
                        freigabeStatusLabels[
                          eintrag.zusatzarbeit.freigabeStatus
                        ]
                      }
                    </span>
                  </div>
                  <div className="timelineFeedback">
                    <span>
                      {new Intl.NumberFormat("de-DE", {
                        style: "currency",
                        currency: "EUR",
                      }).format(
                        eintrag.zusatzarbeit.geschaetzterBetrag.toNumber(),
                      )}
                    </span>
                    <p>{eintrag.zusatzarbeit.beschreibung}</p>
                  </div>
                </div>
              </li>
            ),
          )}
          <li className="timelineItem timelineOrigin">
            <span className="timelineMarker" aria-hidden="true" />
            <div className="timelineContent">
              <div className="recordHeader">
                <div>
                  <strong>Auftrag aufgenommen</strong>
                  <p>
                    {new Intl.DateTimeFormat("de-DE").format(auftrag.createdAt)}
                  </p>
                </div>
                <span className="statusBadge">Aufgenommen</span>
              </div>
            </div>
          </li>
        </ul>
      </section>

      <section className="detailBlock" aria-labelledby="materials-heading">
        <div className="sectionHeading">
          <div>
            <p className="eyebrow">Dokumentation</p>
            <h2 id="materials-heading">Materialverlauf</h2>
            <p>{auftrag.materialverbraeuche.length} Eintraege</p>
          </div>
        </div>
        {auftrag.materialverbraeuche.length === 0 ? (
          <p className="emptyText">
            Fuer diesen Auftrag wurde noch kein Materialverbrauch erfasst.
          </p>
        ) : (
          <>
            <div className="materialRecordsHeader" aria-hidden="true">
              <span>Material</span>
              <span>Menge</span>
              <span>Erfasst von</span>
              <span>Datum</span>
            </div>
            <ul className="materialRecords">
              {auftrag.materialverbraeuche.map((verbrauch) => (
                <li key={verbrauch.id}>
                  <strong>{verbrauch.material.name}</strong>
                  <span data-label="Menge">
                    {verbrauch.menge.toString()} {verbrauch.material.einheit}
                  </span>
                  <span data-label="Erfasst von">{verbrauch.erfasstVon.name}</span>
                  <span data-label="Datum">
                    {new Intl.DateTimeFormat("de-DE").format(verbrauch.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </main>
  );
}
