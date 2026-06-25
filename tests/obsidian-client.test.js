const assert = require("node:assert/strict");
const test = require("node:test");
const https = require("node:https");
const { EventEmitter } = require("node:events");

const {
  listVaultFiles,
  readVaultFile,
  searchVault,
  isObsidianOnline,
} = require("../lib/services/knowledge/obsidian-client");

// Install a fake https.request driven by a router(req) -> decision callback.
// decision shapes:
//   { status, body }   -> normal HTTP response (body string or JSON-serializable)
//   { error: "msg" }   -> simulate a socket/connection error (Obsidian offline)
//   { timeout: true }  -> simulate a request timeout
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

test("listVaultFiles returns the files array on a normal response", async () => {
  const restore = installHttpsMock(({ method, path }) => {
    assert.equal(method, "GET");
    assert.match(path, /^\/vault\/Clients\/$/);
    return { status: 200, body: { files: ["Acme.md", "Globex.md"] } };
  });
  try {
    const files = await listVaultFiles("Clients");
    assert.deepEqual(files, ["Acme.md", "Globex.md"]);
  } finally {
    restore();
  }
});

test("readVaultFile returns raw content on a normal response", async () => {
  const restore = installHttpsMock(({ method, path }) => {
    assert.equal(method, "GET");
    assert.match(path, /^\/vault\/Clients\/Acme\.md$/);
    return { status: 200, body: "# Acme Corp\nKey contact: Jane" };
  });
  try {
    const content = await readVaultFile("Clients/Acme.md");
    assert.equal(content, "# Acme Corp\nKey contact: Jane");
  } finally {
    restore();
  }
});

test("searchVault returns the result array on a normal response", async () => {
  const restore = installHttpsMock(({ method, path }) => {
    assert.equal(method, "POST");
    assert.match(path, /^\/search\/simple\/\?query=aluminum$/);
    return { status: 200, body: [{ filename: "Notes/Aluminum.md", score: 3 }] };
  });
  try {
    const results = await searchVault("aluminum");
    assert.deepEqual(results, [{ filename: "Notes/Aluminum.md", score: 3 }]);
  } finally {
    restore();
  }
});

test("isObsidianOnline returns true when the server responds", async () => {
  const restore = installHttpsMock(() => ({ status: 200, body: { status: "OK" } }));
  try {
    assert.equal(await isObsidianOnline(), true);
  } finally {
    restore();
  }
});

test("all functions degrade silently on a request timeout", async () => {
  const restore = installHttpsMock(() => ({ timeout: true }));
  try {
    assert.deepEqual(await listVaultFiles("Clients"), []);
    assert.equal(await readVaultFile("Clients/Acme.md"), "");
    assert.deepEqual(await searchVault("aluminum"), []);
    assert.equal(await isObsidianOnline(), false);
  } finally {
    restore();
  }
});

test("all functions degrade silently when Obsidian is offline (connection error)", async () => {
  const restore = installHttpsMock(() => ({ error: "ECONNREFUSED" }));
  try {
    assert.deepEqual(await listVaultFiles("Clients"), []);
    assert.equal(await readVaultFile("Clients/Acme.md"), "");
    assert.deepEqual(await searchVault("aluminum"), []);
    assert.equal(await isObsidianOnline(), false);
  } finally {
    restore();
  }
});

test("readVaultFile degrades to empty string on a 404 (file not found)", async () => {
  const restore = installHttpsMock(() => ({ status: 404, body: { error: "not found" } }));
  try {
    assert.equal(await readVaultFile("Clients/Missing.md"), "");
    assert.deepEqual(await listVaultFiles("Missing"), []);
    assert.deepEqual(await searchVault("missing"), []);
  } finally {
    restore();
  }
});

test("searchVault and listVaultFiles ignore malformed payloads", async () => {
  const restore = installHttpsMock(() => ({ status: 200, body: "<<not json>>" }));
  try {
    assert.deepEqual(await searchVault("aluminum"), []);
    assert.deepEqual(await listVaultFiles("Clients"), []);
  } finally {
    restore();
  }
});

test("empty inputs short-circuit without a request", async () => {
  const restore = installHttpsMock(() => {
    throw new Error("no request should be made for empty input");
  });
  try {
    assert.equal(await readVaultFile(""), "");
    assert.deepEqual(await searchVault("   "), []);
  } finally {
    restore();
  }
});
