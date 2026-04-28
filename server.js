const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";
const OUT_DIR = path.join(__dirname, "out");

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

function safeJoin(baseDir, requestPath) {
  const normalized = path.normalize(requestPath).replace(/^(\.\.(\/|\\|$))+/, "");
  return path.join(baseDir, normalized);
}

function fileCandidates(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split("?")[0]);
  const normalizedPath = cleanPath === "/" ? "/index" : cleanPath.replace(/\/+$/, "");
  const basePath = normalizedPath.startsWith("/") ? normalizedPath.slice(1) : normalizedPath;

  return [
    safeJoin(OUT_DIR, basePath),
    safeJoin(OUT_DIR, `${basePath}.html`),
    safeJoin(OUT_DIR, path.join(basePath, "index.html")),
  ];
}

function sendFile(res, filePath, stats) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = MIME_TYPES[ext] || "application/octet-stream";

  res.writeHead(200, {
    "Content-Length": stats.size,
    "Content-Type": mimeType,
  });

  fs.createReadStream(filePath).pipe(res);
}

function sendNotFound(res) {
  const fallback404 = path.join(OUT_DIR, "404.html");

  fs.stat(fallback404, (error, stats) => {
    if (!error && stats.isFile()) {
      res.statusCode = 404;
      return sendFile(res, fallback404, stats);
    }

    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  });
}

if (!fs.existsSync(OUT_DIR)) {
  console.error(`Static export directory not found: ${OUT_DIR}`);
  console.error('Run "npm run build" before "npm start".');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Method not allowed");
    return;
  }

  const requestUrl = req.url || "/";

  for (const candidate of fileCandidates(requestUrl)) {
    if (!candidate.startsWith(OUT_DIR)) {
      continue;
    }

    try {
      const stats = fs.statSync(candidate);
      if (stats.isFile()) {
        return sendFile(res, candidate, stats);
      }
    } catch {
      // Try the next candidate.
    }
  }

  return sendNotFound(res);
});

server.listen(PORT, HOST, () => {
  console.log(`Static server listening on http://${HOST}:${PORT}`);
});

server.on("error", (error) => {
  console.error("Failed to start static server:", error.message);
  process.exit(1);
});
