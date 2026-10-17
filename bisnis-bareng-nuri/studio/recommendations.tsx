import { useEffect, useRef, useState } from "react";
import { useClient, useCurrentUser } from "sanity";
import { IntentLink } from "sanity/router";
import {
  effectiveDocuments,
  photoFrom,
  type SanityDocument,
} from "../lib/sanity-content";
import { safeUrl } from "../lib/utils";
import "./studio.css";
type Item = SanityDocument & {
  name: string;
  category: string;
  recommendationNote: string;
  destinationUrl: string;
  affiliate: boolean;
  featured: boolean;
  visible: boolean;
  sortOrder: number;
  image?: {
    _type: string;
    asset: { _type: string; _ref: string };
    alt: string;
  };
};
const blank = (): Item => ({
  _id: crypto.randomUUID(),
  _type: "shopeeRecommendation",
  name: "",
  category: "Rumah & keluarga",
  recommendationNote: "",
  destinationUrl: "",
  affiliate: false,
  featured: false,
  visible: true,
  sortOrder: 0,
});
export function RecommendationsTool() {
  const client = useClient({ apiVersion: "2025-02-19" });
  const user = useCurrentUser();
  const recoveryKey = user?.id
    ? `nuri-unsaved:${client.config().projectId}:${user.id}`
    : "";
  const recover = (): Item | null => {
    if (!recoveryKey || typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem(recoveryKey);
      const item = raw ? JSON.parse(raw) : null;
      return item?._type === "shopeeRecommendation" ? item : null;
    } catch {
      return null;
    }
  };
  const [items, setItems] = useState<Item[]>([]);
  const [drafts, setDrafts] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [status, setStatus] = useState("Semua");
  const [form, setForm] = useState<Item | null>(recover);
  const [dirty, setDirty] = useState(() => Boolean(recover()));
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(() =>
    recover()
      ? "Formulir yang belum disimpan dipulihkan dari browser. Simpan draf untuk menyimpannya ke CMS."
      : "",
  );
  const [loading, setLoading] = useState(true);
  const original = useRef<Item | null>(null);
  const categories = ["Rumah & keluarga", "Ruang kerja", "Perawatan diri"];
  useEffect(() => {
    if (!recoveryKey) return;
    try {
      if (form && dirty)
        sessionStorage.setItem(recoveryKey, JSON.stringify(form));
      else sessionStorage.removeItem(recoveryKey);
    } catch {
      console.warn(
        "Pemulihan formulir sementara tidak tersedia pada browser ini.",
      );
    }
  }, [recoveryKey, form, dirty]);
  async function load() {
    try {
      const raw = await client
        .withConfig({ perspective: "raw", useCdn: false })
        .fetch<Item[]>('*[_type=="shopeeRecommendation"]');
      setDrafts(
        raw
          .filter((d) => d._id.startsWith("drafts."))
          .map((d) => d._id.replace(/^drafts\./, "")),
      );
      setItems(
        (effectiveDocuments(raw) as Item[]).sort(
          (a, b) => a.sortOrder - b.sortOrder,
        ),
      );
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });
  useEffect(() => {
    void loadRef.current();
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const prevent = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", prevent);
    return () => window.removeEventListener("beforeunload", prevent);
  }, [dirty]);
  function edit(item: Item) {
    if (
      dirty &&
      !window.confirm("Ada perubahan belum tersimpan. Tinggalkan perubahan?")
    )
      return;
    setForm(structuredClone(item));
    original.current = structuredClone(item);
    setDirty(false);
    setError("");
    setNotice("");
  }
  function change(patch: Partial<Item>) {
    setForm((f) => (f ? { ...f, ...patch } : null));
    setDirty(true);
  }
  async function save(next = false) {
    if (!form) return;
    setError("");
    if (!form.name.trim() || !form.recommendationNote.trim()) {
      setError("Nama dan catatan rekomendasi wajib diisi.");
      return;
    }
    if (
      form.destinationUrl &&
      !safeUrl(form.destinationUrl, [
        "shopee.co.id",
        "shope.ee",
        "s.shopee.co.id",
      ])
    ) {
      setError("Gunakan URL HTTPS Shopee yang valid.");
      return;
    }
    if (form.image?.asset && !form.image.alt?.trim()) {
      setError("Isi teks alternatif untuk foto produk.");
      return;
    }
    setBusy(true);
    try {
      const { _rev, _createdAt, _updatedAt, ...data } = form;
      void _createdAt;
      void _updatedAt;
      const draftId = "drafts." + form._id;
      const exists = await client.getDocument<Item>(draftId);
      if (
        exists &&
        original.current?._rev &&
        exists._rev !== original.current._rev
      )
        throw new Error(
          "Draf telah diubah di tempat lain. Muat ulang sebelum menyimpan.",
        );
      if (exists) {
        await client
          .patch(draftId)
          .ifRevisionId(exists._rev!)
          .set(
            Object.fromEntries(
              Object.entries(data).filter(([k]) => !k.startsWith("_")),
            ),
          )
          .commit();
      } else {
        await client.create({ ...data, _id: draftId });
      }
      setDirty(false);
      setNotice("Draf tersimpan. Website publik belum berubah.");
      await load();
      if (next) {
        const fresh = blank();
        fresh.sortOrder = items.length;
        setForm(fresh);
        original.current = null;
      } else {
        setForm(null);
        original.current = null;
      }
      void _rev;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function upload(file?: File) {
    if (!file || !form) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 8 * 1024 * 1024
    ) {
      setError("Gunakan JPG, PNG, atau WebP maksimal 8 MB.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const asset = await client.assets.upload("image", file, {
        filename: file.name,
      });
      change({
        image: {
          _type: "image",
          asset: { _type: "reference", _ref: asset._id },
          alt: form.image?.alt || "",
        },
      });
    } catch {
      setError(
        "Upload belum berhasil. Periksa koneksi dan coba pilih gambar kembali.",
      );
    } finally {
      setUploading(false);
    }
  }
  async function draftPatch(item: Item, patch: Partial<Item>) {
    const id = "drafts." + item._id;
    const doc = await client.getDocument<Item>(id);
    const { _rev, _createdAt, _updatedAt, ...data } = item;
    void _rev;
    void _createdAt;
    void _updatedAt;
    if (doc) await client.patch(id).ifRevisionId(doc._rev!).set(patch).commit();
    else await client.create({ ...data, ...patch, _id: id });
  }
  async function action(
    item: Item,
    kind: "duplicate" | "hide" | "up" | "down",
  ) {
    setBusy(true);
    try {
      if (kind === "duplicate") {
        const { _rev, _createdAt, _updatedAt, ...data } = item;
        void _rev;
        void _createdAt;
        void _updatedAt;
        await client.create({
          ...data,
          _id: "drafts." + crypto.randomUUID(),
          name: item.name + " (salinan)",
          sortOrder: items.length,
        });
        setNotice("Salinan ditambahkan sebagai draf.");
      } else if (kind === "hide") {
        await draftPatch(item, { visible: item.visible === false });
        setNotice("Status tampilan disimpan sebagai draf.");
      } else {
        const index = items.findIndex((i) => i._id === item._id);
        const other = items[index + (kind === "up" ? -1 : 1)];
        if (!other) return;
        const reordered = [...items];
        [reordered[index], reordered[index + (kind === "up" ? -1 : 1)]] = [
          other,
          item,
        ];
        let tx = client.transaction();
        for (let i = 0; i < reordered.length; i++) {
          const d = reordered[i];
          const id = "drafts." + d._id;
          const { _rev, _createdAt, _updatedAt, ...fields } = d;
          void _rev;
          void _createdAt;
          void _updatedAt;
          tx = tx.createIfNotExists({ ...fields, _id: id });
          tx = tx.patch(id, (p) => p.set({ sortOrder: i }));
        }
        await tx.commit();
        setNotice("Urutan disimpan sebagai draf.");
      }
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const visible = items.filter(
    (p) =>
      (category === "Semua" || p.category === category) &&
      (status === "Semua" ||
        (status === "Tersembunyi"
          ? p.visible === false
          : status === "Draf"
            ? drafts.includes(p._id)
            : p.visible !== false)) &&
      `${p.name} ${p.recommendationNote}`
        .toLocaleLowerCase("id")
        .includes(query.toLocaleLowerCase("id")),
  );
  const photo = form?.image
    ? photoFrom(
        form.image,
        client.config().projectId!,
        client.config().dataset!,
      )
    : null;
  return (
    <div className="nuri-studio">
      <header className="studio-heading">
        <p>REKOMENDASI SHOPEE</p>
        <h1>Pilihan untuk dibagikan.</h1>
        <span>
          Tambah, atur, dan simpan. Semua perubahan tetap menjadi draf.
        </span>
      </header>
      {notice && (
        <p role="status" className="studio-success">
          {notice}
        </p>
      )}
      {error && (
        <div role="alert" className="studio-alert">
          {error}
          <button onClick={() => void load()}>Muat ulang daftar</button>
        </div>
      )}
      {form ? (
        <section className="studio-panel">
          <h2>
            {items.some((i) => i._id === form._id)
              ? "Ubah rekomendasi"
              : "Tambah rekomendasi"}
          </h2>
          <p>
            {dirty ? "Ada perubahan belum tersimpan." : "Formulir siap diisi."}
          </p>
          <div className="studio-form">
            <label>
              Nama produk
              <input
                value={form.name}
                onChange={(e) => change({ name: e.target.value })}
                required
              />
            </label>
            <label>
              Kategori
              <select
                value={form.category}
                onChange={(e) => change({ category: e.target.value })}
              >
                {[
                  ...new Set([...categories, ...items.map((i) => i.category)]),
                ].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              Catatan rekomendasi
              <textarea
                value={form.recommendationNote}
                onChange={(e) => change({ recommendationNote: e.target.value })}
                rows={4}
                required
              />
            </label>
            <label>
              Tautan Shopee
              <input
                type="url"
                value={form.destinationUrl}
                onChange={(e) => change({ destinationUrl: e.target.value })}
              />
              <small>
                HTTPS pada shopee.co.id, shope.ee, atau s.shopee.co.id. Kosong
                berarti tautan belum dikonfigurasi.
              </small>
            </label>
            <label>
              {form.image ? "Ganti foto produk" : "Foto produk"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploading}
                onChange={(e) => void upload(e.target.files?.[0])}
              />
              <small>JPG, PNG, atau WebP, maksimal 8 MB.</small>
            </label>
            {uploading && <p role="status">Mengunggah foto, mohon tunggu...</p>}
            {photo?.src && (
              <img
                src={photo.src}
                alt={photo.alt || "Pratinjau foto produk"}
                className="upload-preview"
              />
            )}
            {form.image && (
              <label>
                Teks alternatif gambar
                <input
                  value={form.image.alt || ""}
                  onChange={(e) =>
                    change({ image: { ...form.image!, alt: e.target.value } })
                  }
                  required
                />
              </label>
            )}
            <label className="studio-check">
              <input
                type="checkbox"
                checked={form.affiliate}
                onChange={(e) => change({ affiliate: e.target.checked })}
              />
              Tautan afiliasi
            </label>
            <label className="studio-check">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => change({ featured: e.target.checked })}
              />
              Pilihan unggulan
            </label>
            <label className="studio-check">
              <input
                type="checkbox"
                checked={form.visible}
                onChange={(e) => change({ visible: e.target.checked })}
              />
              Tampilkan setelah diterbitkan
            </label>
          </div>
          <div className="studio-form-actions">
            <button
              className="studio-primary"
              disabled={busy || uploading}
              onClick={() => void save()}
            >
              {busy ? "Menyimpan..." : "Simpan draf"}
            </button>
            <button
              disabled={busy || uploading}
              onClick={() => void save(true)}
            >
              Simpan & tambah lagi
            </button>
            <button
              onClick={() => {
                if (
                  dirty &&
                  !window.confirm("Tinggalkan perubahan yang belum tersimpan?")
                )
                  return;
                setForm(null);
                setDirty(false);
              }}
            >
              Kembali
            </button>
          </div>
          <p className="studio-help">
            Simpan draf, lalu buka Ringkasan & Publikasi untuk memeriksa
            pratinjau bersama perubahan lainnya.
          </p>
        </section>
      ) : (
        <>
          <div className="studio-list-toolbar">
            <label>
              Cari rekomendasi
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nama atau catatan"
              />
            </label>
            <label>
              Kategori
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {["Semua", ...new Set(items.map((p) => p.category))].map(
                  (c) => (
                    <option key={c}>{c}</option>
                  ),
                )}
              </select>
            </label>
            <label>
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {["Semua", "Draf", "Ditampilkan", "Tersembunyi"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <button
              className="studio-primary"
              onClick={() => {
                const p = blank();
                p.sortOrder = items.length;
                edit(p);
              }}
            >
              Tambah rekomendasi
            </button>
          </div>
          {loading ? (
            <p role="status">Memuat rekomendasi...</p>
          ) : visible.length ? (
            <div className="recommendation-list">
              {visible.map((p) => {
                const img = p.image
                  ? photoFrom(
                      p.image,
                      client.config().projectId!,
                      client.config().dataset!,
                    )
                  : null;
                return (
                  <article key={p._id}>
                    {img?.src ? (
                      <img src={img.src} alt={img.alt} />
                    ) : (
                      <span className="studio-image-placeholder">Foto</span>
                    )}
                    <div>
                      <h3>{p.name}</h3>
                      <p>{p.category}</p>
                      <span className="studio-tag">
                        {p.visible === false
                          ? "Tersembunyi"
                          : drafts.includes(p._id)
                            ? "Draf"
                            : "Tersimpan"}
                      </span>
                    </div>
                    <div className="row-actions">
                      <button disabled={busy} onClick={() => edit(p)}>
                        Ubah
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => void action(p, "duplicate")}
                      >
                        Gandakan
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => void action(p, "hide")}
                      >
                        {p.visible === false ? "Tampilkan" : "Sembunyikan"}
                      </button>
                      <button
                        aria-label={`Naikkan ${p.name}`}
                        disabled={busy || items[0]?._id === p._id}
                        onClick={() => void action(p, "up")}
                      >
                        ↑
                      </button>
                      <button
                        aria-label={`Turunkan ${p.name}`}
                        disabled={
                          busy || items[items.length - 1]?._id === p._id
                        }
                        onClick={() => void action(p, "down")}
                      >
                        ↓
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="studio-empty">
              <h2>Belum ada rekomendasi yang cocok.</h2>
              <p>Hapus filter atau tambahkan rekomendasi baru.</p>
              <button
                onClick={() => {
                  setQuery("");
                  setCategory("Semua");
                  setStatus("Semua");
                }}
              >
                Hapus filter
              </button>
            </div>
          )}
          <IntentLink
            intent="edit"
            params={{ type: "pageComposition", id: "pageComposition" }}
          >
            Atur pilihan unggulan pada beranda
          </IntentLink>
        </>
      )}
    </div>
  );
}
