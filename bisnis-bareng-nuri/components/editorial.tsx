import {
  IconArrowRight,
  IconArrowUpRight,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconLeaf,
  IconHeart,
  IconUsers,
} from "@tabler/icons-react";
import type { SiteContent, Section, Story } from "../lib/types";
import { PhotoView, ChatButton, ExternalButton } from "./ui";
import { ProductCard } from "./products";
import { safeUrl, formatDate } from "../lib/utils";
export function StoryCard({ story: s }: { story: Story }) {
  return (
    <article className="story-card">
      <a href={`/cerita/${s.slug}/`} tabIndex={-1} aria-hidden="true">
        <PhotoView photo={s.coverImage} />
      </a>
      <div className="story-meta">
        {s.category}
        {s.displayDate && (
          <>
            {" "}
            <span>·</span> {formatDate(s.displayDate)}
          </>
        )}
      </div>
      <h3>
        <a href={`/cerita/${s.slug}/`}>{s.title}</a>
      </h3>
      <p>{s.excerpt}</p>
      <a className="text-link" href={`/cerita/${s.slug}/`}>
        Baca cerita <IconArrowRight size={17} />
        <span className="sr-only">: {s.title}</span>
      </a>
    </article>
  );
}
export function ContactSection({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="contact-section shell" id="kontak">
      <div className="contact-panel">
        <IconLeaf className="contact-leaf" size={34} stroke={1.2} />
        <h2>{title || "Cerita baik dimulai dari obrolan kecil."}</h2>
        <p>
          {description ||
            "Mau tanya produk atau penasaran dengan bisnis dari rumah? Yuk, kenalan dan cerita dulu."}
        </p>
        <div className="button-row">
          <ChatButton kind="produk" className="button secondary">
            <IconBrandWhatsapp size={19} />
            Tanya produk
          </ChatButton>
          <ChatButton kind="bisnis">
            <IconBrandWhatsapp size={19} />
            Tanya bisnis <IconArrowUpRight size={18} />
          </ChatButton>
        </div>
      </div>
    </section>
  );
}
const selected = <
  T extends {
    id: string;
    featured?: boolean;
    visible: boolean;
    sortOrder: number;
  },
