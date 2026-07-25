const phases = [
  {
    id: "P1",
    title: "Auftrag erfassen",
    text: "Kunde, Adresse, Problem, Prioritaet und erster Status werden an einer Stelle festgehalten.",
  },
  {
    id: "P2",
    title: "Einsatz planen",
    text: "Mitarbeiter werden Auftraegen und Einsaetzen zugeordnet, Lehrlinge nicht allein.",
  },
  {
    id: "P3",
    title: "Rueckmeldung sichern",
    text: "Nach dem Einsatz werden Status, Materialverbrauch und Gruende fuer offene Punkte erfasst.",
  },
  {
    id: "P4",
    title: "Rechnung vorbereiten",
    text: "Technisch fertige Auftraege liefern die Grundlage fuer Rechnung, Zahlung und Mahnung.",
  },
];

const statusItems = [
  "aufgenommen",
  "geplant",
  "in Bearbeitung",
  "wartet auf Material",
  "technisch fertig",
  "Rechnung erstellt",
  "bezahlt",
];

export default function Home() {
  return (
    <main className="page">
      <section className="intro">
        <p className="eyebrow">Brandt & Soehne Elektro</p>
        <h1>Einfacher lokaler Arbeitsstand fuer Auftraege, Material und Werkzeuge.</h1>
        <p className="lede">
          Dieses Projekt bildet die erste kleine Version der App ab: wenig Ballast,
          klare Status und eine Datenbasis, die spaeter Schritt fuer Schritt mit echten
          Formularen erweitert werden kann.
        </p>
      </section>

      <section className="workflow" aria-label="Kernprozess">
        {phases.map((phase) => (
          <article className="workflowItem" key={phase.id}>
            <span>{phase.id}</span>
            <h2>{phase.title}</h2>
            <p>{phase.text}</p>
          </article>
        ))}
      </section>

      <section className="split">
        <div>
          <h2>Erste fachliche Schwerpunkte</h2>
          <ul>
            <li>Auftrag erfassen und priorisieren</li>
            <li>Mitarbeiter zu Auftrag und Einsatz zuordnen</li>
            <li>Materialverbrauch fuer Rechnung und Lagerbestand erfassen</li>
            <li>Status nach Einsatz inklusive Grund bei nicht fertigen Auftraegen speichern</li>
            <li>Werkzeugstandort fuer teure Geraete sichtbar machen</li>
          </ul>
        </div>
        <div>
          <h2>Statusmodell</h2>
          <div className="statusGrid">
            {statusItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
