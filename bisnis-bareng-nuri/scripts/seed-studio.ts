import { createClient } from "@sanity/client";
import { readFile } from "node:fs/promises";
import { seed } from "../content/seed";
const projectId = process.env.SANITY_PROJECT_ID,
  token = process.env.SANITY_WRITE_TOKEN,
  dataset = process.env.SANITY_DATASET || "production";
if (!projectId || !token)
  throw new Error(
    "Atur SANITY_PROJECT_ID dan SANITY_WRITE_TOKEN pada environment lokal. Jangan tempel token ke chat.",
  );
const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2025-02-19",
  useCdn: false,
});
async function image(p: { src: string; alt: string }) {
  const buffer = await readFile("public" + p.src);
  const a = await client.assets.upload("image", buffer, {
    filename: p.src.split("/").pop(),
  });
  return {
    _type: "image",
    asset: { _type: "reference", _ref: a._id },
    alt: p.alt,
  };
}
const settings = {
  _id: "drafts.siteSettings",
  _type: "siteSettings",
  ...seed.settings,
  demo: true,
};
const profile = {
  _id: "drafts.profile",
  _type: "profile",
  ...seed.profile,
  portrait: await image(seed.profile.portrait),
  aboutImage: await image(seed.profile.aboutImage),
};
await client.createIfNotExists(settings);
await client.createIfNotExists(profile);
await client.createIfNotExists({
  _id: "drafts.pageComposition",
  _type: "pageComposition",
  pageKey: "home",
  sections: seed.sections.map((s) => ({ ...s, _type: "section", _key: s.id })),
});
for (const [items, type] of [
  [seed.recommendations, "shopeeRecommendation"],
  [seed.oriflame, "oriflameProduct"],
] as const)
  for (const p of items) {
    const { id, ...fields } = p;
    await client.createIfNotExists({
      ...fields,
      _id: "drafts." + id,
      _type: type,
      image: await image(p.image),
      ...(type === "oriflameProduct" ? { shoppingUrl: p.destinationUrl } : {}),
    });
  }
for (const s of seed.stories) {
  const { id, ...fields } = s;
  await client.createIfNotExists({
    ...fields,
    _id: "drafts." + id,
    _type: "story",
    slug: { _type: "slug", current: s.slug },
    coverImage: await image(s.coverImage),
  });
}
for (const a of seed.achievements) {
  const { id, ...fields } = a;
  await client.createIfNotExists({
    ...fields,
    _id: "drafts." + id,
    _type: "achievement",
  });
}
for (const g of seed.gallery) {
  const { id, ...fields } = g;
  await client.createIfNotExists({
    ...fields,
    _id: "drafts." + id,
    _type: "galleryItem",
    image: await image(g.image),
  });
}
await client.createIfNotExists({
  ...seed.catalogue,
  _id: "drafts.catalogue",
  _type: "catalogue",
  coverImage: await image(seed.catalogue.coverImage),
});
console.log(
  "Konten awal disimpan sebagai draf. Tidak ada build atau publikasi yang dipicu.",
);
