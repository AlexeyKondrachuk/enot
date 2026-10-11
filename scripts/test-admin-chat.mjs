import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Run real route handlers with an isolated database double; no production data is changed.
function route(path, prisma, extra = {}) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  const dependencies = {
    "next/server": { NextResponse: { json: (body, options) => ({ body: JSON.parse(JSON.stringify(body)), status: options?.status ?? 200, cookies: { set() {} } }) } },
    "@/lib/admin-auth": { isAdminRequest: (request) => request.admin === true },
    "@/lib/prisma": { getPrisma: () => prisma },
    "@/generated/prisma/enums": { MessageSender: { VISITOR: "VISITOR", OPERATOR: "OPERATOR" } },
    "@/lib/chat": { normalizeMessage: (text) => text?.trim() || null, getVisitorToken: () => "visitor", chatCookieName: "enot_chat" },
    "@/lib/admin-push": { notifyAdminAboutMessage: async () => {} },
    "node:crypto": { randomUUID: () => "visitor" },
    ...extra,
  };
  vm.runInNewContext(compiled, { exports, process: { env: { NODE_ENV: "test" } }, require: (name) => {
    assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
    return dependencies[name];
  } });
  return exports;
}
const request = (query = "", body = {}, admin = true) => ({ admin, nextUrl: new URL(`https://example.test/${query}`), json: async () => body });
const context = { params: Promise.resolve({ conversationId: "chat" }) };
let saved;
const updates = route("app/api/chat/admin/conversations/[conversationId]/route.ts", {
  conversation: {
    updateMany: async ({ data }) => { saved = JSON.parse(JSON.stringify(data)); return { count: 1 }; },
    findUnique: async () => ({ id: "chat", ...saved }),
  },
});
assert.equal((await updates.PATCH(request("", { archived: true }, false), context)).status, 401);
assert.equal(saved, undefined, "Unauthorized requests must not update the database");
for (const body of [{ name: "x".repeat(81) }, { archived: "true" }, { status: "ARCHIVED" }, {}, null]) {
  assert.equal((await updates.PATCH(request("", body), context)).status, 400);
}
assert.equal(saved, undefined, "Invalid updates must not write");
await updates.PATCH(request("", { name: "  Иван  ", archived: true }), context);
assert.deepEqual(saved, { name: "Иван", archived: true });
await updates.PATCH(request("", { name: " " }), context);
assert.deepEqual(saved, { name: null }, "Clearing a name must restore the fallback");

let listQuery;
const list = route("app/api/chat/admin/conversations/route.ts", {
  conversation: { findMany: async (query) => { listQuery = query; return [{ id: "1" }, { id: "2" }, { id: "3" }]; } },
});
const page = await list.GET(request("?archived=true&limit=2"));
assert.equal(listQuery.where.archived, true);
assert.deepEqual(page.body, { items: [{ id: "1" }, { id: "2" }], hasMore: true });
assert.equal((await list.GET(request("?limit=-1"))).status, 400);

let historyQuery;
const history = route("app/api/chat/admin/conversations/[conversationId]/messages/route.ts", {
  message: {
    updateMany: async () => ({}),
    findFirst: async () => ({ id: "cursor", createdAt: new Date("2026-10-01") }),
    findMany: async (query) => { historyQuery = query; return [{ id: "new" }, { id: "old" }]; },
  },
});
assert.deepEqual((await history.GET(request(), context)).body, [{ id: "old" }, { id: "new" }]);
assert.equal(historyQuery.orderBy[0].createdAt, "desc", "History must load recent messages first");
await history.GET(request("?before=cursor"), context);
assert.equal(historyQuery.where.OR[1].id.lt, "cursor", "Older pages must exclude the cursor, including timestamp ties");

let reopened;
const visitor = route("app/api/chat/messages/route.ts", {
  conversation: { upsert: async ({ update }) => { reopened = update; return { id: "chat" }; } },
  message: { findFirst: async () => null, create: async () => ({ id: "message" }) },
});
assert.equal((await visitor.POST(request("", { text: "Здравствуйте" }))).status, 201);
assert.equal(reopened.archived, false, "An incoming visitor message must restore the archived chat");
assert.equal(reopened.status, "OPEN");
console.log("Admin chat checks passed: authorization, validation, names, archive, pagination, history and visitor restore.");
