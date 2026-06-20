const assert = require("node:assert/strict");
const test = require("node:test");

const adminReadHandler = require("../api/admin-read");

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: "",
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    send(payload) {
      this.body = payload;
      return this;
    },
    json(payload) {
      this.body = JSON.stringify(payload);
      return this;
    },
  };
}

async function invoke(pathname, method = "GET") {
  const response = createResponse();
  await adminReadHandler(
    {
      method,
      url: pathname,
      headers: {},
      query: {},
    },
    response
  );
  return {
    statusCode: response.statusCode,
    headers: response.headers,
    body: response.body ? JSON.parse(response.body) : {},
  };
}

test("knowledge admin-read routes remain protected without auth", async () => {
  const routes = [
    "/api/admin-read/knowledge-summary",
    "/api/admin-read/knowledge-categories",
    "/api/admin-read/knowledge-items",
    "/api/admin-read/knowledge-review-queue",
    "/api/admin-read/knowledge-linked-context",
  ];

  for (const route of routes) {
    const result = await invoke(route);
    assert.equal(result.statusCode, 401);
    assert.match(result.body.error, /Bearer token/);
    assert.match(result.body.safety_boundary, /No automatic customer messages/);
  }
});

test("unknown admin-read resource still returns stable JSON 404", async () => {
  const result = await invoke("/api/admin-read/not-a-real-resource");
  assert.equal(result.statusCode, 404);
  assert.equal(result.body.error, "not_found");
  assert.equal(result.body.message, "Unknown admin-read resource");
  assert.equal(result.body.safety.human_review_required, true);
});

test("knowledge admin-read routes remain GET only", async () => {
  const result = await invoke("/api/admin-read/knowledge-items", "POST");
  assert.equal(result.statusCode, 405);
  assert.equal(result.headers.allow, "GET");
  assert.equal(result.body.error, "Method not allowed");
});
