import type { Metadata } from "next";
import { content, siteUrl } from "../../lib/content";
export const metadata: Metadata = {
  alternates: { canonical: siteUrl + "/informasi/" },
  title: "Informasi & Afiliasi",
  description:
    "Keterangan tentang rekomendasi, tautan afiliasi, dan status konten website.",
};
export default function Info() {
  return (
    <article className="shell legal-page">
      <p className="eyebrow">TRANSPARANSI</p>
      <h1>Tentang pilihan di sini.</h1>
      <div className="prose">
        {content.demo && (
          <aside className="info-box">
            <h2>Website dalam pratinjau desain</h2>
            <p>
              Foto dan pilihan produk menggunakan materi ilustrasi dari ekspor
              desain yang diberikan. Foto perempuan pada halaman ini bukan foto
              asli Nuri. Nama produk, ketersediaan, katalog, dan tautan belanja
              perlu dikonfirmasi pemilik sebelum digunakan untuk berbelanja.
            </p>
          </aside>
        )}
        <h2>Rekomendasi & afiliasi</h2>
        <p>{content.settings.affiliateDisclosure}</p>
        <p>
          Label afiliasi dicantumkan pada item yang menggunakan tautan tersebut.
          Membuka tautan produk akan membawa Anda ke layanan pihak lain; website
          ini tidak memproses transaksi.
        </p>
        <h2>Harga & ketersediaan</h2>
        <p>
          Harga, pilihan, promo, dan stok mengikuti informasi terbaru pada toko
          tujuan. Konfirmasi produk Oriflame dan katalog kepada Nuri.
        </p>
        <h2>Cerita Nuri</h2>
        <p>
          Pengantar profil dan cerita diringkas dari website Nuri sebelumnya.
          Angka penghasilan, durasi pengalaman, informasi perusahaan lama, dan
          klaim penghargaan tidak diteruskan tanpa peninjauan.
        </p>
        <h2>Foto & dokumentasi</h2>
        <p>
          {content.demo
            ? "Foto dalam pratinjau merupakan ilustrasi dari referensi desain, bukan bukti kegiatan atau pencapaian Nuri. Foto dan deskripsi dapat diganti lewat Studio."
            : "Foto dan deskripsi dikelola Nuri melalui Studio."}
        </p>
      </div>
    </article>
  );
}
