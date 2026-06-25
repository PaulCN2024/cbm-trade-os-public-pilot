const assert = require("node:assert/strict");
const test = require("node:test");
const https = require("node:https");
const { EventEmitter } = require("node:events");

const {
  OFFLINE_NOTICE,
  getClientContext,
  buildQuoteContext,
  buildInquiryContext,
} = require("../lib/services/knowledge");

// Fake https.request driven by a router(req) -> decision callback.
//   { status, body }  -> normal HTTP response
//   { error: "msg" }  -> connection error (Obsidian offline)
//   { timeout: true } -> request timeout
function installHttpsMock(router) {
  const original = https.request;
  https.request = function mockedRequest(options, callback) {
    const req = new EventEmitter();
    req.setTimeout = () => req;
    req.write = () => req;
    req.destroy = () => req;
    req.end = () => {
      const decision = router({ method: options.method, path: options.path }) || {};
      if (decision.error) {
        process.nextTick(() => req.emit("error", new Error(decision.error)));
        return req;
      }
      if (decision.timeout) {
        process.nextTick(() => req.emit("timeout"));
        return req;
      }
      const status = decision.status != null ? decision.status : 200;
      const bodyValue = decision.body == null ? "" : decision.body;
      const text = typeof bodyValue === "string" ? bodyValue : JSON.stringify(bodyValue);
      process.nextTick(() => {
        const res = new EventEmitter();
        res.statusCode = status;
        callback(res);
        setImmediate(() => {
          if (text) res.emit("data", Buffer.from(text));
          res.emit("end");
        });
      });
      return req;
    };
    return req;
  };
  return () => {
    https.request = original;
  };
}

function parse(path) {
  const url = new URL(path, "https://127.0.0.1:27124");
  return { pathname: url.pathname, query: url.searchParams.get("query") };
}

test("getClientContext returns the offline notice when Obsidian is offline", async () => {
  const restore = installHttpsMock(() => ({ error: "ECONNREFUSED" }));
  try {
    assert.equal(await getClientContext("Acme"), OFFLINE_NOTICE);
  } finally {
    restore();
  }
});

test("buildQuoteContext and buildInquiryContext return the offline notice when offline", async () => {
  const restore = installHttpsMock(() => ({ timeout: true }));
  try {
    assert.equal(await buildQuoteContext({ customerName: "Acme", productKeywords: ["aluminum"] }), OFFLINE_NOTICE);
    assert.equal(await buildInquiryContext({ customerName: "Acme", inquiryText: "need aluminum profiles" }), OFFLINE_NOTICE);
  } finally {
    restore();
  }
});

test("getClientContext returns a not-found notice when the customer is missing", async () => {
  const restore = installHttpsMock(({ method, path }) => {
    const { pathname } = parse(path);
    if (method === "GET" && pathname === "/") return { status: 200, body: { status: "OK" } };
    if (method === "POST" && pathname === "/search/simple/") return { status: 200, body: [] };
    throw new Error(`unexpected request: ${method} ${path}`);
  });
  try {
    const context = await getClientContext("Nonexistent Buyer");
    assert.match(context, /未找到客户档案/);
    assert.match(context, /Nonexistent Buyer/);
  } finally {
    restore();
  }
});

test("getClientContext assembles profile content when the customer is found", async () => {
  const restore = installHttpsMock(({ method, path }) => {
    const { pathname, query } = parse(path);
    if (method === "GET" && pathname === "/") return { status: 200, body: { status: "OK" } };
    if (method === "POST" && pathname === "/search/simple/") {
      assert.equal(query, "Acme");
      return { status: 200, body: [{ filename: "Clients/Acme.md", score: 5 }] };
    }
    if (method === "GET" && pathname === "/vault/Clients/Acme.md") {
      return { status: 200, body: "# Acme Corp\n- Region: EU\n- Prefers USD/kg quotes" };
    }
    throw new Error(`unexpected request: ${method} ${path}`);
  });
  try {
    const context = await getClientContext("Acme");
    assert.match(context, /Clients\/Acme\.md/);
    assert.match(context, /Acme Corp/);
    assert.match(context, /USD\/kg/);
  } finally {
    restore();
  }
});

test("buildQuoteContext merges customer profile and product knowledge", async () => {
  const restore = installHttpsMock(({ method, path }) => {
    const { pathname, query } = parse(path);
    if (method === "GET" && pathname === "/") return { status: 200, body: { status: "OK" } };
    if (method === "POST" && pathname === "/search/simple/") {
      if (query === "Acme") return { status: 200, body: [{ filename: "Clients/Acme.md" }] };
      if (query === "aluminum") return { status: 200, body: [{ filename: "Products/Aluminum.md" }] };
      return { status: 200, body: [] };
    }
    if (method === "GET" && pathname === "/vault/Clients/Acme.md") {
      return { status: 200, body: "Acme Corp profile" };
    }
    if (method === "GET" && pathname === "/vault/Products/Aluminum.md") {
      return { status: 200, body: "6063-T5 aluminum profile, USD/kg pricing" };
    }
    throw new Error(`unexpected request: ${method} ${path}`);
  });
  try {
    const context = await buildQuoteContext({ customerName: "Acme", productKeywords: ["aluminum"] });
    assert.match(context, /## 客户档案/);
    assert.match(context, /Acme Corp profile/);
    assert.match(context, /## 产品知识/);
    assert.match(context, /6063-T5 aluminum profile/);
  } finally {
    restore();
  }
});

test("buildInquiryContext assembles knowledge from the inquiry text", async () => {
  const restore = installHttpsMock(({ method, path }) => {
    const { pathname, query } = parse(path);
    if (method === "GET" && pathname === "/") return { status: 200, body: { status: "OK" } };
    if (method === "POST" && pathname === "/search/simple/") {
      if (query === "aluminum") return { status: 200, body: [{ filename: "Products/Aluminum.md" }] };
      return { status: 200, body: [] };
    }
    if (method === "GET" && pathname === "/vault/Products/Aluminum.md") {
      return { status: 200, body: "Aluminum profile catalog" };
    }
    throw new Error(`unexpected request: ${method} ${path}`);
  });
  try {
    const context = await buildInquiryContext({ customerName: "", inquiryText: "Looking for aluminum profiles" });
    assert.match(context, /## 相关知识/);
    assert.match(context, /Aluminum profile catalog/);
  } finally {
    restore();
  }
});
