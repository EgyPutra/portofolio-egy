import localFont from "next/font/local";
import type { Metadata, Viewport } from "next";
import { content, siteUrl } from "../lib/content";
import { Header } from "../components/header";
import { Footer } from "../components/editorial";
import { ContactProvider } from "../components/ui";

import "./globals.css";
const geist = localFont({
  src: "./fonts/Geist.woff2",
  variable: "--font-geist",
  weight: "100 900",
  display: "swap",
  adjustFontFallback: "Arial",
});
const fraunces = localFont({
  src: "./fonts/Fraunces.woff2",
  variable: "--font-fraunces",
  weight: "100 900",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});
export const metadata: Metadata = {
  title: {
    default: "Bisnis Bareng Nuri | Bertumbuh dari Rumah",
    template: "%s | Bisnis Bareng Nuri",
  },
  description: content.settings.seoDescription,
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  openGraph: {
    title: content.settings.siteName,
    description: content.settings.seoDescription,
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/images/portrait.webp",
        width: 1200,
        height: 1000,
        alt: content.profile.portrait.alt,
      },
    ],
  },
  robots: content.demo
    ? { index: false, follow: true }
    : { index: true, follow: true },
  other: { "publication-id": content.publicationId },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAFAFA",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geist.variable} ${fraunces.variable}`}
      data-theme={content.settings.themePreset}
    >
      <body>
        <ContactProvider settings={content.settings}>
          <Header demo={content.demo} />
          <main id="main">{children}</main>
          <Footer data={content} />
        </ContactProvider>
      </body>
    </html>
  );
}
