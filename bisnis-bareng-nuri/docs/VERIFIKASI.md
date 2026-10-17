# Hasil verifikasi

Dijalankan 17 Oktober 2026, build produksi lokal. Tidak ada hasil integrasi layanan yang disimulasikan sebagai sukses.

| Pemeriksaan                                 | Hasil                                                          |
| ------------------------------------------- | -------------------------------------------------------------- |
| TypeScript website + Sanity Studio + Worker | Lulus                                                          |
| ESLint seluruh source aplikasi              | Lulus, tanpa warning                                           |
| Unit test perilaku penting                  | 11/11 lulus                                                    |
| Next.js static export                       | Lulus; 16 route termasuk metadata dan tiga artikel             |
| Sanity Studio build                         | Lulus; ID proyek uji hanya untuk kompilasi, bukan koneksi akun |
| Cloudflare Worker dry-run                   | Lulus; 27.12 KiB, tanpa deployment                             |
| Lighthouse mobile: Performance              | **97**                                                         |
| Lighthouse mobile: Accessibility            | **100**                                                        |
| Lighthouse mobile: Best Practices           | **100**                                                        |
| Lighthouse mobile: SEO                      | **69**, noindex pratinjau disengaja                            |
| Largest Contentful Paint                    | 2.7 detik, emulasi mobile Lighthouse                           |
| Cumulative Layout Shift                     | **0**                                                          |
| Audit rekomendasi di viewport 768 × 800     | Accessibility 100, Best Practices 100, SEO 69                  |

Laporan JSON nyata: `lighthouse-mobile.json` dan `lighthouse-rekomendasi-tablet.json`. Angka adalah pengukuran lokal dengan Chrome headless/Lighthouse 13.5.0, bukan jaminan performa seluruh perangkat atau jaringan. Target performa dan aksesibilitas terpenuhi. Target SEO 95 belum berlaku pada pratinjau yang sengaja tidak diindeks; uji ulang setelah konten final, domain, dan indeks diaktifkan.

## Pemeriksaan browser

- Hero dan CTA terlihat pada laptop 1280 × 800.
- Tidak ada overflow horizontal pada lebar CSS 360, 390, 1280, 1440, serta di kedua sisi breakpoint tablet (767 dan 769). IAB memakai zoom 80%; ukuran CSS diukur dari DOM. Lighthouse halaman rekomendasi memakai ukuran tepat 768 × 800.
- Halaman tentang, daftar cerita, artikel, Oriflame, privasi, informasi, pengelola, dan 404 dibuka pada mobile; judul dan layout terverifikasi.
- Menu mobile terbuka, tautan menuju rekomendasi bekerja dan menu menutup setelah navigasi.
- Pencarian `LAMPU` + kategori Ruang kerja menghasilkan satu item; kategori Rumah & keluarga menghasilkan keadaan kosong; Hapus filter mengembalikan empat item. Item tersembunyi tidak tampil.
- Tombol tautan belanja belum diatur menampilkan penjelasan yang benar; Escape menutup dialog.
- Bundle publik diperiksa: tidak mengandung nama secret deployment atau namespace draf CMS. Arsip foto lama tidak berada pada output publik.

## Unit test

Mencakup 20 draf + perubahan foto, snapshot immutable, idempotensi dan permintaan aktif, build claim, konfirmasi yang memerlukan verifikasi, pemulihan gagal, hash stabil, otorisasi sesi/allowlist, kombinasi pencarian/kategori, URL berbahaya dan pesan WhatsApp, overlay draf, serta validasi publikasi final. Test otorisasi memakai respons Sanity mock; bukan login akun nyata.

## Batas integrasi

Akses repository GitHub tersedia dan source disiapkan sebagai draft PR. Proyek Sanity, Cloudflare Pages/Worker, Secrets/Variables, domain produksi, nomor WhatsApp, dan tautan belanja final belum dikonfigurasi. Login akun nyata, upload dataset nyata, trigger CI, serta publikasi CMS ke Pages belum diuji. Sanity build memakai project ID uji hanya untuk membuktikan bundel dapat dikompilasi.

Pratinjau privat Sites adalah pengiriman desain dan website publik secara fungsional, terpisah dari aktivasi CMS/Pages milik pengguna. Canonical/OG/sitemap memakai alamat pratinjau secara default; `NEXT_PUBLIC_SITE_URL` menggantinya pada build produksi.
