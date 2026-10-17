import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { createBrotliCompress, createGzip } from "node:zlib";
const root = path.resolve("out"),
  port = Number(process.env.PORT || 3000);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".json": "application/json",
  ".xml": "application/xml",
  ".txt": "text/plain",
};
http
  .createServer((req, res) => {
    let name;
    try {
      name = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    } catch {
      res.writeHead(400).end();
      return;
    }
    let file = path.resolve(root, "." + name);
    if (!file.startsWith(root + path.sep) && file !== root) {
      res.writeHead(403).end();
      return;
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory())
      file = path.join(file, "index.html");
    if (!fs.existsSync(file)) {
      file = path.join(root, "404.html");
      res.statusCode = 404;
    }
    const ext = path.extname(file);
    res.setHeader("Content-Type", types[ext] || "application/octet-stream");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader(
      "Cache-Control",
      name.startsWith("/_next/static/")
        ? "public, max-age=31536000, immutable"
        : "no-cache",
    );
    res.setHeader("Vary", "Accept-Encoding");
    const readable = fs.createReadStream(file);
    if (/\.(html|js|css|svg|json|xml|txt)$/.test(file)) {
      const accept = req.headers["accept-encoding"] || "";
      if (accept.includes("br")) {
        res.setHeader("Content-Encoding", "br");
        readable.pipe(createBrotliCompress()).pipe(res);
        return;
      }
      if (accept.includes("gzip")) {
        res.setHeader("Content-Encoding", "gzip");
        readable.pipe(createGzip()).pipe(res);
        return;
      }
    }
    readable.pipe(res);
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`Local: http://127.0.0.1:${port}`),
  );
