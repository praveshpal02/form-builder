import { cookies } from "next/headers";
import { getDb } from "./db";
import { generateSessionToken, SESSION_COOKIE_NAME_CONST, getSessionCookieOptions, getExpiredSessionCookieOptions } from "./auth";

export async function createSession(userId) {
  const db = getDb();
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await db.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return token;
}

export async function getSession(token) {
  if (!token) return null;
  
  const db = getDb();
  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { token } });
    return null;
  }

  return session;
}

export async function deleteSession(token) {
  if (!token) return;
  
  const db = getDb();
  await db.session.delete({ where: { token } }).catch(() => {});
}

export function setSessionCookie(response, token) {
  response.cookies.set(SESSION_COOKIE_NAME_CONST, token, getSessionCookieOptions());
}

export function clearSessionCookie(response) {
  response.cookies.set(SESSION_COOKIE_NAME_CONST, "", getExpiredSessionCookieOptions());
}

export async function getUserFromRequest(request) {
  let token;

  if (request?.cookies?.get) {
    token = request.cookies.get(SESSION_COOKIE_NAME_CONST)?.value;
  } else {
    const cookieStore = await cookies();
    token = cookieStore.get(SESSION_COOKIE_NAME_CONST)?.value;
  }

  const session = await getSession(token);
  return session?.user || null;
}

export async function requireAuth(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return { user: null, redirect: "/login" };
  }
  return { user, redirect: null };
}
