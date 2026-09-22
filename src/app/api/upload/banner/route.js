import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getUserFromRequest } from "@/lib/session";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Invalid file type. Use JPEG, PNG, WebP, or GIF." }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: "File too large. Maximum 5MB." }, { status: 400 });
    }

    let bucket;
    try {
      const { env } = getCloudflareContext();
      bucket = env?.FORM_UPLOADS;
    } catch {
      // getCloudflareContext may throw in local dev without wrangler
    }

    if (!bucket) {
      return NextResponse.json({ success: false, error: "File storage not available in local development. Deploy to Cloudflare to use banner uploads." }, { status: 503 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const key = `banners/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    await bucket.put(key, arrayBuffer, {
      httpMetadata: { contentType: file.type },
      customMetadata: { filename: file.name },
    });

    return NextResponse.json({ success: true, key });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message || "Upload failed" }, { status: 500 });
  }
}
