import type { Metadata } from "next";
import { siteUrl } from "../../lib/content";
export const metadata: Metadata = {
  alternates: { canonical: siteUrl + "/privasi/" },
  title: "Informasi Privasi",
  description:
    "Bagaimana website Bisnis Bareng Nuri menangani informasi pengunjung.",
};
export default function Privacy() {
  return (
    <article className="shell legal-page">
      <p className="eyebrow">INFORMASI WEBSITE</p>
      <h1>Privasi, dengan jelas.</h1>
      <div className="prose">
        <p>
          Website ini memperkenalkan Nuri, menampilkan cerita, dan membagikan
          pilihan produk. Pengunjung tidak perlu membuat akun.
        </p>
        <h2>Data pengunjung</h2>
        <p>
          Website tidak memiliki formulir pengumpulan data pelanggan, checkout,
          pelacak iklan, atau analytics tambahan. Penyedia hosting dapat
          memproses informasi teknis seperti alamat IP dan log akses untuk
          keamanan dan pengoperasian layanan.
        </p>
        <h2>Tautan ke layanan lain</h2>
        <p>
          Jika Anda membuka WhatsApp, Instagram, Shopee, atau Oriflame,
          kebijakan privasi layanan tersebut berlaku. Pesan yang Anda kirim
          melalui WhatsApp diterima langsung di layanan itu, tidak disimpan di
          website ini.
        </p>
        <h2>Ruang pengelola</h2>
        <p>
          Pengelolaan konten menggunakan Sanity dan memerlukan akun yang
          berizin. Layanan tersebut menangani autentikasi serta penyimpanan
          konten dan gambar. Jangan memasukkan data pribadi pelanggan ke dalam
          konten website.
        </p>
        <h2>Penyimpanan di browser</h2>
        <p>
          Website publik tidak menyimpan profil pengunjung di browser. Studio
          dapat menyimpan sesi masuk serta ID permintaan publikasi agar proses
          pembaruan dapat dilanjutkan dengan aman.
        </p>
        <h2>Pertanyaan</h2>
        <p>
          Untuk pertanyaan mengenai konten atau privasi, hubungi Nuri melalui
          tombol Chat Nuri setelah nomor kontak tersedia.
        </p>
      </div>
    </article>
  );
}
