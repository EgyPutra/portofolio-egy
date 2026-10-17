import Link from "next/link";
import type { Metadata } from "next";
import {
  IconLock,
  IconArrowUpRight,
  IconBook2,
  IconLayoutDashboard,
  IconPhoto,
  IconRocket,
} from "@tabler/icons-react";
import { safeUrl } from "../../lib/utils";
export const metadata: Metadata = {
  title: "Ruang Pengelola",
  robots: { index: false, follow: false },
};
export default function Manage() {
  const studio = safeUrl(process.env.NEXT_PUBLIC_STUDIO_URL);
  return (
    <section className="shell manage-page">
      <div className="manage-icon">
        <IconLock size={28} stroke={1.4} />
      </div>
      <p className="eyebrow">KHUSUS PENGELOLA</p>
      <h1>Ruang berkarya Nuri.</h1>
      <p className="lead">
        Satu tempat untuk memperbarui cerita, memilih produk, dan menyiapkan
        kabar terbaru.
      </p>
      <div className="manage-panel">
        <div className="manage-title">
          <IconLayoutDashboard size={24} />
          <h2>Sanity Studio</h2>
          <span className="status-label">
            {studio ? "Siap dibuka" : "Menunggu konfigurasi"}
          </span>
        </div>
        <p>
          Dashboard menggunakan akun Sanity yang berizin. Konten disimpan
          sebagai draf hingga ditinjau dan diterbitkan bersama.
        </p>
        {studio ? (
          <a
            className="button primary"
            href={studio}
            target="_blank"
            rel="noopener noreferrer"
          >
            Masuk ke Studio <IconArrowUpRight size={18} />
          </a>
        ) : (
          <div className="info-box">
            <strong>Studio belum dihubungkan.</strong>
            <p>
              Pemilik teknis perlu mengatur proyek Sanity, pengendali publikasi,
              dan alamat Studio. Autentikasi serta publikasi produksi belum
              aktif.
            </p>
            <p>
              Petunjuk lengkap tersedia dalam dokumen SETUP dan Panduan Nuri
              pada paket source.
            </p>
          </div>
        )}
        <div className="manage-features">
          <div>
            <IconPhoto size={22} />
            <span>Profil, cerita, & gambar</span>
          </div>
          <div>
            <IconBook2 size={22} />
            <span>Produk & katalog</span>
          </div>
          <div>
            <IconRocket size={22} />
            <span>Pratinjau & publikasi</span>
          </div>
        </div>
      </div>
      <Link href="/" className="text-link">
        Kembali ke website
      </Link>
    </section>
  );
}
