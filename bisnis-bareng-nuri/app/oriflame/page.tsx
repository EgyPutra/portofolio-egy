import type { Metadata } from "next";
import { content, siteUrl } from "../../lib/content";
import { PhotoView, ExternalButton } from "../../components/ui";
import { ProductBrowser } from "../../components/products";
import { ContactSection } from "../../components/editorial";
import { IconArrowUpRight, IconBook2 } from "@tabler/icons-react";
export const metadata: Metadata = {
  title: "Pilihan & Katalog Oriflame",
  description:
    "Temukan katalog Oriflame dan pilihan perawatan, kosmetik, serta wewangian bersama Nuri.",
  alternates: siteUrl ? { canonical: siteUrl + "/oriflame/" } : undefined,
};
export default function Oriflame() {
  const c = content.catalogue;
  return (
    <>
      <section className="shell page-intro">
        <p className="brand-label">
          ORIFLAME <span>SWEDEN</span>
        </p>
        <h1>
          Merawat diri,
          <br />
          <em>dengan caramu.</em>
        </h1>
        <p className="lead">
          Kenali pilihan perawatan, riasan, dan wewangian. Nuri siap menemanimu
          memilih.
        </p>
      </section>
      {c.active && (
        <section className="shell catalogue-section">
          <div className="catalogue-panel">
            <PhotoView photo={c.coverImage} />
            <div>
              <IconBook2 size={27} stroke={1.3} />
              <p className="catalogue-period">{c.periodLabel}</p>
              <h2>{c.title}</h2>
              <p>
                Jelajahi pilihan lengkap dan tanyakan produk yang menarik
                perhatianmu.
              </p>
              <ExternalButton
                url={c.catalogueUrl}
                className="button primary"
                hosts={["oriflame.com"]}
              >
                Buka katalog <IconArrowUpRight size={18} />
              </ExternalButton>
              {!c.catalogueUrl && (
                <small>Katalog menunggu pembaruan tautan dari Nuri.</small>
              )}
            </div>
          </div>
        </section>
      )}
      <section className="shell shop-section">
        <h2>Pilihan Oriflame untukmu.</h2>
        <ProductBrowser
          products={content.oriflame.filter((p) => p.visible)}
          type="oriflame"
        />
      </section>
      <ContactSection />
    </>
  );
}