>(
  items: T[],
  section: Section,
  limit: number,
) =>
  items
    .filter(
      (i) =>
        i.visible &&
        (!section.selectedIds?.length || section.selectedIds.includes(i.id)),
    )
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, limit);
export function HomeSections({ data }: { data: SiteContent }) {
  const { profile, settings } = data;
  return (
    <>
      {data.sections
        .filter((s) => s.enabled)
        .map((s) => {
          const cls = s.layout === "compact" ? " compact" : "";
          switch (s.type) {
            case "hero":
              return (
                <section key={s.id} className={`hero shell${cls}`}>
                  <div className="hero-copy">
                    <p className="eyebrow">CERITA KECIL, LANGKAH BERARTI</p>
                    <h1>{s.title || profile.headline}</h1>
                    <p className="hero-description">
                      {s.description || profile.shortBio}
                    </p>
                    <div className="button-row">
                      <ChatButton />
                      <a href="/tentang/" className="text-link">
                        Kenalan dulu <IconArrowRight size={18} />
                      </a>
                    </div>
                  </div>
                  <figure className="hero-figure">
                    <PhotoView photo={profile.portrait} priority />
                    <figcaption>
                      {data.demo
                        ? "Foto ilustrasi dari referensi desain"
                        : "Nuri, berbagi cerita dan pilihan dari rumah."}
                    </figcaption>
                  </figure>
                </section>
              );
            case "about":
              return (
                <section
                  key={s.id}
                  className={`shell about-section section${cls}`}
                >
                  <PhotoView
                    photo={profile.aboutImage}
                    className="about-photo"
                  />
                  <div className="about-copy">
                    <p className="eyebrow">TENTANG NURI</p>
                    <h2>
                      {s.title ||
                        "Ruang untuk keluarga. Ruang untuk bertumbuh."}
                    </h2>
                    <p>
                      {s.description ||
                        "Halo, aku Nuri. Seorang ibu rumah tangga yang menemukan ruang untuk berkarya dari rumah. Perjalanan ini dimulai sejak kuliah, dari keinginan sederhana untuk belajar mandiri."}
                    </p>
                    <p>
                      Di sini, aku berbagi cerita, pilihan yang aku sukai, dan
                      semangat untuk terus belajar bersama.
                    </p>
                    <a href="/tentang/" className="text-link">
                      Lebih dekat dengan Nuri <IconArrowRight size={18} />
                    </a>
                  </div>
                </section>
              );
            case "journey":
              return (
                <section key={s.id} className={`journey-section section${cls}`}>
                  <div className="shell">
                    <div className="section-heading">
                      <h2>{s.title || "Setiap langkah punya cerita."}</h2>
                      <p>
                        {s.description ||
                          "Bukan tentang seberapa jauh, tetapi bagaimana kita terus bertumbuh."}
                      </p>
                    </div>
                    <div className="journey-grid">
                      {selected(data.achievements, s, 6).map((a, i) => (
                        <article key={a.id}>
                          <div className="journey-icon">
                            {i === 0 ? (
                              <IconLeaf size={25} stroke={1.3} />
                            ) : i === 1 ? (
                              <IconUsers size={25} stroke={1.3} />
                            ) : (
                              <IconHeart size={25} stroke={1.3} />
                            )}
                          </div>
                          {a.year && <span className="muted">{a.year}</span>}
                          <h3>{a.title}</h3>
                          <p>{a.description}</p>
                        </article>
                      ))}
                    </div>
                    <a href="/cerita/" className="text-link">
                      Jelajahi cerita Nuri <IconArrowRight size={18} />
                    </a>
                  </div>
                </section>
              );
            case "gallery":
              return (
                <section
                  key={s.id}
                  className={`shell gallery-section section${cls}`}
                >
                  <div className="section-heading">
                    <h2>{s.title || "Hal-hal yang mengisi hari."}</h2>
                    <p>
                      {s.description ||
                        "Belajar, berbagi, dan menikmati momen sederhana di antaranya."}
                    </p>
                  </div>
                  <div className="gallery-grid">
                    {selected(data.gallery, s, 3).map((g, i) => (
                      <figure
                        key={g.id}
                        className={i === 0 ? "gallery-main" : ""}
                      >
                        <PhotoView photo={g.image} />
                        <figcaption>
                          <span>{g.category}</span>
                          {g.caption}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </section>
              );
            case "oriflame":
              return (
                <section
                  key={s.id}
                  className={`oriflame-section section${cls}`}
                >
                  <div className="shell">
                    <div className="section-heading">
                      <p className="brand-label">
                        ORIFLAME <span>SWEDEN</span>
                      </p>
                      <h2>{s.title || "Sedikit waktu untuk diri sendiri."}</h2>
                      <p>
                        {s.description ||
                          "Pilihan perawatan dan kecantikan untuk menemani versimu sehari-hari."}
                      </p>
                      <a href="/oriflame/" className="text-link">
                        Jelajahi Oriflame <IconArrowUpRight size={18} />
                      </a>
                    </div>
                    <div className="products-grid">
                      {selected(data.oriflame, s, 4).map((p) => (
                        <ProductCard key={p.id} product={p} type="oriflame" />
                      ))}
                    </div>
                  </div>
                </section>
              );
            case "recommendations":
              return (
                <section key={s.id} className={`shell section${cls}`}>
                  <div className="section-heading">
                    <h2>{s.title || "Pilihan kecil untuk keseharian."}</h2>
                    <p>
                      {s.description ||
                        "Temuan untuk rumah, ruang kerja, dan rutinitas yang terasa lebih nyaman."}
                    </p>
                    <a href="/rekomendasi/" className="text-link">
                      Semua rekomendasi <IconArrowRight size={18} />
                    </a>
                  </div>
                  <div className="recommendations-home">
                    {selected(data.recommendations, s, 3).map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </section>
              );
            case "contact":
              return (
                <ContactSection
                  key={s.id}
                  title={s.title}
                  description={s.description}
                />
              );
            default:
              return null;
          }
        })}
      {settings.affiliateDisclosure &&
        data.recommendations.some((p) => p.visible && p.affiliate) && (
          <p className="shell disclosure">{settings.affiliateDisclosure}</p>
        )}
    </>
  );
}
export function Footer({ data }: { data: SiteContent }) {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <a href="/" className="wordmark">
            Nuri<span className="wordmark-dot">.</span>
          </a>
          <p>
            Cerita, kesempatan, dan pilihan sehari-hari.
            <br />
            Dari rumah, dengan sepenuh hati.
          </p>
        </div>
        <div>
          <span className="footer-label">JELAJAHI</span>
          <a href="/tentang/">Tentang Nuri</a>
          <a href="/cerita/">Cerita & perjalanan</a>
          <a href="/oriflame/">Pilihan Oriflame</a>
          <a href="/rekomendasi/">Rekomendasi</a>
        </div>
        <div>
          <span className="footer-label">TETAP TERHUBUNG</span>
          <ChatButton className="footer-chat">
            <IconBrandWhatsapp size={18} />
            Chat Nuri
          </ChatButton>
          {safeUrl(data.settings.instagramUrl, ["instagram.com"]) && (
            <ExternalButton
              url={data.settings.instagramUrl}
              className="footer-social"
            >
              <IconBrandInstagram size={18} />
              Instagram
            </ExternalButton>
          )}
          <a href="/kelola/">
            Ruang pengelola <IconArrowUpRight size={14} />
          </a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} Bisnis Bareng Nuri</span>
        <div>
          <a href="/privasi/">Privasi</a>
          <a href="/informasi/">Informasi & afiliasi</a>
        </div>
      </div>
    </footer>
  );
}
