import Link from "next/link";
import type { Metadata } from "next";
import { content, siteUrl } from "../../lib/content";
import { StoryCard, ContactSection } from "../../components/editorial";
export const metadata: Metadata = {
  title: "Cerita & Perjalanan",
  description:
    "Cerita Nuri tentang bisnis, keseharian di rumah, dan belajar bersama komunitas.",
  alternates: siteUrl ? { canonical: siteUrl + "/cerita/" } : undefined,
};
export default function Stories() {
  const stories = content.stories
    .filter((s) => s.visible)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <>
      <section className="shell page-intro">
        <p className="eyebrow">CERITA & PERJALANAN</p>
        <h1>
          Langkah kecil.
          <br />
          <em>Cerita yang berarti.</em>
        </h1>
        <p className="lead">
          Tentang memulai, menemukan ritme, dan bertumbuh bersama orang-orang di
          sepanjang perjalanan.
        </p>
      </section>
      <section className="shell stories-section">
        {stories.length ? (
          <>
            <h2 className="sr-only">Daftar cerita Nuri</h2>
            <div className="stories-grid">
              {stories.map((s) => (
                <StoryCard key={s.id} story={s} />
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <h2>Cerita sedang disiapkan.</h2>
            <p>Kembali lagi untuk membaca kabar terbaru dari Nuri.</p>
            <Link className="button secondary" href="/">
              Kembali ke beranda
            </Link>
          </div>
        )}
      </section>
      <ContactSection />
    </>
  );
}
