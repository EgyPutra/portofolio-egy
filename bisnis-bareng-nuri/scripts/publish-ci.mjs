import fs from "node:fs/promises";
import { spawnSync } from "node:child_process";
const id = process.env.PUBLICATION_ID,
  origin = process.env.PUBLICATION_URL?.replace(/\/$/, ""),
  token = process.env.BUILD_READ_TOKEN,
  runId = `${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT}`;
if (
  !/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(id || "") ||
  !origin ||
  !token
)
  throw new Error("Konfigurasi publikasi tidak lengkap.");
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};
let deploymentStarted = false;
const request = async (action, body) => {
  const r = await fetch(`${origin}/build/${id}/${action}`, {
    method: body ? "POST" : "GET",
    headers,
    body: body ? JSON.stringify({ ...body, runId }) : undefined,
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`);
  return d;
};
const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { stdio: "inherit", env: process.env });
  if (r.status !== 0) throw new Error(`${cmd} belum berhasil.`);
};
try {
  const claim = await request("claim", {});
  if (!claim.claimed) {
    console.log("Build ini sudah diambil; tidak membuat deployment kedua.");
    process.exit(0);
  }
  if (!/^https:\/\//.test(process.env.NEXT_PUBLIC_SITE_URL || ""))
    throw new Error(
      "Atur NEXT_PUBLIC_SITE_URL ke domain produksi HTTPS sebelum build.",
    );
  const snapshot = await request("snapshot");
  if (snapshot.publicationId !== id)
    throw new Error("ID snapshot tidak cocok.");
  await fs.writeFile(
    "content/published.json",
    JSON.stringify(snapshot, null, 2),
  );
  await fs.writeFile(
    "public/publication.json",
    JSON.stringify({ publicationId: id }),
  );
  run("npm", ["ci", "--no-audit", "--no-fund"]);
  run("npm", ["run", "build"]);
  deploymentStarted = true;
  const commit = id.replaceAll("-", "").padEnd(40, "0");
  run("npx", [
    "--no-install",
    "wrangler",
    "pages",
    "deploy",
    "out",
    "--project-name",
    process.env.CLOUDFLARE_PAGES_PROJECT,
    "--branch",
    "main",
    "--commit-hash",
    commit,
  ]);
  const cf = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/pages/projects/${process.env.CLOUDFLARE_PAGES_PROJECT}/deployments`,
    {
      headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}` },
    },
  );
  if (!cf.ok) throw new Error("Status deployment belum tersedia.");
  const deployments = await cf.json();
  const deployment = deployments.result?.find(
    (d) =>
      d.deployment_trigger?.metadata?.commit_hash === commit &&
      d.environment === "production",
  );
  if (!deployment)
    throw new Error("Deployment belum ditemukan. Periksa penyedia hosting.");
  let complete = false;
  for (let i = 0; i < 24; i++) {
    try {
      const result = await request("complete", { deploymentId: deployment.id });
      if (result.status === "failed") throw new Error("Deployment gagal.");
      if (result.status === "succeeded") {
        complete = true;
        break;
      }
    } catch (e) {
      if (i === 23) throw e;
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
  if (!complete) throw new Error("Verifikasi belum selesai.");
  console.log("Pembaruan sudah tayang; publication ID terverifikasi.");
} catch (error) {
  if (!deploymentStarted) {
    try {
      await request("complete", { failed: true });
    } catch {
      console.error("Status gagal belum tercatat. Periksa dashboard.");
    }
  }
  console.error(error.message);
  if (deploymentStarted)
    console.error(
      "Deployment mungkin telah berjalan. Lanjutkan verifikasi ID yang sama, jangan memulai upload baru.",
    );
  process.exitCode = 1;
}
