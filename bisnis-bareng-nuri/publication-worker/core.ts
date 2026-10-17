import type { SiteContent } from "../lib/types";
import type { SanityDocument } from "../lib/sanity-content";
export type Status = "queued" | "building" | "succeeded" | "failed";
export interface Publication {
  id: string;
  key: string;
  hash: string;
  requestedBy: string;
  requestedAt: string;
  completedAt?: string;
  status: Status;
  content: SiteContent;
  documents: SanityDocument[];
  deploymentId?: string;
  runId?: string;
  dispatch: "pending" | "sent" | "uncertain";
  safeErrorMessage?: string;
  previousPublicationId?: string;
}
export interface State {
  publications: Publication[];
  active?: string;
  live?: string;
}
export const failureMessage =
  "Pembaruan belum berhasil. Website masih menampilkan versi sebelumnya. Draf Anda tetap tersimpan.";
export class PublicationError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export async function hashContent(value: unknown) {
  const stable = (v: unknown): unknown =>
    Array.isArray(v)
      ? v.map(stable)
      : v && typeof v === "object"
        ? Object.fromEntries(
            Object.entries(v)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([k, x]) => [k, stable(x)]),
          )
        : v;
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(JSON.stringify(stable(value))),
  );
  return Array.from(new Uint8Array(bytes), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
export function requestPublication(
  state: State,
  input: {
    id: string;
    key: string;
    hash: string;
    user: string;
    content: SiteContent;
    documents: SanityDocument[];
  },
): { publication: Publication; created: boolean } {
  const duplicate = state.publications.find((p) => p.key === input.key);
  if (duplicate) return { publication: duplicate, created: false };
  if (state.active) {
    const active = state.publications.find((p) => p.id === state.active);
    if (active && ["queued", "building"].includes(active.status))
      return { publication: active, created: false };
  }
  const last = state.publications.find((p) => p.id === state.live);
  if (last?.hash === input.hash)
    throw new PublicationError("Tidak ada perubahan untuk diterbitkan.", 409);
  const p: Publication = {
    id: input.id,
    key: input.key,
    hash: input.hash,
    requestedBy: input.user,
    requestedAt: new Date().toISOString(),
    status: "queued",
    dispatch: "pending",
    content: structuredClone({ ...input.content, publicationId: input.id }),
    documents: structuredClone(input.documents),
    previousPublicationId: state.live,
  };
  state.publications.push(p);
  state.active = p.id;
  return { publication: p, created: true };
}
export function claimBuild(state: State, id: string, runId: string) {
  const p = state.publications.find((p) => p.id === id);
  if (!p) throw new PublicationError("Publikasi tidak ditemukan.", 404);
  if (p.runId) {
    if (p.runId !== runId)
      throw new PublicationError("Publikasi sudah diambil build lain.", 409);
    return p;
  }
  if (p.status !== "queued")
    throw new PublicationError("Publikasi tidak dapat diproses.", 409);
  p.runId = runId;
  p.status = "building";
  return p;
}
export function finishPublication(
  state: State,
  id: string,
  runId: string,
  result: { verified: boolean; failed?: boolean; deploymentId?: string },
) {
  const p = state.publications.find((p) => p.id === id);
  if (!p || p.runId !== runId)
    throw new PublicationError("Identitas build tidak cocok.", 409);
  if (p.status === "succeeded" || p.status === "failed") return p;
  if (result.failed) {
    p.status = "failed";
    p.safeErrorMessage = failureMessage;
    p.completedAt = new Date().toISOString();
    if (state.active === id) delete state.active;
    return p;
  }
  if (!result.verified)
    throw new PublicationError(
      "Deployment belum terverifikasi. Periksa lagi.",
      409,
    );
  p.status = "succeeded";
  p.deploymentId = result.deploymentId;
  p.completedAt = new Date().toISOString();
  state.live = p.id;
  if (state.active === id) delete state.active;
  return p;
}
export function publicPublication(p: Publication) {
  const { content, documents, key, ...summary } = p;
  void content;
  void documents;
  void key;
  return summary;
}
