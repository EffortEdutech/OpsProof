import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FireMaint",
  description: "Fire maintenance evidence and reporting platform",
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  themeColor: "#b42318"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
