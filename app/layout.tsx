import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}
