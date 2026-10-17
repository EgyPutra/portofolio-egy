import type { SiteContent, Block, Product } from "../lib/types";
const photo = (name: string, alt: string) => ({
  src: `/images/${name}.webp`,
  alt,
});
const body = (...paragraphs: string[]): Block[] =>
  paragraphs.map((text, i) => ({
    _type: "block",
    _key: `p${i}`,
    style: "normal",
    children: [{ _type: "span", text }],
  }));
const product = (
  id: string,
  name: string,
  category: string,
  image: string,
  note: string,
  order: number,
): Product => ({
  id,
  name,
  category,
  image: photo(image, `${name}, foto ilustrasi dari referensi desain`),
  recommendationNote: note,
  destinationUrl: "",
  affiliate: false,
  featured: order < 4,
  visible: true,
  sortOrder: order,
});
export const seed: SiteContent = {
  publicationId: "design-preview",
  demo: true,
  settings: {
    siteName: "Bisnis Bareng Nuri",
    tagline: "Cerita, kesempatan, dan pilihan sehari-hari.",
    whatsappNumber: "",
    whatsappProductMessage: "Halo Nuri, aku ingin bertanya tentang {product}.",
    whatsappBusinessMessage:
      "Halo Nuri, aku ingin mengenal bisnis dari rumah lebih dekat.",
    instagramUrl: "",
    oriflameStoreUrl: "",
    affiliateDisclosure:
      "Sebagian tautan yang berlabel afiliasi dapat memberikan komisi kepada Nuri, tanpa biaya tambahan untuk Anda. Harga dan ketersediaan mengikuti informasi di toko tujuan.",
    themePreset: "editorial",
    seoDescription:
      "Kenali Nuri, cerita membangun bisnis dari rumah, pilihan Oriflame, dan rekomendasi untuk keseharian.",
  },
  profile: {
    name: "Nuri",
    headline: "Bertumbuh dari rumah, bersama Nuri.",
    shortBio:
      "Cerita usaha, ruang untuk bertumbuh, dan pilihan kecil yang menemani keseharian.",
    fullBio:
      "Halo, aku Nuri. Aku seorang ibu rumah tangga yang memilih untuk terus berkarya dari rumah. Perjalananku mengenal bisnis dimulai sejak kuliah, dari keinginan sederhana untuk belajar mandiri.\n\nLewat bisnis, aku menemukan banyak hal di luar pekerjaan: kesempatan belajar berbicara di depan orang, merawat diri, dan bertemu teman-teman baru.\n\nDi ruang kecil ini, aku berbagi cerita perjalanan, pilihan produk, dan hal-hal yang membuat keseharian terasa lebih berarti. Senang bisa berkenalan denganmu.",
    portrait: photo(
      "portrait",
      "Foto ilustrasi perempuan bekerja dari rumah; bukan foto asli Nuri",
    ),
    aboutImage: photo(
      "workspace",
      "Meja kerja di rumah dengan buku catatan dan laptop",
    ),
  },
  stories: [
    {
      id: "story-start",
      title: "Langkah kecil yang dimulai sejak kuliah",
      slug: "langkah-kecil-sejak-kuliah",
      excerpt:
        "Keinginan untuk belajar mandiri menjadi awal perjalananku mengenal bisnis.",
      coverImage: photo("workspace", "Buku catatan terbuka di meja kerja"),
      body: body(
        "Aku mulai mengenal bisnis saat masih kuliah. Saat itu, keinginanku sederhana: belajar mandiri dan mencoba sesuatu yang bisa dikerjakan di sela kegiatan sehari-hari.",
        "Banyak hal terasa baru. Aku belajar mengenal produk, berkomunikasi dengan orang lain, dan pelan-pelan menemukan cara bekerja yang cocok untukku.",
        "Perjalanan ini juga mempertemukanku dengan ruang belajar dan komunitas. Dari sana, aku belajar bahwa bertumbuh tidak selalu harus dimulai dengan langkah besar.",
        "Catatan ini diringkas dari cerita Nuri di website sebelumnya. Detail perjalanan dan foto akan dilengkapi kembali oleh Nuri.",
      ),
      category: "Perjalanan",
      featured: true,
      visible: true,
      sortOrder: 0,
    },
    {
      id: "story-home",
      title: "Menemukan arti berkarya di sela waktu rumah tangga",
      slug: "berkarya-dari-rumah",
      excerpt:
        "Rumah menjadi tempat menjalani peran keluarga sekaligus merawat keinginan untuk terus belajar.",
      coverImage: photo(
        "daily-moment",
        "Foto ilustrasi suasana berkarya dari rumah",
      ),
      body: body(
        "Bekerja dari rumah adalah bagian dari cerita yang aku bagikan. Aku ingin tetap punya ruang berkarya sambil menjalani peran sebagai ibu rumah tangga.",
        "Media sosial membantu membuka percakapan dan memperkenalkan produk. Dalam prosesnya, aku juga belajar mengatur waktu dan mengenali ritme keseharian sendiri.",
        "Tidak semua hari berjalan sama. Ada waktu untuk pekerjaan, ada waktu untuk keluarga, dan selalu ada kesempatan untuk belajar lagi.",
        "Tulisan pengantar berdasarkan cerita di website lama. Nuri dapat menambahkan pengalaman terbaru melalui dashboard.",
      ),
      category: "Keseharian",
      featured: true,
      visible: true,
      sortOrder: 1,
    },
    {
      id: "story-together",
      title: "Bertemu, belajar, dan bertumbuh bersama",
      slug: "belajar-bersama-komunitas",
      excerpt:
        "Tentang kesempatan mengembangkan diri dan pertemanan yang tumbuh lewat komunitas.",
      coverImage: photo(
        "community",
        "Foto ilustrasi perempuan berkumpul dan berbagi cerita",
      ),
      body: body(
        "Salah satu hal yang aku syukuri dari perjalanan ini adalah kesempatan mengenal orang-orang baru. Komunitas menjadi tempat bertanya, mendengar pengalaman, dan saling mendukung.",
        "Aku belajar banyak hal, termasuk merawat diri dan berbicara di depan orang lain. Hal-hal yang dulu terasa asing perlahan menjadi bagian dari proses bertumbuh.",
        "Setiap orang punya perjalanan berbeda. Untukku, memiliki teman belajar membuat prosesnya terasa lebih hangat.",
        "Foto pada pratinjau adalah ilustrasi dari referensi desain. Dokumentasi kegiatan asli akan ditambahkan oleh Nuri.",
      ),
      category: "Komunitas",
      featured: true,
      visible: true,
      sortOrder: 2,
    },
  ],
  achievements: [
    {
      id: "journey-1",
      title: "Mulai saat kuliah",
      description:
        "Berangkat dari keinginan untuk belajar mandiri, aku mulai mengenal dunia bisnis.",
      visible: true,
      sortOrder: 0,
    },
    {
      id: "journey-2",
      title: "Belajar dan bertumbuh",
      description:
        "Mengenal produk, mengembangkan diri, dan menemukan teman belajar dalam komunitas.",
      visible: true,
      sortOrder: 1,
    },
    {
      id: "journey-3",
      title: "Berkarya dari rumah",
      description:
        "Merawat ruang untuk keluarga, sambil terus menjalani hal yang aku sukai.",
      visible: true,
      sortOrder: 2,
    },
  ],
  gallery: [
    {
      id: "gallery-1",
      image: photo(
        "community",
        "Ilustrasi suasana berbagi cerita bersama komunitas",
      ),
      caption: "Ruang untuk berbagi dan saling mendukung.",
      category: "Komunitas",
      visible: true,
      sortOrder: 0,
    },
    {
      id: "gallery-2",
      image: photo(
        "beauty-flatlay",
        "Ilustrasi produk perawatan dan kosmetik di atas meja",
      ),
      caption: "Mengenal hal-hal yang menemani keseharian.",
      category: "Perawatan diri",
      visible: true,
      sortOrder: 1,
    },
    {
      id: "gallery-3",
      image: photo("daily-moment", "Ilustrasi aktivitas bekerja dari rumah"),
      caption: "Sela waktu untuk berkarya dari rumah.",
      category: "Keseharian",
      visible: true,
      sortOrder: 2,
    },
  ],
  oriflame: [
    product(
      "ori-1",
      "Giordani Gold Serum Boost Foundation",
      "Kosmetik",
      "foundation",
      "Pilihan riasan untuk melengkapi rutinitas harian. Tanyakan pilihan warna yang tersedia.",
      0,
    ),
    product(
      "ori-2",
      "NovAge Skin Care",
      "Perawatan wajah",
      "skincare",
      "Temukan pilihan perawatan wajah yang sesuai dengan kebutuhanmu bersama Nuri.",
      1,
    ),
    product(
      "ori-3",
      "Tender Care Protecting Balm",
      "Perawatan tubuh",
      "balm",
      "Kemasan mungil yang praktis untuk menemani aktivitas sehari-hari.",
      2,
    ),
    product(
      "ori-4",
      "Amber Elixir Eau de Parfum",
      "Wewangian",
      "perfume",
      "Pilihan wewangian untuk momen sehari-hari maupun kesempatan istimewa.",
      3,
    ),
  ],
  recommendations: [
    product(
      "shopee-1",
      "Playmat lipat untuk sudut keluarga",
      "Rumah & keluarga",
      "playmat",
      "Sudut bermain yang nyaman, mudah dirapikan, dan menyatu dengan suasana rumah.",
      0,
    ),
    product(
      "shopee-2",
      "Lampu meja teman membaca",
      "Ruang kerja",
      "lamp",
      "Sentuhan hangat untuk waktu membaca dan mencatat ide di penghujung hari.",
      1,
    ),
    product(
      "shopee-3",
      "Organizer meja serbaguna",
      "Ruang kerja",
      "organizer",
      "Membantu merapikan benda-benda kecil agar meja terasa lebih lega.",
      2,
    ),
    product(
      "shopee-4",
      "Perlengkapan perawatan harian",
      "Perawatan diri",
      "beauty-flatlay",
      "Pilihan kecil untuk melengkapi waktu merawat diri di rumah.",
      3,
    ),
    product(
      "shopee-hidden",
      "Produk tersembunyi",
      "Rumah & keluarga",
      "playmat",
      "Item ini untuk pengujian dan tidak ditampilkan.",
      8,
    ),
  ].map((p) => (p.id === "shopee-hidden" ? { ...p, visible: false } : p)),
  catalogue: {
    title: "Katalog Oriflame",
    periodLabel: "Katalog terbaru dari Nuri",
    coverImage: photo(
      "skincare",
      "Ilustrasi pilihan produk perawatan Oriflame",
    ),
    catalogueUrl: "",
    active: true,
  },
  sections: [
    { id: "hero", type: "hero", enabled: true, layout: "default" },
    { id: "about", type: "about", enabled: true, layout: "default" },
    { id: "journey", type: "journey", enabled: true, layout: "default" },
    { id: "gallery", type: "gallery", enabled: true, layout: "default" },
    { id: "oriflame", type: "oriflame", enabled: true, layout: "default" },
    {
      id: "recommendations",
      type: "recommendations",
      enabled: true,
      layout: "default",
    },
    { id: "contact", type: "contact", enabled: true, layout: "default" },
  ],
};
