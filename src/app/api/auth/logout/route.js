import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/session";
import { clearSessionCookie } from "@/lib/session";

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);

    if (user) {
      const token = request.cookies.get("auth_session")?.value;
      if (token) {
        const { deleteSession } = await import("@/lib/session");
        await deleteSession(token);
      }
    }

    const response = NextResponse.json({ success: true });
    clearSessionCookie(response);

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    const response = NextResponse.json({ success: true });
    clearSessionCookie(response);
    return response;
  }
}