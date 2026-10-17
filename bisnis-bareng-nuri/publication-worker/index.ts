import { DurableObject } from "cloudflare:workers";
import { authorizePublisher } from "./auth";
import {
  contentTypes,
  normalizeDocuments,
  validateContent,
  semanticDocuments,
  summarizeChanges,
  type SanityDocument,
} from "../lib/sanity-content";
import {
  requestPublication,
  claimBuild,
  finishPublication,
  hashContent,
  publicPublication,
  PublicationError,
  failureMessage,
  type State,
} from "./core";
interface Env {
  PUBLISHER: DurableObjectNamespace;
  SANITY_PROJECT_ID: string;
  SANITY_DATASET: string;
  SANITY_ALLOWED_USER_IDS: string;
  STUDIO_ORIGIN: string;
  GITHUB_REPOSITORY: string;
  GITHUB_TOKEN: string;
  BUILD_READ_TOKEN: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_PAGES_PROJECT: string;
  CLOUDFLARE_API_TOKEN: string;
  PRODUCTION_URL: string;
}
const json = (data: unknown, status = 200) =>
  Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
async function bearer(req: Request) {
  const a = req.headers.get("Authorization") || "";
  if (!a.startsWith("Bearer ") || a.length < 15)
    throw new PublicationError(
      "Sesi berakhir. Silakan masuk kembali ke Studio.",
      401,
    );
  return a.slice(7);
}
async function loadDocuments(token: string, env: Env) {
  const query = "*[_type in $types]";
  const url = new URL(
    `https://${env.SANITY_PROJECT_ID}.api.sanity.io/v2025-02-19/data/query/${env.SANITY_DATASET}`,
  );
  url.searchParams.set("query", query);
  url.searchParams.set("$types", JSON.stringify(contentTypes));
  url.searchParams.set("perspective", "raw");
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok)
    throw new PublicationError(
      "Konten belum dapat dibaca. Periksa izin proyek Sanity.",
      502,
    );
  const data = (await res.json()) as { result: SanityDocument[] };
  return data.result;
}
const worker = {
  async fetch(req: Request, env: Env) {
    const origin = req.headers.get("Origin");
    if (origin && origin !== env.STUDIO_ORIGIN)
      return json({ error: "Asal permintaan tidak diizinkan." }, 403);
    const headers = {
      "Access-Control-Allow-Origin": env.STUDIO_ORIGIN,
      Vary: "Origin",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type,Authorization,Idempotency-Key",
    };
    if (req.method === "OPTIONS")
      return new Response(null, { status: 204, headers });
    try {
      if (Number(req.headers.get("Content-Length") || 0) > 16384)
        throw new PublicationError("Permintaan terlalu besar.", 413);
      const stub = env.PUBLISHER.get(
        env.PUBLISHER.idFromName("nuri-publication"),
      );
      const res = await stub.fetch(req);
      const response = new Response(res.body, res);
      Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
      return response;
    } catch {
      return new Response(
        JSON.stringify({ error: "Layanan belum dapat dihubungi. Coba lagi." }),
        {
          status: 503,
          headers: { ...headers, "Content-Type": "application/json" },
        },
      );
    }
  },
};
export class Publisher extends DurableObject<Env> {
  async fetch(req: Request): Promise<Response> {
    return this.ctx.blockConcurrencyWhile(async () => {
      try {
        return await this.handle(req);
      } catch (error) {
        return json(
          {
            error:
              error instanceof PublicationError
                ? error.message
                : "Pembaruan belum dapat diproses. Periksa konfigurasi layanan.",
          },
          error instanceof PublicationError ? error.status : 500,
        );
      }
    });
  }
  async handle(req: Request) {
    const env = this.env;
    const path = new URL(req.url).pathname;
    const state = (await this.ctx.storage.get<State>("state")) || {
      publications: [],
    };
    const save = () => this.ctx.storage.put("state", state);
    if (path.startsWith("/build/")) {
      if ((await bearer(req)) !== env.BUILD_READ_TOKEN)
        throw new PublicationError("Akses build ditolak.", 403);
      const parts = path.split("/");
      const id = parts[2];
      const action = parts[3];
      const p = state.publications.find((p) => p.id === id);
      if (!p) throw new PublicationError("Publikasi tidak ditemukan.", 404);
      if (req.method === "GET" && action === "snapshot") return json(p.content);
      if (req.method !== "POST")
        throw new PublicationError("Metode tidak diizinkan.", 405);
      const payload = (await req.json()) as {
        runId: string;
        deploymentId?: string;
        failed?: boolean;
      };
      if (!/^\d+-\d+$/.test(payload.runId || ""))
        throw new PublicationError("ID build tidak valid.");
      if (action === "claim") {
        const existed = !!p.runId;
        claimBuild(state, id, payload.runId);
        await save();
        return json({ claimed: !existed, publication: publicPublication(p) });
      }
      if (action === "complete") {
        if (payload.failed) {
          finishPublication(state, id, payload.runId, {
            verified: false,
            failed: true,
          });
          await save();
          return json(publicPublication(p));
        }
        if (
          !payload.deploymentId ||
          !/^[a-zA-Z0-9-]+$/.test(payload.deploymentId)
        )
          throw new PublicationError("ID deployment wajib diisi.");
        const cf = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/pages/projects/${env.CLOUDFLARE_PAGES_PROJECT}/deployments/${payload.deploymentId}`,
          { headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}` } },
        );
        if (!cf.ok)
          throw new PublicationError(
            "Status penyedia hosting belum dapat dibaca.",
            502,
          );
        const result = (await cf.json()) as {
          result: {
            latest_stage: { status: string };
            environment: string;
            url: string;
          };
        };
        const deployment = result.result;
        if (deployment.latest_stage.status === "failure") {
          finishPublication(state, id, payload.runId, {
            verified: false,
            failed: true,
          });
          await save();
          return json(publicPublication(p));
        }
        if (
          deployment.latest_stage.status !== "success" ||
          deployment.environment !== "production"
        )
          throw new PublicationError(
            "Deployment produksi belum berhasil.",
            409,
          );
        const verify = await fetch(
          `${env.PRODUCTION_URL.replace(/\/$/, "")}/publication.json?verify=${id}`,
          { cache: "no-store" },
        );
        const marker = verify.ok
          ? ((await verify.json()) as { publicationId?: string })
          : null;
        if (marker?.publicationId !== id)
          throw new PublicationError(
            "Versi baru belum terlihat pada domain produksi.",
            409,
          );
        finishPublication(state, id, payload.runId, {
          verified: true,
          deploymentId: payload.deploymentId,
        });
        await save();
        return json(publicPublication(p));
      }
      throw new PublicationError("Endpoint build tidak ditemukan.", 404);
    }
    const user = await authorizePublisher(req, env.SANITY_ALLOWED_USER_IDS);
    if (req.method === "GET" && path === "/review") {
      const documents = await loadDocuments(user.token, env);
      const live = state.publications.find((p) => p.id === state.live);
      const content = normalizeDocuments(
        documents,
        env.SANITY_PROJECT_ID,
        env.SANITY_DATASET,
      );
      return json({
        content,
        changes: summarizeChanges(documents, live?.documents || []),
        errors: validateContent(content),
        active: state.publications.find((p) => p.id === state.active)
          ? publicPublication(
              state.publications.find((p) => p.id === state.active)!,
            )
          : null,
        latest: state.publications.slice(-15).reverse().map(publicPublication),
      });
    }
    if (req.method === "GET" && path === "/publications")
      return json(
        state.publications.slice(-30).reverse().map(publicPublication),
      );
    if (req.method === "POST" && path === "/publications") {
      const key = req.headers.get("Idempotency-Key");
      if (!key || !/^[a-zA-Z0-9-]{16,100}$/.test(key))
        throw new PublicationError("Kunci permintaan tidak valid.");
      const known = state.publications.find((p) => p.key === key);
      if (known) return json(publicPublication(known));
      const docs = await loadDocuments(user.token, env);
      const content = normalizeDocuments(
        docs,
        env.SANITY_PROJECT_ID,
        env.SANITY_DATASET,
      );
      const errors = validateContent(content);
      if (errors.length) throw new PublicationError(errors.join(" "));
      const hash = await hashContent(semanticDocuments(docs));
      const result = requestPublication(state, {
        id: crypto.randomUUID(),
        key,
        hash,
        user: user.id,
        content,
        documents: docs,
      });
      await save();
      if (!result.created) return json(publicPublication(result.publication));
      // Persist the claim before network I/O. Ambiguous responses never auto-dispatch a second build.
      result.publication.dispatch = "uncertain";
      await save();
      try {
        const dispatch = await fetch(
          `https://api.github.com/repos/${env.GITHUB_REPOSITORY}/dispatches`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${env.GITHUB_TOKEN}`,
              "Content-Type": "application/json",
              Accept: "application/vnd.github+json",
              "User-Agent": "nuri-publication",
            },
            body: JSON.stringify({
              event_type: "nuri-publish",
              client_payload: { publication_id: result.publication.id },
            }),
          },
        );
        if (dispatch.ok) result.publication.dispatch = "sent";
        else if (dispatch.status >= 400 && dispatch.status < 500) {
          result.publication.status = "failed";
          result.publication.safeErrorMessage = failureMessage;
          result.publication.completedAt = new Date().toISOString();
          delete state.active;
        } else
          result.publication.safeErrorMessage =
            "Status pengiriman belum pasti. Periksa GitHub Actions sebelum mencoba ulang.";
      } catch {
        result.publication.safeErrorMessage =
          "Status pengiriman belum pasti. Periksa GitHub Actions sebelum mencoba ulang.";
      }
      await save();
      return json(publicPublication(result.publication), 202);
    }
    if (
      req.method === "POST" &&
      path.match(/^\/publications\/[a-f0-9-]+\/reconcile$/)
    ) {
      const id = path.split("/")[2],
        p = state.publications.find((p) => p.id === id);
      if (!p) throw new PublicationError("Publikasi tidak ditemukan.", 404);
      if (["succeeded", "failed"].includes(p.status))
        return json(publicPublication(p));
      const cf = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/pages/projects/${env.CLOUDFLARE_PAGES_PROJECT}/deployments`,
        { headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}` } },
      );
      if (!cf.ok)
        throw new PublicationError("Belum dapat memeriksa deployment.", 502);
      const cfData = (await cf.json()) as {
        result: {
          id: string;
          environment: string;
          latest_stage: { status: string };
          deployment_trigger: { metadata: { commit_hash: string } };
        }[];
      };
      const marker = id.replaceAll("-", "").padEnd(40, "0");
      const dep = cfData.result.find(
        (d) =>
          d.environment === "production" &&
          d.deployment_trigger?.metadata?.commit_hash === marker,
      );
      if (dep) {
        if (dep.latest_stage.status === "success") {
          const markerResponse = await fetch(
            `${env.PRODUCTION_URL.replace(/\/$/, "")}/publication.json?verify=${id}`,
            { cache: "no-store" },
          );
          const actual = markerResponse.ok
            ? ((await markerResponse.json()) as { publicationId?: string })
            : null;
          if (actual?.publicationId !== id)
            throw new PublicationError(
              "Deployment selesai, tetapi marker produksi belum cocok. Periksa lagi.",
              409,
            );
          if (!p.runId)
            throw new PublicationError("Identitas build belum tercatat.", 409);
          finishPublication(state, id, p.runId, {
            verified: true,
            deploymentId: dep.id,
          });
          await save();
          return json(publicPublication(p));
        }
        if (dep.latest_stage.status === "failure" && p.runId) {
          finishPublication(state, id, p.runId, {
            verified: false,
            failed: true,
          });
          await save();
          return json(publicPublication(p));
        }
        throw new PublicationError("Deployment masih berlangsung.", 409);
      }
      const ghHeaders = {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "nuri-publication",
      };
      if (p.runId) {
        const r = await fetch(
          `https://api.github.com/repos/${env.GITHUB_REPOSITORY}/actions/runs/${p.runId.split("-")[0]}`,
          { headers: ghHeaders },
        );
        if (!r.ok)
          throw new PublicationError(
            "Status build belum dapat diperiksa.",
            502,
          );
        const run = (await r.json()) as { status: string; conclusion: string };
        if (run.status !== "completed")
          throw new PublicationError("Build masih berjalan.", 409);
        if (run.conclusion === "success")
          throw new PublicationError(
            "Build selesai; deployment belum ditemukan. Periksa konfigurasi Pages.",
            409,
          );
        finishPublication(state, id, p.runId, {
          verified: false,
          failed: true,
        });
        await save();
        return json(publicPublication(p));
      }
      if (Date.now() - new Date(p.requestedAt).getTime() < 120000)
        throw new PublicationError(
          "Tunggu dua menit agar event build dapat muncul.",
          409,
        );
      const r = await fetch(
        `https://api.github.com/repos/${env.GITHUB_REPOSITORY}/actions/runs?event=repository_dispatch&per_page=100`,
        { headers: ghHeaders },
      );
      if (!r.ok)
        throw new PublicationError(
          "Status event build belum dapat diperiksa.",
          502,
        );
      const runs = (await r.json()) as {
        workflow_runs: { display_title: string; status: string }[];
      };
      const run = runs.workflow_runs.find((r) => r.display_title.includes(id));
      if (run && run.status !== "completed")
        throw new PublicationError(
          "Event build sudah diterima dan masih diproses.",
          409,
        );
      p.status = "failed";
      p.safeErrorMessage = failureMessage;
      p.completedAt = new Date().toISOString();
      if (state.active === id) delete state.active;
      await save();
      return json(publicPublication(p));
    }

    throw new PublicationError("Endpoint tidak ditemukan.", 404);
  }
}

export default worker;
