import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";

let _client = null;

export function getDb() {
  if (!_client) {
    const { env } = getCloudflareContext();
    const adapter = new PrismaD1(env.DB);
    _client = new PrismaClient({ adapter });
  }
  return _client;
}
