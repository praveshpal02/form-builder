import { PrismaClient } from "../generated/prisma";
import { PrismaD1 } from "@prisma/adapter-d1";

const globalForPrisma = globalThis;

function createLocalClient() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  const client = new PrismaClient();
  globalForPrisma.prisma = client;
  return client;
}

function createD1Client(env) {
  const adapter = new PrismaD1(env.DB);
  return new PrismaClient({ adapter });
}

/**
 * Explicitly create a D1 client from Cloudflare env binding.
 * Use in Workers: const db = getDb(env)
 */
export function getDb(env) {
  return createD1Client(env);
}

/**
 * Auto-detecting database client.
 * - Cloudflare Workers: uses D1 via getCloudflareContext()
 * - Local development: uses SQLite via global singleton
 */
function detectClient() {
  try {
    // require() resolves in Cloudflare Workers where @opennextjs/cloudflare
    // is bundled. In Node.js (local dev) this throws — we fall back to SQLite.
    const mod = require("@opennextjs/cloudflare");
    const { env } = mod.getCloudflareContext();
    if (env && env.DB) {
      return createD1Client(env);
    }
  } catch {
    // Not in Cloudflare context
  }
  return createLocalClient();
}

// Lazily initialized client — first access triggers environment detection
let _client = null;
function getClient() {
  if (!_client) _client = detectClient();
  return _client;
}

// Proxy so `db.form.findMany()` etc. lazily resolve to the correct client
export const db = new Proxy(
  {},
  {
    get(_, prop) {
      const client = getClient();
      const val = client[prop];
      return typeof val === "function" ? val.bind(client) : val;
    },
  }
);
