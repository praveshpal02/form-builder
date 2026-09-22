import { getCloudflareContext } from "@opennextjs/cloudflare";

const SAFE_KEY = /^[a-zA-Z0-9._-]{1,120}$/;

export async function GET(request, { params }) {
  try {
    const { id, key } = await params;
    if (typeof key !== "string" || !SAFE_KEY.test(key)) {
      return new Response("Not found", { status: 404 });
    }

    const { env } = getCloudflareContext();
    const bucket = env.FORM_UPLOADS;
    if (!bucket) {
      return new Response("Not found", { status: 404 });
    }

    const object = await bucket.get(`uploads/${id}/${key}`);
    if (!object) {
      return new Response("Not found", { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", object.httpMetadata?.contentType || "application/octet-stream");
    headers.set("Content-Disposition", `inline; filename="${String(object.customMetadata?.filename || key).replace(/"/g, "")}"`);
    headers.set("Cache-Control", "public, max-age=3600");

    return new Response(object.body, { headers });
  } catch (error) {
    return new Response("Not found", { status: 404 });
  }
}