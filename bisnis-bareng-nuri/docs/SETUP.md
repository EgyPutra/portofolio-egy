# Penyiapan CMS, hosting, dan domain

Status: repository GitHub `EgyPutra/portofolio-egy` tersedia. Source Nuri disiapkan di folder `bisnis-bareng-nuri` dalam draft PR. Sanity, Cloudflare, domain, serta Secrets/Variables deployment belum dikonfigurasi. Jangan mengirim token atau kata sandi melalui chat. Simpan token pada environment lokal, GitHub Secrets, atau `wrangler secret`.

## 1. Sanity

Buat proyek Sanity dan dataset `production`. Gunakan akun Administrator yang dipercaya untuk Nuri. Pada pemeriksaan 17 Oktober 2026, Free mencakup 20 seat, 2 dataset publik, dan peran Administrator/Viewer; peran Editor dan Content Releases tidak termasuk. Tidak ada janji peran editor terbatas pada paket ini.

Buat `studio/.env.local` (tidak dilacak Git):

```dotenv
SANITY_STUDIO_PROJECT_ID=<project-id>
SANITY_STUDIO_DATASET=production
SANITY_STUDIO_PUBLICATION_URL=https://<worker-domain>
```

Tambahkan `http://127.0.0.1:3333` dan URL Studio produksi ke Sanity API CORS origins dengan credentials. Jalankan `npm run studio`, masuk melalui alur login resmi Sanity. Build tanpa akun dapat diperiksa memakai ID valid secara format; koneksi ke proyek nyata baru dapat diuji setelah akun tersedia.

Isi konten lewat Studio, atau impor seed sebagai draf menggunakan environment terminal:

```sh
# Ekspor SANITY_PROJECT_ID, SANITY_DATASET dan SANITY_WRITE_TOKEN melalui pengelola secret Anda.
npm run seed:studio
```

Token seed memerlukan izin menulis dan upload. Token tidak diambil dari konfigurasi Studio. Seed tidak menimpa dokumen yang sudah ada, tetapi pengulangan dapat menambah aset duplikat. Tinjau penyimpanan aset sebelum mengulang. Token tidak diperlukan lagi setelah seeding.

Untuk hosting Studio, dari direktori studio jalankan `npx sanity deploy`. Atur hostname saat CLI meminta. Tambahkan URL yang dikembalikan ke CORS dan environment berikut. Formulir utama Indonesia; komponen bawaan CMS mengikuti locale Sanity yang tersedia.

## 2. Cloudflare Pages

Buat project **Direct Upload** (jangan aktifkan build Git otomatis atau webhook CMS). Gunakan branch produksi `main`. Project ini mengunggah static export `out/`, tanpa backend Next.js, ISR, Draft Mode, atau API route.

