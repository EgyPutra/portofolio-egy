import { defineConfig, definePlugin } from "sanity";
import { structureTool } from "sanity/structure";
import { schemas } from "./schemas";
import { ReviewTool } from "./tools";
import { RecommendationsTool } from "./recommendations";
const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
if (!projectId)
  throw new Error(
    "Isi SANITY_STUDIO_PROJECT_ID di studio/.env.local terlebih dahulu. Lihat docs/SETUP.md.",
  );
const singletons = new Set([
  "siteSettings",
  "profile",
  "pageComposition",
  "catalogue",
]);
const review = definePlugin({
  name: "nuri-review",
  tools: [
    {
      name: "ringkasan",
      title: "Ringkasan & Publikasi",
      component: ReviewTool,
    },
    {
      name: "rekomendasi",
      title: "Kelola Rekomendasi",
      component: RecommendationsTool,
    },
  ],
});
export default defineConfig({
  name: "nuri",
  title: "Ruang Nuri",
  projectId,
  dataset: process.env.SANITY_STUDIO_DATASET || "production",
  plugins: [
    review(),
    structureTool({
      title: "Kelola Konten",
      structure: (S) =>
        S.list()
          .title("Ruang Nuri")
          .items([
            S.listItem()
              .title("Profil & Kontak")
              .child(
                S.list()
                  .title("Profil & Kontak")
                  .items([
                    S.listItem()
                      .title("Profil Nuri")
                      .child(
                        S.document()
                          .schemaType("profile")
                          .documentId("profile"),
                      ),
                    S.listItem()
                      .title("Kontak & Pengaturan")
                      .child(
                        S.document()
                          .schemaType("siteSettings")
                          .documentId("siteSettings"),
                      ),
                  ]),
              ),
            S.documentTypeListItem("story").title("Cerita"),
            S.documentTypeListItem("achievement").title(
              "Pencapaian & Perjalanan",
            ),
            S.documentTypeListItem("galleryItem").title("Galeri Kegiatan"),
            S.documentTypeListItem("oriflameProduct").title("Produk Oriflame"),
            S.listItem()
              .title("Katalog Oriflame")
              .child(
                S.document().schemaType("catalogue").documentId("catalogue"),
              ),
            S.documentTypeListItem("shopeeRecommendation").title(
              "Rekomendasi Shopee",
            ),
            S.documentTypeListItem("category").title("Kategori"),
            S.listItem()
              .title("Tampilan Halaman")
              .child(
                S.document()
                  .schemaType("pageComposition")
                  .documentId("pageComposition"),
              ),
          ]),
    }),
  ],
  schema: {
    types: schemas,
    templates: (templates) =>
      templates.filter((t) => !singletons.has(t.schemaType)),
  },
  document: {
    actions: (actions) =>
      actions.filter(
        (action) =>
          !["publish", "unpublish", "delete"].includes(action.action || ""),
      ),
    newDocumentOptions: (options) =>
      options.filter((o) => !singletons.has(o.templateId)),
  },
});
