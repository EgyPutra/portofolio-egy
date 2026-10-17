import type {
  SiteContent,
  Photo,
  Block,
  Section,
  Product,
  Story,
  Settings,
  Profile,
} from "./types";
import { safeUrl } from "./utils";
export const contentTypes = [
  "siteSettings",
  "profile",
  "story",
  "achievement",
  "galleryItem",
  "oriflameProduct",
  "shopeeRecommendation",
  "catalogue",
  "category",
  "pageComposition",
];
export type SanityDocument = {
  _id: string;
  _type: string;
  _rev?: string;
  _updatedAt?: string;
  [key: string]: unknown;
};
const text = (v: unknown) => (typeof v === "string" ? v : "");
const num = (v: unknown) => (typeof v === "number" ? v : 0);
export function effectiveDocuments(raw: SanityDocument[]) {
  const map = new Map<string, SanityDocument>();
  for (const doc of raw
    .filter((d) => !d._id.startsWith("versions."))
    .sort(
      (a, b) =>
        Number(a._id.startsWith("drafts.")) -
        Number(b._id.startsWith("drafts.")),
    )) {
    const id = doc._id.replace(/^drafts\./, "");
    map.set(id, { ...doc, _id: id });
  }
  return Array.from(map.values()).sort((a, b) => a._id.localeCompare(b._id));
}
export function photoFrom(
  value: unknown,
  projectId: string,
  dataset: string,
): Photo {
  const p =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const ref = (p.asset as { _ref?: string })?._ref || "";
  const match = /^image-([a-f0-9]+)-(\d+x\d+)-(jpg|jpeg|png|webp|gif)$/.exec(
    ref,
  );
  const url = match
    ? `https://cdn.sanity.io/images/${projectId}/${dataset}/${match[1]}-${match[2]}.${match[3]}?w=1400&auto=format`
    : safeUrl(p.url) || "";
  const hotspot = p.hotspot as { x: number; y: number } | undefined;
  return {
    src: url,
    alt: text(p.alt),
    caption: text(p.caption),
    ...(hotspot ? { focalPoint: { x: hotspot.x, y: hotspot.y } } : {}),
  };
}
export function normalizeDocuments(
  raw: SanityDocument[],
  projectId: string,
  dataset: string,
  publicationId = "preview",
): SiteContent {
  const docs = effectiveDocuments(raw),
    one = (type: string) => docs.find((d) => d._type === type),
    all = (type: string) => docs.filter((d) => d._type === type);
  const s = one("siteSettings"),
    p = one("profile"),
    composition = one("pageComposition");
  if (!s || !p || !composition)
    throw new Error(
      "Lengkapi Profil, Pengaturan, dan Tampilan Halaman sebelum menerbitkan.",
    );
  const image = (v: unknown) => photoFrom(v, projectId, dataset);
  const common = (d: SanityDocument) => ({
    id: d._id,
    visible: d.visible !== false,
    sortOrder: num(d.sortOrder),
  });
  const product = (d: SanityDocument): Product => ({
    ...common(d),
    name: text(d.name),
    category: text(d.category),
    image: image(d.image),
    recommendationNote: text(d.recommendationNote),
    destinationUrl: text(d.destinationUrl || d.shoppingUrl),
    affiliate: d.affiliate === true,
    featured: d.featured === true,
    productCode: text(d.productCode),
    displayPrice: text(d.displayPrice),
  });
  const settings: Settings = {
    siteName: text(s.siteName),
    tagline: text(s.tagline),
    whatsappNumber: text(s.whatsappNumber),
    whatsappProductMessage: text(s.whatsappProductMessage),
    whatsappBusinessMessage: text(s.whatsappBusinessMessage),
    instagramUrl: text(s.instagramUrl),
    oriflameStoreUrl: text(s.oriflameStoreUrl),
    affiliateDisclosure: text(s.affiliateDisclosure),
    themePreset: s.themePreset === "rose" ? "rose" : "editorial",
    seoDescription: text(s.seoDescription),
  };
  const profile: Profile = {
    name: text(p.name),
    headline: text(p.headline),
    shortBio: text(p.shortBio),
    fullBio: text(p.fullBio),
    portrait: image(p.portrait),
    aboutImage: image(p.aboutImage),
  };
  const stories: Story[] = all("story").map((d) => ({
    ...common(d),
    title: text(d.title),
    slug: text((d.slug as { current?: string })?.current),
    excerpt: text(d.excerpt),
    coverImage: image(d.coverImage),
    body: (Array.isArray(d.body) ? d.body : []).map((b) => {
      const block = b as Block & { asset?: unknown; alt?: string };
      return block._type === "image"
        ? {
            _type: "image",
            _key: block._key,
            image: image(block),
            caption: text(block.caption),
          }
        : block;
    }),
    displayDate: text(d.displayDate),
    category: text(d.category),
    featured: d.featured === true,
  }));
  const c = one("catalogue");
  const sections = (
    Array.isArray(composition.sections) ? composition.sections : []
  ) as (Section & { _key?: string; selectedContent?: { _ref: string }[] })[];
  return {
    publicationId,
    demo: s.demo !== false,
    settings,
    profile,
    stories,
    achievements: all("achievement").map((d) => ({
      ...common(d),
      title: text(d.title),
      year: text(d.year),
      description: text(d.description),
    })),
    gallery: all("galleryItem").map((d) => ({
      ...common(d),
      image: image(d.image),
      caption: text(d.caption),
      category: text(d.category),
    })),
    oriflame: all("oriflameProduct").map(product),
    recommendations: all("shopeeRecommendation").map(product),
    catalogue: {
      title: text(c?.title),
      periodLabel: text(c?.periodLabel),
      coverImage: image(c?.coverImage),
      catalogueUrl: text(c?.catalogueUrl),
      active: c?.active === true,
    },
    sections: sections.map((d) => ({
      id: d.id || d._key || d.type,
      type: d.type,
      enabled: d.enabled !== false,
      title: d.title,
      description: d.description,
      layout: d.layout === "compact" ? "compact" : "default",
      selectedIds:
        d.selectedContent?.map((r) => r._ref.replace(/^drafts\./, "")) ||
        d.selectedIds,
    })),
  };
}
export function validateContent(c: SiteContent) {
  const errors: string[] = [];
  if (!c.settings.siteName.trim()) errors.push("Nama website wajib diisi.");
  if (!c.profile.name.trim() || !c.profile.headline.trim())
    errors.push("Nama dan judul profil wajib diisi.");
  if (
    c.settings.whatsappNumber &&
    !/^[1-9]\d{7,14}$/.test(c.settings.whatsappNumber.replace(/[\s()+-]/g, ""))
  )
    errors.push("Nomor WhatsApp harus menggunakan kode negara.");
  const checkUrl = (v: string, label: string, hosts?: string[]) => {
    if (v && !safeUrl(v, hosts))
      errors.push(
        `${label}: gunakan URL HTTPS yang valid pada layanan yang sesuai.`,
      );
  };
  checkUrl(c.settings.instagramUrl, "Instagram", ["instagram.com"]);
  checkUrl(c.settings.oriflameStoreUrl, "Toko Oriflame", ["oriflame.com"]);
  checkUrl(c.catalogue.catalogueUrl, "Katalog", ["oriflame.com"]);
  const ids = new Set<string>();
  for (const p of [...c.oriflame, ...c.recommendations]) {
    if (!p.name.trim()) errors.push("Nama produk wajib diisi.");
    if (ids.has(p.id)) errors.push("ID produk duplikat.");
    ids.add(p.id);
    checkUrl(
      p.destinationUrl,
      p.name,
      c.oriflame.includes(p)
        ? ["oriflame.com"]
        : ["shopee.co.id", "shope.ee", "s.shopee.co.id"],
    );
    if (p.image.src && !p.image.alt.trim())
      errors.push(`Teks alternatif gambar ${p.name} wajib diisi.`);
  }
  const slugs = new Set<string>();
  for (const s of c.stories) {
    if (!s.title || !s.slug || !/^([a-z0-9]+-)*[a-z0-9]+$/.test(s.slug))
      errors.push("Judul dan slug cerita wajib valid.");
    if (slugs.has(s.slug)) errors.push("Slug cerita harus unik.");
    slugs.add(s.slug);
  }
  if (!c.sections.some((s) => s.enabled))
    errors.push("Aktifkan setidaknya satu bagian halaman.");
  if (new Set(c.sections.map((s) => s.type)).size !== c.sections.length)
    errors.push("Bagian halaman tidak boleh duplikat.");
  if (!c.demo) {
    if (!c.settings.whatsappNumber)
      errors.push("Isi nomor WhatsApp sebelum menonaktifkan pratinjau.");
    if (!c.profile.portrait.src || !c.profile.portrait.alt)
      errors.push("Lengkapi foto profil asli dan teks alternatif.");
    for (const p of [...c.oriflame, ...c.recommendations].filter(
      (p) => p.visible,
    ))
      if (!p.destinationUrl)
        errors.push(`Lengkapi tautan ${p.name} sebelum publikasi final.`);
  }
  return errors;
}
export function semanticDocuments(raw: SanityDocument[]) {
  return effectiveDocuments(raw).map((d) =>
    Object.fromEntries(
      Object.entries(d).filter(
        ([k]) => !["_rev", "_updatedAt", "_createdAt"].includes(k),
      ),
    ),
  );
}
export function summarizeChanges(
  raw: SanityDocument[],
  previous: SanityDocument[],
) {
  const current = semanticDocuments(raw),
    before = new Map(semanticDocuments(previous).map((d) => [d._id, d]));
  const changes: {
    id: string;
    type: string;
    title: string;
    kind: "baru" | "diubah" | "dihapus";
  }[] = [];
  for (const d of current) {
    const old = before.get(d._id);
    if (JSON.stringify(d) !== JSON.stringify(old))
      changes.push({
        id: String(d._id),
        type: String(d._type),
        title: text(d.title || d.name || d.siteName) || String(d._type),
        kind: old ? "diubah" : "baru",
      });
    before.delete(d._id);
  }
  for (const [id, d] of before)
    changes.push({
      id: String(id),
      type: String(d._type),
      title: text(d.title || d.name) || String(d._type),
      kind: "dihapus",
    });
  return changes;
}