Set GitHub repository Variables:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_PAGES_PROJECT`
- `NEXT_PUBLIC_SITE_URL`: HTTPS domain produksi, tanpa slash akhir.
- `NEXT_PUBLIC_STUDIO_URL`: URL Studio produksi.
- `PUBLICATION_URL`: HTTPS Worker.

GitHub Secrets:

- `CLOUDFLARE_API_TOKEN`: token scoped ke akun/project yang memerlukan Pages Edit.
- `BUILD_READ_TOKEN`: secret acak kuat yang sama dengan Worker.

Paket source mandiri menyertakan `.github/workflows/publish.yml`. Pada repository `EgyPutra/portofolio-egy`, workflow aktif berada di `.github/workflows/nuri-publish.yml` dan memakai working directory `bisnis-bareng-nuri`. Merge PR setelah ditinjau agar workflow tersedia pada branch default. Repository privat mendapat kuota GitHub Actions sesuai akun; ini tambahan batas selain Cloudflare/Sanity. Jangan menjanjikan biaya nol pada penggunaan tak terbatas.

## 3. Pengendali publikasi

Isi `publication-worker/wrangler.jsonc` bagian `vars`:

- `SANITY_PROJECT_ID`, `SANITY_DATASET`
- `SANITY_ALLOWED_USER_IDS`: ID akun Sanity yang diizinkan menerbitkan, dipisah koma. Ini otorisasi server, bukan sekadar tombol tersembunyi. Jangan gunakan nama/email sebagai ID.
- `STUDIO_ORIGIN`: origin HTTPS Studio (tanpa slash/path).
- `GITHUB_REPOSITORY`: `owner/repo` source yang memiliki workflow.
- `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_PAGES_PROJECT`
- `PRODUCTION_URL`: domain yang akan memuat `publication.json`.

Deploy dari folder root:

```sh
npx wrangler secret put GITHUB_TOKEN --config publication-worker/wrangler.jsonc
npx wrangler secret put BUILD_READ_TOKEN --config publication-worker/wrangler.jsonc
npx wrangler secret put CLOUDFLARE_API_TOKEN --config publication-worker/wrangler.jsonc
npx wrangler deploy --config publication-worker/wrangler.jsonc
```

GitHub token: fine-grained, hanya repository tersebut, permission Contents: write untuk repository_dispatch; Actions: read untuk rekonsiliasi. Jangan menanam secret deployment pada Studio/public browser. Token sesi pengguna Sanity dipakai Studio pada request yang terautentikasi; Worker memvalidasi sesi ke Sanity dan memeriksa allowlist.

Durable Object SQLite tersedia pada Workers Free dengan kuota. Semua publikasi dipusatkan pada satu object untuk serialisasi. Tidak memerlukan rilis berbayar Sanity. Snapshot dan riwayat disimpan di storage Worker privat. Pantau storage; riwayat belum memiliki penghapusan otomatis agar pemulihan tetap tersedia.

## 4. Domain sendiri

Di Cloudflare Pages > Custom domains, tambahkan domain. Domain apex memerlukan zone Cloudflare sesuai petunjuk Pages; subdomain dapat memakai CNAME. Ikuti record yang ditampilkan dashboard, jangan menebak IP. Tunggu status domain dan sertifikat HTTPS aktif. Jangan menghapus record email/MX atau DNS lain.

Atur `PRODUCTION_URL` Worker dan `NEXT_PUBLIC_SITE_URL` GitHub ke domain itu. Terbitkan satu versi dan pastikan marker, canonical, sitemap, serta Open Graph menggunakan domain yang benar. Preview Sites tetap privat dan terpisah.

## 5. Sebelum website final

1. Ganti foto profil dan dokumentasi dengan aset Nuri yang sudah disetujui.
2. Tinjau cerita, produk, periode katalog, kategori, dan tautan eksternal.
3. Isi nomor WhatsApp format internasional, Instagram opsional, template pesan dan keterangan afiliasi.
4. Pastikan setiap item tampil memiliki nama, gambar/alt, catatan, dan tautan benar.
5. Uji login, izin akun lain, upload, dan skenario 20 draf pada akun nyata.
6. Matikan mode ilustrasi pada Pengaturan; validasi server akan meminta kontak/tautan final.
7. Terbitkan dan tunggu verifikasi produksi. Periksa isi privasi sesuai hosting final.

## Sumber yang diperiksa 17 Oktober 2026

- Sanity Free, peran, dataset dan kuota: https://www.sanity.io/pricing
- Draf dan akses dataset publik: https://www.sanity.io/docs/content-lake/keeping-your-data-safe
- Static export: https://nextjs.org/docs/app/guides/static-exports
- Cloudflare Pages Direct Upload CI: https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/
- Pages Free limits: https://developers.cloudflare.com/pages/platform/limits/ (termasuk 500 build/bulan pada alur build Pages; CI Direct Upload menggunakan runner eksternal dan tetap tunduk batas deployment/platform).
- Durable Objects limits: https://developers.cloudflare.com/durable-objects/platform/limits/

Kuota dan paket dapat berubah. Verifikasi kembali pada dashboard saat aktivasi.
