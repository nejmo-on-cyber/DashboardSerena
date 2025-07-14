import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Serena Dashboard - AI WhatsApp Assistant",
  description: "AI-powered WhatsApp assistant dashboard for clinics and salons",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-oid="xnpd_um">
      <head data-oid="ex-zmuo">
        <Script
          type="module"
          src="https://cdn.jsdelivr.net/gh/onlook-dev/onlook@main/apps/web/preload/dist/index.js"
          data-oid="5u22:cj"
        />
      </head>
      <body className="antialiased" data-oid="grm1:2q">
        {children}
      </body>
    </html>
  );
}
