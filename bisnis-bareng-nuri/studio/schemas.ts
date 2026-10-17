import { defineType, defineField, defineArrayMember } from "sanity";
import { safeUrl } from "../lib/utils";
const required = <T extends { required: () => T }>(r: T) => r.required();
const str = (name: string, title: string, needed = false) =>
  defineField({
    name,
    title,
    type: "string",
    validation: needed ? required : undefined,
  });
const txt = (name: string, title: string, needed = false) =>
  defineField({
    name,
    title,
    type: "text",
    rows: 4,
    validation: needed ? required : undefined,
  });
const link = (name: string, title: string, hosts?: string[]) =>
  defineField({
    name,
    title,
    type: "url",
    description:
      "Gunakan tautan HTTPS lengkap. Boleh kosong selama mode pratinjau.",
    validation: (r) =>
      r.custom((value) =>
        !value || safeUrl(value, hosts)
          ? true
          : "Gunakan URL HTTPS pada layanan yang sesuai.",
      ),
  });
const image = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "image",
    options: { hotspot: true, accept: "image/jpeg,image/png,image/webp" },
    description:
      "JPG, PNG, atau WebP, maksimal 8 MB. Atur titik fokus agar wajah tetap terlihat.",
    validation: (r) =>
      r.custom(async (value, context) => {
        const ref = (value as { asset?: { _ref?: string } })?.asset?._ref;
        if (!ref) return true;
        const client = context.getClient({ apiVersion: "2025-02-19" });
        const size = await client.fetch<number>("*[_id==$id][0].size", {
          id: ref,
        });
        return size > 8 * 1024 * 1024
          ? "Ukuran maksimal 8 MB. Kompres gambar dan unggah kembali."
          : true;
      }),
    fields: [
      defineField({
        name: "alt",
        title: "Teks alternatif",
        description: "Jelaskan isi gambar untuk pembaca layar.",
        type: "string",
        validation: (r) =>
          r.custom((value, ctx) =>
            !(ctx.parent as { asset?: unknown })?.asset || value
              ? true
              : "Isi teks alternatif gambar.",
          ),
      }),
      str("caption", "Keterangan foto"),
    ],
  });
