import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Apps",
  description: "Lokale Auftragsverwaltung fuer Brandt & Soehne Elektro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        <nav className="appNav" aria-label="Hauptnavigation">
          <Link href="/">Auftraege</Link>
          <Link href="/rechnungen">Rechnungen</Link>
          <Link href="/kunden">Kunden</Link>
          <Link href="/mitarbeiter">Mitarbeiter</Link>
          <Link href="/material">Material</Link>
          <Link href="/werkzeuge">Werkzeuge</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
