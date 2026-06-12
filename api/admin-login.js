const fs = require("node:fs");
const path = require("node:path");

function injectPublicEnv(html) {
  const env = {
    NEXT_PUBLIC_DATA_MODE: process.env.NEXT_PUBLIC_DATA_MODE || "mock",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "",
  };
  return html.replace("</head>", `<script>window.__CBM_ENV__=${JSON.stringify(env)};</script>\n  </head>`);
}

module.exports = function handler(request, response) {
  const htmlPath = path.join(process.cwd(), "admin", "login", "index.html");
  const html = injectPublicEnv(fs.readFileSync(htmlPath, "utf8"));
  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  response.status(200).send(html);
};
