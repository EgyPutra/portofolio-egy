import Link from "next/link";
import type { Metadata } from "next";
import { content, siteUrl } from "../../lib/content";
import { PhotoView, ChatButton } from "../../components/ui";
import { ContactSection } from "../../components/editorial";
import {
  IconArrowRight,
  IconLeaf,
  IconBook,
  IconUsers,
} from "@tabler/icons-react";
export const metadata: Metadata = {
  title: "Tentang Nuri",
  description: "Kenali Nuri dan cerita membangun ruang berkarya dari rumah.",
  alternates: siteUrl ? { canonical: siteUrl + "/tentang/" } : undefined,
};
export default function About() {
  const p = content.profile;
  return (
    <>
      <section className="shell about-page page-intro">
        <div>
          <p className="eyebrow">SENANG BISA BERKENALAN</p>
          <h1>
            Halo, aku <em>Nuri.</em>
          </h1>
          <p className="lead">
            Seorang ibu, teman bercerita, dan perempuan yang terus belajar.
          </p>
          <div className="bio-text">
            {p.fullBio.split("\n\n").map((text, i) => (
              <p key={i}>{text}</p>
            ))}
          </div>
          <div className="button-row">
            <ChatButton />
            <Link className="text-link" href="/cerita/">
              Baca ceritaku <IconArrowRight size={18} />
            </Link>
          </div>
        </div>
        <figure>
          <PhotoView photo={p.portrait} priority />
          {content.demo && (
            <figcaption>Foto ilustrasi dari referensi desain.</figcaption>
          )}
        </figure>
      </section>
      <section className="section about-values">
        <div className="shell">
          <h2>Yang dekat dengan keseharianku.</h2>
          <div className="journey-grid">
            {[
              [
                IconLeaf,
                "Keluarga & rumah",
                "Menjalani keseharian dengan ruang untuk hal-hal yang berarti.",
              ],
              [
                IconBook,
                "Belajar hal baru",
                "Membuka diri pada pengalaman dan kesempatan mengembangkan diri.",
              ],
              [
                IconUsers,
                "Bertumbuh bersama",
                "Menemukan teman belajar dan berbagi cerita dalam komunitas.",
              ],
            ].map(([Icon, title, text]) => (
              <article key={String(title)}>
                {typeof Icon !== "string" && <Icon size={27} stroke={1.4} />}
                <h3>{String(title)}</h3>
                <p>{String(text)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <ContactSection />
    </>
  );
}
