import { test } from "node:test";
import assert from "node:assert/strict";
import { seed } from "../content/seed";
import {
  requestPublication,
  claimBuild,
  finishPublication,
  hashContent,
  PublicationError,
  type State,
} from "../publication-worker/core";
import { authorizePublisher } from "../publication-worker/auth";
import { filterProducts, safeUrl, whatsappUrl } from "../lib/utils";
import {
  effectiveDocuments,
  validateContent,
  summarizeChanges,
  type SanityDocument,
} from "../lib/sanity-content";
const initial = (): State => ({ publications: [] });
const input = (overrides = {}) => ({
  id: "publication-1",
  key: "idempotency-key-1234",
  hash: "hash-1",
  user: "nuri",
  content: structuredClone(seed),
  documents: [] as SanityDocument[],
  ...overrides,
});
test("20 draf rekomendasi dan foto baru tidak mengubah versi publik; snapshot tetap beku", () => {
  const state = initial();
  const data = structuredClone(seed);
  data.recommendations = Array.from({ length: 20 }, (_, i) => ({
    ...seed.recommendations[0],
    id: `draft-${i}`,
  }));
  data.profile.portrait.src = "/images/new.webp";
  assert.equal(state.publications.length, 0);
  const p = requestPublication(state, input({ content: data })).publication;
  data.recommendations[0].name = "Edit setelah publikasi";
  data.profile.portrait.src = "/images/next.webp";
  assert.equal(p.content.recommendations.length, 20);
  assert.notEqual(
    p.content.recommendations[0].name,
    data.recommendations[0].name,
  );
  assert.equal(p.content.profile.portrait.src, "/images/new.webp");
  assert.equal(state.live, undefined);
});
test("klik ganda dan request ulang tidak memicu publikasi kedua", () => {
  const s = initial();
  assert.equal(requestPublication(s, input()).created, true);
  assert.equal(requestPublication(s, input()).created, false);
  assert.equal(
    requestPublication(s, input({ key: "another-key-123456", hash: "new" }))
      .created,
    false,
  );
  assert.equal(s.publications.length, 1);
});
test("satu build dapat mengambil publikasi; pengulangan tidak mengambil dua kali", () => {
  const s = initial();
  requestPublication(s, input());
  const p = claimBuild(s, "publication-1", "100-1");
  assert.equal(p.status, "building");
  assert.equal(claimBuild(s, "publication-1", "100-1").runId, "100-1");
  assert.throws(
    () => claimBuild(s, "publication-1", "101-1"),
    PublicationError,
  );
});
test("status berhasil membutuhkan verifikasi deployment, draf berikutnya tidak ikut", () => {
  const s = initial();
  requestPublication(s, input());
  claimBuild(s, "publication-1", "100-1");
  assert.throws(
    () => finishPublication(s, "publication-1", "100-1", { verified: false }),
    PublicationError,
  );
  assert.equal(s.live, undefined);
  finishPublication(s, "publication-1", "100-1", {
    verified: true,
    deploymentId: "cf-1",
  });
  assert.equal(s.live, "publication-1");
  assert.throws(
    () => requestPublication(s, input({ id: "p2", key: "new-key-12345678" })),
    PublicationError,
  );
  requestPublication(
    s,
    input({ id: "p2", key: "new-key-12345678", hash: "changed" }),
  );
  assert.equal(s.publications[0].content.publicationId, "publication-1");
  assert.equal(s.active, "p2");
});
test("kegagalan mempertahankan versi sebelumnya dan snapshot dapat dipulihkan", () => {
  const s = initial();
  requestPublication(s, input());
  claimBuild(s, "publication-1", "100-1");
  finishPublication(s, "publication-1", "100-1", { verified: true });
  requestPublication(
    s,
    input({ id: "p2", key: "new-key-12345678", hash: "different" }),
  );
  claimBuild(s, "p2", "101-1");
  finishPublication(s, "p2", "101-1", { verified: false, failed: true });
  assert.equal(s.live, "publication-1");
  assert.equal(s.active, undefined);
  assert.equal(s.publications[1].content.profile.name, "Nuri");
  assert.equal(
    requestPublication(
      s,
      input({ id: "retry", key: "retry-key-12345678", hash: "different" }),
    ).created,
    true,
  );
});
test("hash konten stabil untuk urutan properti berbeda", async () => {
  assert.equal(
    await hashContent({ a: 1, b: 2 }),
    await hashContent({ b: 2, a: 1 }),
  );
});
test("otorisasi publikasi menolak sesi kosong, kedaluwarsa, dan pengguna di luar allowlist", async () => {
  await assert.rejects(
    authorizePublisher(new Request("https://worker/review"), "nuri"),
    (e) => e instanceof PublicationError && e.status === 401,
  );
  const req = new Request("https://worker/review", {
    headers: { Authorization: "Bearer user-session-token" },
  });
  await assert.rejects(
    authorizePublisher(
      req,
      "nuri",
      async () => new Response("", { status: 401 }),
    ),
    (e) => e instanceof PublicationError && e.status === 401,
  );
  await assert.rejects(
    authorizePublisher(req, "nuri", async () =>
      Response.json({ id: "outsider" }),
    ),
    (e) => e instanceof PublicationError && e.status === 403,
  );
  const auth = await authorizePublisher(req, "nuri", async () =>
    Response.json({ id: "nuri" }),
  );
  assert.equal(auth.id, "nuri");
});
test("pencarian case insensitive digabung kategori dan mengabaikan produk tersembunyi", () => {
  assert.equal(
    filterProducts(seed.recommendations, "LAMPU", "Ruang kerja").length,
    1,
  );
  assert.equal(
    filterProducts(seed.recommendations, "LAMPU", "Rumah & keluarga").length,
    0,
  );
  assert.equal(
    filterProducts(seed.recommendations, "tersembunyi", "Semua").length,
    0,
  );
  assert.equal(
    filterProducts(seed.recommendations, "tidak ada", "Semua").length,
    0,
  );
});
test("URL berbahaya, host palsu, dan kredensial URL ditolak; WA dikodekan sesuai konteks", () => {
  for (const url of [
    "javascript:alert(1)",
    "http://shopee.co.id/x",
    "https://shopee.co.id.evil.com",
    "https://user:pass@shopee.co.id/",
  ])
    assert.equal(safeUrl(url, ["shopee.co.id"]), null);
  assert.ok(safeUrl("https://s.shopee.co.id/123", ["shopee.co.id"]));
  assert.equal(whatsappUrl("", "x"), null);
  assert.equal(
    whatsappUrl("+62 812-3456-7890", "Tanya produk A & B"),
    "https://wa.me/6281234567890?text=Tanya%20produk%20A%20%26%20B",
  );
});
test("overlay draf tidak memodifikasi dokumen tayang dan perubahan ringkasan akurat", () => {
  const pub = { _id: "p1", _type: "profile", name: "Lama" },
    draft = { _id: "drafts.p1", _type: "profile", name: "Baru" };
  assert.equal(effectiveDocuments([draft, pub])[0].name, "Baru");
  assert.equal(pub.name, "Lama");
  const c = summarizeChanges([draft, pub], [pub]);
  assert.equal(c.length, 1);
  assert.equal(c[0].kind, "diubah");
});
test("publikasi final menolak tautan belum dikonfigurasi dan slug ganda", () => {
  const c = structuredClone(seed);
  assert.equal(validateContent(c).length, 0);
  c.demo = false;
  assert.ok(validateContent(c).some((e) => e.includes("WhatsApp")));
  c.stories[1].slug = c.stories[0].slug;
  assert.ok(validateContent(c).some((e) => e.includes("unik")));
});
