# Bisnis Bareng Nuri

Website personal Nuri berdasarkan PRD dan referensi Google Stitch. Next.js 16, React, TypeScript, Tailwind CSS; static export. Desain editorial burgundy, Fraunces + Geist yang dihosting sendiri, navigasi responsif, pencarian dan filter produk.

## Menjalankan

Node.js 22.13+ dan npm. Dari folder ini:

```sh
npm ci
npm run dev
```

Build statis dan uji hasilnya:

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm start
```

Hasil build berada di `out/`. Server lokal di http://127.0.0.1:3000.

## Yang tersedia

- Beranda dengan susunan bagian yang dapat dikonfigurasi, tentang, daftar cerita dan artikel, katalog Oriflame, rekomendasi Shopee, privasi, informasi afiliasi, halaman pengelola, dan 404.
- Search nama/catatan + filter kategori, pengurutan, keadaan kosong, gambar gagal, menu mobile, dialog kontak dengan konteks produk/bisnis.
- Sanity Studio nyata: skema Indonesia, upload/hotspot, draft CMS, daftar rekomendasi, ubah/gandakan/sembunyikan/naik/turun, formulir simpan & tambah lagi, review dan pratinjau desktop/mobile memakai komponen publik yang sama.
- Cloudflare Worker dengan SQLite Durable Object: otorisasi Sanity + allowlist server, snapshot beku, idempotency, satu publikasi aktif, riwayat tersimpan, verifikasi deployment Cloudflare dan marker versi produksi.
- Workflow GitHub Actions untuk mengambil satu snapshot, build, upload Pages, dan konfirmasi hasil. Tidak ada webhook pada penyimpanan draf atau upload gambar.

## Status data & integrasi

Website yang diserahkan memakai **mode pratinjau ilustrasi** dan `noindex`. Pengantar cerita diringkas dari website Nuri lama. Foto dan produk dari ekspor Stitch adalah ilustrasi, bukan bukti kegiatan atau foto asli Nuri. Foto arsip lama tidak disertakan dalam repository GitHub publik. Paket source unduhan menyertakan arsip untuk ditinjau pemilik. Angka pendapatan dan klaim lama tidak diteruskan.

Nomor WhatsApp, Instagram, tautan Shopee, katalog, serta toko Oriflame belum diberikan. Tindakan terkait menampilkan keterangan belum dikonfigurasi. Tidak ada tautan contoh yang menyamar sebagai tautan belanja.

**Sanity, Cloudflare Pages/Worker, domain, dan autentikasi produksi belum dikonfigurasi.** Repository GitHub yang disediakan adalah `EgyPutra/portofolio-egy`; proyek ditempatkan di folder `bisnis-bareng-nuri` melalui draft PR, dengan workflow publikasi pada root repository. Variables dan Secrets deployment belum diatur. Source Studio serta pengendali publikasi telah diimplementasikan dan dicek lokal. Pengujian dengan layanan nyata tetap memerlukan penyiapan akun. Halaman `/kelola/` bukan dashboard simulasi dan tidak mengklaim sesi masuk yang belum ada.

Hosting pratinjau pribadi melalui Sites berbeda dari target produksi Cloudflare Pages. Publikasi CMS mengarah ke Cloudflare Pages setelah konfigurasi, bukan ke pratinjau Sites.

## Panduan

- [Setup teknis, keamanan, dan domain](docs/SETUP.md)
- [Panduan singkat Nuri](docs/PANDUAN-NURI.md)
- [Arsitektur publikasi & pemulihan](docs/PUBLIKASI.md)
- [Hasil pemeriksaan](docs/VERIFIKASI.md)

## Struktur

`app/` halaman Next; `components/` UI publik; `content/` seed ilustrasi dan snapshot terakhir; `lib/` model/normalisasi/validasi; `studio/` Sanity; `publication-worker/` layanan publikasi; `scripts/` build/seed/CI; `tests/` perilaku penting.

Website publik hanya membaca `content/published.json` pada waktu build, dengan seed eksplisit bila belum ada publikasi. Website tidak mengambil draf CMS. Jangan memasukkan token ke `NEXT_PUBLIC_*` atau `SANITY_STUDIO_*`.
