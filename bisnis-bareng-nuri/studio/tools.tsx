import { useEffect, useState, useCallback, useRef } from "react";
import { useClient, useCurrentUser } from "sanity";
import { IntentLink } from "sanity/router";
import { usePublicationApi } from "./api";
import type { SiteContent } from "../lib/types";
import {
  contentTypes,
  normalizeDocuments,
  type SanityDocument,
} from "../lib/sanity-content";
import { PreviewCanvas } from "./preview";
import "@fontsource-variable/geist";
import "@fontsource-variable/fraunces";
import "./studio.css";
import "../components/editorial.css";
type Summary = {
  id: string;
  status: "queued" | "building" | "succeeded" | "failed";
  requestedAt: string;
  completedAt?: string;
  safeErrorMessage?: string;
};
type Review = {
  content: SiteContent;
  changes: { id: string; title: string; type: string; kind: string }[];
  errors: string[];
  active: Summary | null;
  latest: Summary[];
};
const labels = {
  queued: "Sedang menyiapkan pembaruan",
  building: "Sedang memperbarui website",
  succeeded: "Pembaruan sudah tayang",
  failed: "Pembaruan belum berhasil",
};
export function ReviewTool() {
  const api = usePublicationApi(),
    client = useClient({ apiVersion: "2025-02-19" }),
    user = useCurrentUser();
  const [data, setData] = useState<Review | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [width, setWidth] = useState("desktop");
  const [frame, setFrame] = useState<HTMLIFrameElement | null>(null);
  const [snapshot, setSnapshot] = useState<SiteContent | null>(null);
  const pending = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const load = useCallback(async () => {
    try {
      const result = await api<Review>("/review");
      setData(result);
      if (!preview) setSnapshot(result.content);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }, [api, preview]);
  // API callback depends on the stable Studio client; use it through a ref to avoid restarting polls.
  useEffect(() => {
    if (preview) {
      const element = dialog.current;
      element?.showModal();
      return () => element?.close();
    }
  }, [preview]);
  async function reconcile() {
    if (!data?.active) return;
    setBusy(true);
    try {
      await api("/publications/" + data.active.id + "/reconcile", {
        method: "POST",
        body: "{}",
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });
  useEffect(() => {
    void loadRef.current();
    const id = setInterval(() => void loadRef.current(), 10000);
    return () => clearInterval(id);
  }, []);
  async function localPreview() {
    setBusy(true);
    try {
      const docs = await client
        .withConfig({ perspective: "raw", useCdn: false })
        .fetch<SanityDocument[]>("*[_type in $types]", { types: contentTypes });
      const c = normalizeDocuments(
        docs,
        client.config().projectId!,
        client.config().dataset!,
      );
      setSnapshot(c);
      setPreview(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function publish() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    try {
      let key = localStorage.getItem("nuri-publication-key");
      if (!key) {
        key = crypto.randomUUID();
        localStorage.setItem("nuri-publication-key", key);
      }
      const p = await api<Summary>("/publications", {
        method: "POST",
        headers: { "Idempotency-Key": key },
      });
      if (p.status === "failed" || p.status === "succeeded")
        localStorage.removeItem("nuri-publication-key");
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  useEffect(() => {
    if (
      data?.latest[0] &&
      ["succeeded", "failed"].includes(data.latest[0].status)
    )
      localStorage.removeItem("nuri-publication-key");
  }, [data]);
  useEffect(() => {
    if (!frame || !snapshot) return;
    const doc = frame.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(
      '<!doctype html><html lang="id"><head><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Pratinjau draf Nuri</title></head><body><div id="preview-root"></div></body></html>',
    );
    doc.close();
    document
      .querySelectorAll('style,link[rel="stylesheet"]')
      .forEach((node) => doc.head.appendChild(node.cloneNode(true)));
    let cancelled = false;
    let root: import("react-dom/client").Root | undefined;
    import("react-dom/client").then(({ createRoot }) => {
      if (cancelled) return;
      root = createRoot(doc.getElementById("preview-root")!);
      root.render(<PreviewCanvas data={snapshot} />);
    });
    return () => {
      cancelled = true;
      setTimeout(() => root?.unmount(), 0);
    };
  }, [frame, snapshot]);
  return (
    <div className="nuri-studio">
      <header className="studio-heading">
        <p>RUANG NURI</p>
        <h1>Halo, {user?.name || "Nuri"}.</h1>
        <span>Simpan cerita hari ini. Terbitkan saat semuanya siap.</span>
      </header>
      <div className="studio-quick">
        <IntentLink intent="create" params={{ type: "shopeeRecommendation" }}>
          Tambah rekomendasi
        </IntentLink>
        <IntentLink intent="create" params={{ type: "story" }}>
          Tulis cerita
        </IntentLink>
        <IntentLink intent="edit" params={{ type: "profile", id: "profile" }}>
          Ubah profil
        </IntentLink>
      </div>
      {error && (
        <div role="alert" className="studio-alert">
          <strong>Belum dapat memuat pembaruan</strong>
          <p>{error}</p>
          <button onClick={() => void load()}>Coba lagi</button>
          <button onClick={() => void localPreview()}>
            Pratinjau langsung dari CMS
          </button>
        </div>
      )}
      {!data && !error && (
        <div role="status" className="studio-loading">
          Memuat draf dan status publikasi...
        </div>
      )}
      {data && (
        <>
          <div className="studio-overview">
            <div>
              <span>Perubahan menunggu</span>
              <strong>{data.changes.length}</strong>
            </div>
            <div>
              <span>Status website</span>
              <strong className="small">
                {data.active
                  ? labels[data.active.status]
                  : data.latest[0]
                    ? labels[data.latest[0].status]
                    : "Siap diterbitkan"}
              </strong>
              {data.latest[0]?.completedAt && (
                <small>
                  {new Date(data.latest[0].completedAt).toLocaleString("id-ID")}
                </small>
              )}
            </div>
          </div>
          {data.active && (
            <button disabled={busy} onClick={() => void reconcile()}>
              Periksa status layanan
            </button>
          )}
          {data.active?.safeErrorMessage && (
            <p className="studio-alert">
              {data.active.safeErrorMessage} Untuk pemulihan, ikuti prosedur
              rekonsiliasi di panduan teknis.
            </p>
          )}
          <section className="studio-panel">
            <div className="studio-panel-heading">
              <h2>Tinjau perubahan</h2>
              <button onClick={() => void load()} disabled={busy}>
                Muat ulang
              </button>
            </div>
            <p>
              Draf tidak mengubah website yang sedang tayang. Publikasi
              membekukan konten saat tombol ditekan.
            </p>
            {data.errors.length > 0 && (
              <div className="studio-alert">
                <strong>Perbaiki sebelum menerbitkan</strong>
                <ul>
                  {data.errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
            {data.changes.length ? (
              <ul className="change-list">
                {data.changes.map((c) => (
                  <li key={c.id}>
                    <span>
                      <strong>{c.title}</strong>
                      <small>{c.type}</small>
                    </span>
                    <span className="studio-tag">{c.kind}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="studio-empty">
                <h3>Semua perubahan sudah tayang.</h3>
                <p>
                  Tambahkan cerita atau produk baru untuk memulai draf
                  berikutnya.
                </p>
              </div>
            )}
            <div className="studio-publish-actions">
              <button
                className="studio-secondary"
                onClick={() => {
                  setSnapshot(data.content);
                  setPreview(true);
                }}
              >
                Pratinjau draf
              </button>
              <button
                className="studio-primary"
                onClick={() => void publish()}
                disabled={
                  busy ||
                  !!data.active ||
                  !data.changes.length ||
                  data.errors.length > 0
                }
              >
                {busy
                  ? "Memproses..."
                  : data.active
                    ? "Publikasi sedang berjalan"
                    : "Terbitkan semua perubahan"}
              </button>
            </div>
          </section>
          <section className="studio-panel">
            <h2>Riwayat publikasi</h2>
            {data.latest.length ? (
              data.latest.map((p) => (
                <div className="publication-row" key={p.id}>
                  <span>
                    {labels[p.status]}
                    <small>
                      {new Date(p.requestedAt).toLocaleString("id-ID")}
                    </small>
                    {p.safeErrorMessage && <p>{p.safeErrorMessage}</p>}
                  </span>
                  <code>{p.id.slice(0, 8)}</code>
                </div>
              ))
            ) : (
              <p>
                Belum ada publikasi. Draf pertama Anda akan muncul di sini
                setelah diterbitkan.
              </p>
            )}
          </section>
        </>
      )}
      {preview && snapshot && (
        <dialog
          ref={dialog}
          onCancel={() => setPreview(false)}
          aria-label="Pratinjau draf"
          className="studio-preview"
        >
          <div className="preview-toolbar">
            <strong>Pratinjau: perubahan ini belum tayang.</strong>
            <div>
              <button
                aria-pressed={width === "desktop"}
                onClick={() => setWidth("desktop")}
              >
                Desktop
              </button>
              <button
                aria-pressed={width === "mobile"}
                onClick={() => setWidth("mobile")}
              >
                Mobile
              </button>
              <button onClick={() => setPreview(false)}>Tutup</button>
            </div>
          </div>
          <iframe
            ref={setFrame}
            title="Pratinjau draf website"
            className={width === "mobile" ? "preview-mobile" : ""}
          />
        </dialog>
      )}
    </div>
  );
}