const visibility = [
  defineField({
    name: "visible",
    title: "Tampilkan di website",
    type: "boolean",
    initialValue: true,
  }),
  defineField({
    name: "sortOrder",
    title: "Urutan tampilan",
    type: "number",
    initialValue: 0,
    validation: (r) => r.integer().min(0),
  }),
];
const featured = defineField({
  name: "featured",
  title: "Pilihan unggulan",
  type: "boolean",
  initialValue: false,
});
const category = defineField({
  name: "category",
  title: "Kategori",
  type: "string",
  options: {
    list: [
      "Rumah & keluarga",
      "Ruang kerja",
      "Perawatan diri",
      "Perawatan wajah",
      "Perawatan tubuh",
      "Kosmetik",
      "Wewangian",
      "Perjalanan",
      "Keseharian",
      "Komunitas",
    ],
  },
  validation: required,
});
const ordered = {
  orderings: [
    {
      title: "Urutan tampilan",
      name: "sortOrder",
      by: [{ field: "sortOrder", direction: "asc" as const }],
    },
  ],
};
const productFields = [
  str("name", "Nama produk", true),
  category,
  image("image", "Foto produk"),
  txt("recommendationNote", "Catatan rekomendasi", true),
  featured,
  ...visibility,
];
export const schemas = [
  defineType({
    name: "siteSettings",
    title: "Pengaturan & Kontak",
    type: "document",
    fields: [
      str("siteName", "Nama website", true),
      str("tagline", "Deskripsi singkat"),
      str("whatsappNumber", "Nomor WhatsApp (contoh format: 628...)"),
      txt("whatsappProductMessage", "Pesan untuk produk (gunakan {product})"),
      txt("whatsappBusinessMessage", "Pesan untuk bisnis"),
      link("instagramUrl", "Instagram", ["instagram.com"]),
      link("oriflameStoreUrl", "Toko Oriflame", ["oriflame.com"]),
      txt("affiliateDisclosure", "Keterangan afiliasi"),
      txt("seoDescription", "Deskripsi SEO", true),
      defineField({
        name: "themePreset",
        title: "Tema terkurasi",
        type: "string",
        options: {
          list: [
            { title: "Editorial netral", value: "editorial" },
            { title: "Rose lembut", value: "rose" },
          ],
        },
        initialValue: "editorial",
      }),
      defineField({
        name: "demo",
        title: "Mode pratinjau ilustrasi",
        type: "boolean",
        initialValue: true,
        description:
          "Nonaktifkan setelah foto, produk, nomor WhatsApp, dan tautan asli sudah ditinjau. Mode ini memberi label ilustrasi dan mematikan indeks mesin pencari.",
      }),
    ],
  }),
  defineType({
    name: "profile",
    title: "Profil Nuri",
    type: "document",
    fields: [
      str("name", "Nama", true),
      str("headline", "Judul utama beranda", true),
      txt("shortBio", "Pengantar singkat", true),
      txt("fullBio", "Biodata & cerita lengkap", true),
      image("portrait", "Foto profil utama"),
      image("aboutImage", "Foto pendamping tentang Nuri"),
    ],
  }),
  defineType({
    name: "story",
    title: "Cerita",
    type: "document",
    ...ordered,
    fields: [
      str("title", "Judul cerita", true),
      defineField({
        name: "slug",
        title: "Alamat cerita",
        type: "slug",
        options: { source: "title", maxLength: 90 },
        validation: required,
      }),
      txt("excerpt", "Ringkasan", true),
      category,
      image("coverImage", "Foto sampul"),
      defineField({
        name: "body",
        title: "Isi cerita",
        type: "array",
        of: [
          defineArrayMember({
            type: "block",
            styles: [
              { title: "Paragraf", value: "normal" },
              { title: "Subjudul", value: "h2" },
              { title: "Subjudul kecil", value: "h3" },
              { title: "Kutipan", value: "blockquote" },
            ],
            lists: [],
            marks: {
              decorators: [
                { title: "Tebal", value: "strong" },
                { title: "Miring", value: "em" },
              ],
              annotations: [],
            },
          }),
          defineArrayMember({
            ...image("image", "Foto tambahan"),
            name: undefined,
            type: "image",
          }),
        ],
        validation: required,
      }),
      defineField({
        name: "displayDate",
        title: "Tanggal (opsional)",
        type: "date",
      }),
      featured,
      ...visibility,
    ],
    preview: { select: { title: "title", media: "coverImage" } },
  }),
  defineType({
    name: "achievement",
    title: "Pencapaian & Perjalanan",
    type: "document",
    ...ordered,
    fields: [
      str("title", "Judul", true),
      str("year", "Tahun (opsional)"),
      txt("description", "Cerita singkat", true),
      ...visibility,
    ],
  }),
  defineType({
    name: "galleryItem",
    title: "Galeri Kegiatan",
    type: "document",
    ...ordered,
    fields: [
      image("image", "Foto kegiatan"),
      str("caption", "Keterangan foto", true),
      category,
      ...visibility,
    ],
    preview: { select: { title: "caption", media: "image" } },
  }),
  defineType({
    name: "oriflameProduct",
    title: "Produk Oriflame",
    type: "document",
    ...ordered,
    fields: [
      ...productFields,
      str("productCode", "Kode produk (opsional)"),
      link("shoppingUrl", "Tautan belanja Oriflame", ["oriflame.com"]),
      str("displayPrice", "Harga tampilan (opsional)"),
    ],
    preview: {
      select: { title: "name", subtitle: "category", media: "image" },
    },
  }),
  defineType({
    name: "shopeeRecommendation",
    title: "Rekomendasi Shopee",
    type: "document",
    ...ordered,
    fields: [
      ...productFields,
      link("destinationUrl", "Tautan Shopee", [
        "shopee.co.id",
        "shope.ee",
        "s.shopee.co.id",
      ]),
      defineField({
        name: "affiliate",
        title: "Tautan ini afiliasi",
        type: "boolean",
        initialValue: false,
      }),
    ],
    preview: {
      select: { title: "name", subtitle: "category", media: "image" },
    },
  }),
  defineType({
    name: "catalogue",
    title: "Katalog Oriflame",
    type: "document",
    fields: [
      str("title", "Judul katalog", true),
      str("periodLabel", "Periode katalog", true),
      image("coverImage", "Sampul katalog"),
      link("catalogueUrl", "Tautan katalog", ["oriflame.com"]),
      defineField({
        name: "active",
        title: "Tampilkan katalog",
        type: "boolean",
        initialValue: true,
      }),
    ],
  }),
  defineType({
    name: "category",
    title: "Kategori",
    type: "document",
    ...ordered,
    fields: [
      str("name", "Nama kategori", true),
      defineField({
        name: "slug",
        title: "Slug",
        type: "slug",
        options: { source: "name" },
        validation: required,
      }),
      defineField({
        name: "type",
        title: "Jenis",
        type: "string",
        options: { list: ["shopee", "oriflame", "cerita", "galeri"] },
        validation: required,
      }),
      ...visibility,
    ],
  }),
  defineType({
    name: "pageComposition",
    title: "Tampilan Halaman",
    type: "document",
    fields: [
      defineField({
        name: "pageKey",
        title: "Halaman",
        type: "string",
        initialValue: "home",
        readOnly: true,
      }),
      defineField({
        name: "sections",
        title: "Bagian beranda",
        type: "array",
        description:
          "Gunakan menu tiap bagian untuk memindahkan urutan, selain drag. Hero sebaiknya tetap pertama.",
        of: [
          defineArrayMember({
            name: "section",
            title: "Bagian",
            type: "object",
            fields: [
              defineField({
                name: "type",
                title: "Jenis bagian",
                type: "string",
                options: {
                  list: [
                    { title: "Hero", value: "hero" },
                    { title: "Tentang Nuri", value: "about" },
                    { title: "Perjalanan", value: "journey" },
                    { title: "Galeri", value: "gallery" },
                    { title: "Pilihan Oriflame", value: "oriflame" },
                    { title: "Rekomendasi Shopee", value: "recommendations" },
                    { title: "Ajakan menghubungi", value: "contact" },
                  ],
                },
                validation: required,
              }),
              defineField({
                name: "enabled",
                title: "Tampilkan bagian",
                type: "boolean",
                initialValue: true,
              }),
              str("title", "Judul pengganti (opsional)"),
              txt("description", "Deskripsi pengganti (opsional)"),
              defineField({
                name: "layout",
                title: "Variasi layout",
                type: "string",
                options: {
                  list: [
                    { title: "Lega", value: "default" },
                    { title: "Ringkas", value: "compact" },
                  ],
                },
                initialValue: "default",
              }),
              defineField({
                name: "selectedContent",
                title: "Konten pilihan (kosong = otomatis)",
                type: "array",
                of: [
                  defineArrayMember({
                    type: "reference",
                    weak: true,
                    to: [
                      { type: "story" },
                      { type: "oriflameProduct" },
                      { type: "shopeeRecommendation" },
                      { type: "galleryItem" },
                      { type: "achievement" },
                    ],
                  }),
                ],
              }),
            ],
            preview: { select: { title: "type", subtitle: "title" } },
          }),
        ],
        validation: (r) =>
          r
            .min(1)
            .max(7)
            .custom((v) =>
              !v ||
              new Set(v.map((x) => (x as { type: string }).type)).size ===
                v.length
                ? true
                : "Jenis bagian tidak boleh duplikat.",
            ),
      }),
    ],
  }),
];
