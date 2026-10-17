import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IconArrowLeft } from "@tabler/icons-react";
import { content, siteUrl } from "../../../lib/content";
import { PhotoView } from "../../../components/ui";
import { ContactSection, StoryCard } from "../../../components/editorial";
import { formatDate } from "../../../lib/utils";
import { RichText } from "../../../components/rich-text";
export const dynamicParams = false;
export function generateStaticParams() {
  return content.stories
    .filter((s) => s.visible)
    .map((s) => ({ slug: s.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = content.stories.find((s) => s.slug === slug && s.visible);
  return s
    ? {
        title: s.title,
        description: s.excerpt,
        alternates: siteUrl
          ? { canonical: siteUrl + `/cerita/${slug}/` }
          : undefined,
        openGraph: {
          title: s.title,
          description: s.excerpt,
          type: "article",
          images: [s.coverImage.src],
        },
      }
    : { title: "Cerita tidak ditemukan" };
}
export default async function StoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = content.stories.find((s) => s.slug === slug && s.visible);
  if (!s) notFound();
  const related = content.stories
    .filter((x) => x.id !== s.id && x.visible)
    .slice(0, 2);
  return (
    <>
      <article className="shell article-page">
        <Link href="/cerita/" className="text-link back-link">
          <IconArrowLeft size={18} />
          Semua cerita
        </Link>
        <header className="article-heading">
          <p className="story-meta">
            {s.category}
            {s.displayDate && <> · {formatDate(s.displayDate)}</>}
          </p>
          <h1>{s.title}</h1>
          <p className="lead">{s.excerpt}</p>
          <p className="author">Oleh Nuri</p>
        </header>
        <PhotoView photo={s.coverImage} className="article-cover" priority />
        <div className="prose">
          <RichText blocks={s.body} />
          {content.demo && (
            <div className="article-source">
              Cerita disarikan dari{" "}
              <a
                href="https://sites.google.com/view/irtkerjadirumah/home"
                target="_blank"
                rel="noopener noreferrer"
              >
                website Nuri sebelumnya
              </a>
              . Foto menggunakan ilustrasi dari referensi desain.
            </div>
          )}
        </div>
      </article>
      {related.length > 0 && (
        <section className="shell section">
          <h2>Cerita lainnya.</h2>
          <div className="related-grid">
            {related.map((r) => (
              <StoryCard key={r.id} story={r} />
            ))}
          </div>
        </section>
      )}
      <ContactSection />
    </>
  );
}
