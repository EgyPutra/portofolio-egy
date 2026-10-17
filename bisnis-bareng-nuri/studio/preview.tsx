import { useState } from "react";
import { HomeSections, StoryCard } from "../components/editorial";
import { PhotoView, ContactProvider } from "../components/ui";
import { ProductBrowser } from "../components/products";
import { RichText } from "../components/rich-text";
import type { SiteContent } from "../lib/types";
export function PreviewCanvas({ data }: { data: SiteContent }) {
  const [route, setRoute] = useState("/");
  const story = data.stories.find((s) => `/cerita/${s.slug}/` === route);
  return (
    <ContactProvider settings={data.settings}>
      <div
        onClickCapture={(e) => {
          const a = (e.target as HTMLElement).closest("a");
          const href = a?.getAttribute("href");
          if (href?.startsWith("/")) {
            e.preventDefault();
            setRoute(href);
            e.currentTarget.ownerDocument.defaultView?.scrollTo(0, 0);
          }
        }}
      >
        <header className="site-header">
          <div className="shell nav-shell">
            <a className="wordmark" href="/">
              Nuri.
            </a>
            <nav
              style={{
                display: "flex",
                gap: 12,
                fontSize: 14,
                flexWrap: "wrap",
              }}
              aria-label="Halaman pratinjau"
            >
              <a href="/">Beranda</a>
              <a href="/rekomendasi/">Rekomendasi</a>
              <a href="/oriflame/">Oriflame</a>
              <a href="/cerita/">Cerita</a>
            </nav>
          </div>
        </header>
        {route === "/" ? (
          <HomeSections data={data} />
        ) : route === "/rekomendasi/" ? (
          <div className="shell page-intro">
            <h1>Hal kecil, banyak artinya.</h1>
            <p className="lead">Pratinjau semua rekomendasi, termasuk draf.</p>
            <ProductBrowser products={data.recommendations} />
          </div>
        ) : route === "/oriflame/" ? (
          <div className="shell page-intro">
            <h1>Merawat diri, dengan caramu.</h1>
            <ProductBrowser products={data.oriflame} type="oriflame" />
          </div>
        ) : route === "/cerita/" ? (
          <div className="shell page-intro">
            <h1>Cerita & perjalanan.</h1>
            <div className="stories-grid" style={{ marginTop: 35 }}>
              {data.stories
                .filter((s) => s.visible)
                .map((s) => (
                  <StoryCard key={s.id} story={s} />
                ))}
            </div>
          </div>
        ) : story ? (
          <article className="shell article-page">
            <header className="article-heading">
              <h1>{story.title}</h1>
              <p className="lead">{story.excerpt}</p>
            </header>
            <PhotoView photo={story.coverImage} className="article-cover" />
            <div className="prose">
              <RichText blocks={story.body} />
            </div>
          </article>
        ) : (
          <div className="shell page-intro">
            <h1>{data.profile.name}</h1>
            <PhotoView
              photo={data.profile.portrait}
              className="article-cover"
            />
            <div className="prose">
              {data.profile.fullBio.split("\n\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </ContactProvider>
  );
}
