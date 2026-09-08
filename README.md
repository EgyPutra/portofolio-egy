# Liquid Portfolio

Portofolio React + TypeScript dengan background fluid particles dan pendekatan Liquid Glass untuk web.

## Menjalankan lokal

```bash
npm install
npm run dev
```

## Mengganti konten

Edit `src/content.ts` untuk mengganti nama, deskripsi, email, tautan sosial, dan daftar proyek. Ganti gambar di folder `public/` dengan aset proyek asli memakai nama file yang sama, atau ubah nilai `image` pada setiap proyek.

## Deploy ke Vercel

Import repository ke Vercel. Preset Vite akan terdeteksi otomatis dengan build command `npm run build` dan output directory `dist`.

## Catatan formulir

Formulir kontak membuka aplikasi email pengguna. Untuk pengiriman tanpa aplikasi email, sambungkan handler `submitContact` ke Formspree, Resend, atau Vercel Functions.
