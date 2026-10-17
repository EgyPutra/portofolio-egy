import Link from "next/link";
import type { Metadata } from "next";
import { content, siteUrl } from "../../lib/content";
import { ProductBrowser } from "../../components/products";
import { ContactSection } from "../../components/editorial";
import { IconHeart } from "@tabler/icons-react";
export const metadata: Metadata = {
  title: "Rekomendasi untuk Keseharian",
  description:
    "Jelajahi pilihan untuk rumah, ruang kerja, dan perawatan diri. Cari dan saring rekomendasi Nuri.",
  alternates: siteUrl ? { canonical: siteUrl + "/rekomendasi/" } : undefined,
};
export default function Recommendations() {
  return (
    <>
      <section className="shell page-intro shop-intro">
        <div className="intro-symbol">
          <IconHeart size={24} stroke={1.3} />
        </div>
        <p className="eyebrow">PILIHAN UNTUK KESEHARIAN</p>
        <h1>
          Hal kecil, <em>banyak artinya.</em>
        </h1>
        <p className="lead">
          Temuan untuk rumah yang lebih nyaman, ruang kerja yang lebih rapi, dan
          waktu untuk diri sendiri.
        </p>
      </section>
      <section className="shell shop-section">
        <ProductBrowser
          products={content.recommendations.filter((p) => p.visible)}
        />
        <aside className="disclosure">
          <IconHeart size={20} />
          <p>
            {content.settings.affiliateDisclosure}{" "}
            <Link href="/informasi/">Tentang rekomendasi</Link>
          </p>
        </aside>
      </section>
      <ContactSection />
    </>
  );
}
