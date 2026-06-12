const fs = require("node:fs");
const path = require("node:path");

function setNoCacheHeaders(response) {
  response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  response.setHeader("CDN-Cache-Control", "no-store");
  response.setHeader("Vercel-CDN-Cache-Control", "no-store");
  response.setHeader("Pragma", "no-cache");
  response.setHeader("Expires", "0");
}

function injectPublicEnv(html) {
  const env = {
    NEXT_PUBLIC_DATA_MODE: process.env.NEXT_PUBLIC_DATA_MODE || "mock",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "",
  };
  const script = `<script>window.__CBM_ENV__=${JSON.stringify(env)};</script>`;
  return html.replace("</head>", `${script}\n  </head>`);
}

module.exports = function handler(request, response) {
  const htmlPath = path.join(process.cwd(), "trade-website", "index.html");
  const html = injectPublicEnv(fs.readFileSync(htmlPath, "utf8"));
  response.setHeader("Content-Type", "text/html; charset=utf-8");
  setNoCacheHeaders(response);
  response.setHeader("X-CBM-Rendered-Route", "trade-website-server-html");
  response.status(200).send(html);
};
