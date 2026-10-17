import Link from "next/link";
import { IconArrowLeft, IconLeaf } from "@tabler/icons-react";
export default function NotFound() {
  return (
    <section className="shell not-found">
      <IconLeaf size={40} stroke={1.2} />
      <p className="eyebrow">HALAMAN TIDAK DITEMUKAN</p>
      <h1>
        Sepertinya kita
        <br />
        salah belok.
      </h1>
      <p>
        Halaman ini mungkin sudah pindah. Mari kembali dan temukan cerita
        lainnya.
      </p>
      <Link className="button primary" href="/">
        <IconArrowLeft size={18} />
        Kembali ke beranda
      </Link>
    </section>
  );
}
