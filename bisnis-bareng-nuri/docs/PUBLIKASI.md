# Arsitektur publikasi

## Jalur data

1. Formulir menyimpan dokumen Sanity `drafts.<id>`. Aksi publish/unpublish/delete individual disembunyikan dari Studio; untuk menghapus tampilan, gunakan Sembunyikan.
2. Review mengambil dokumen melalui sesi pengguna terautentikasi. Overlay draf menggantikan dokumen dasar. Snapshot terakhir berhasil menjadi pembanding, sehingga draf tidak harus dipromosikan ke dataset publik.
3. POST `/publications` memvalidasi sesi Sanity dan allowlist server, mengambil konten satu kali, memvalidasi URL/data, lalu menyimpan snapshot immutable beserta idempotency key dan hash konten di Durable Object privat.
4. Permintaan aktif diblokir secara serial. Retry key yang sama mengembalikan ID yang sama. Klik dengan key lain saat ada publikasi aktif juga mengembalikan publikasi aktif.
5. Setelah state disimpan, satu repository_dispatch dikirim. Bila respons jaringan ambigu, **tidak** otomatis mengirim dispatch kedua.
6. Workflow mengklaim build berdasarkan publication ID + run ID. Claim kedua tidak melakukan build/upload lagi. Snapshot diambil menggunakan build secret melalui endpoint khusus, ditulis ke file, lalu Next export dibuat.
7. Upload ke project Pages Direct Upload. Status berhasil memerlukan respons penyedia Cloudflare `latest_stage.status = success`, environment production, dan publication ID yang sama pada `PRODUCTION_URL/publication.json`.
8. Worker baru menandai `succeeded` setelah kedua verifikasi. Draft edit selama proses tetap menjadi perubahan berikutnya.

Website publik tidak pernah mengakses CMS, token, atau draf. Konten dihasilkan dari satu snapshot. Sanity Free memiliki dataset publik, tetapi IDs `drafts.*` terlindungi dari akses anonim. Jangan menaruh data pelanggan di CMS; jangan menerbitkan dokumen draf manual di luar alur ini.

## Idempotensi & batas

Penyimpanan state dilakukan sebelum dispatch, dan sebelum build claim. Berkas snapshot disalin, tidak direferensikan dari objek yang masih berubah. Draf dan upload tidak memiliki webhook.

Normalnya satu publikasi menghasilkan satu build CI dan satu upload Pages. Kegagalan dapat membutuhkan percobaan baru. Tidak ada janji exactly-once atas seluruh layanan jaringan; respons ambigu sengaja menunggu rekonsiliasi agar tidak membuat duplikat.

Riwayat dan draf tidak dihapus otomatis. Mengganti referensi gambar draf tidak menghapus aset versi lama. Jangan membersihkan aset CMS secara manual sebelum meninjau referensi live.

## Pemulihan teknis

- **Build gagal sebelum upload:** callback mencatat failed. Snapshot lama tetap ada dan pointer live tidak berubah. Terbitkan ulang memakai key baru setelah memperbaiki penyebabnya.
- **Upload mungkin sudah berjalan / callback gagal:** status tetap building, karena kegagalan konfirmasi tidak membuktikan kegagalan deployment. Periksa run GitHub dan deployment Cloudflare, kemudian kirim ulang callback complete dengan ID yang sama; jangan upload ulang.
- **Dispatch ambigu:** periksa GitHub Actions apakah event telah diterima. Apabila belum ada build yang mengklaim publikasi, tombol Periksa status layanan menjalankan rekonsiliasi server. Server memeriksa Pages dan status GitHub; permintaan tanpa build baru dapat ditutup setelah setidaknya dua menit dan tidak ada run aktif yang cocok. Build yang terlambat tidak bisa mengklaim publikasi yang ditutup.
- **Proses terhenti setelah claim:** periksa Pages berdasarkan commit hash publication ID (tanpa hyphen, dipad 0 menjadi 40 karakter). Jika ada deployment sukses, lanjutkan callback verifikasi. Jika tidak ada deployment dan run sudah berakhir gagal, gunakan Periksa status layanan untuk mencatat failed melalui rekonsiliasi.

Token BUILD_READ_TOKEN boleh memanggil `/build/<id>/snapshot`, `/claim`, `/complete`; sesi Studio tidak dapat mengakses endpoint build. Secret berada pada Worker/GitHub. Endpoint pengguna `/review`, `/publications`, dan rekonsiliasi memerlukan sesi + allowlist.

## Verifikasi integrasi nyata yang masih diperlukan

Akun belum dikonfigurasi pada serah terima. Wajib uji login, CORS, izin, upload, 20 draft, snapshot, trigger CI, edit saat build, status deployment, domain/marker, kegagalan build, serta pemulihan respons ambigu menggunakan akun produksi/staging. Unit test hanya membuktikan logika lokal, bukan koneksi layanan.
