import { getCloudflareContext } from "@opennextjs/cloudflare";

const SAFE_segment = /^[a-zA-Z0-9._-]{1,120}$/;

export async function GET(request, { params }) {
  try {
    const { key } = await params;
    const segments = Array.isArray(key) ? key : [key];
    const r2Key = segments.map(decodeURIComponent).join("/");

    if (segments.length === 0 || segments.length > 6 || !segments.every((s) => SAFE_segment.test(s))) {
      return new Response("Not found", { status: 404 });
    }

    const { env } = getCloudflareContext();
    const bucket = env.FORM_UPLOADS;
    if (!bucket) {
      return new Response("Not found", { status: 404 });
    }

    const object = await bucket.get(r2Key);
    if (!object) {
      return new Response("Not found", { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", object.httpMetadata?.contentType || "application/octet-stream");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new Response(object.body, { headers });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
