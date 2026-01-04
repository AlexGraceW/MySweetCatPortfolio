import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "./prisma";

const COOKIE_NAME = "session_id";

export type SessionUser = {
  userId: number;
  email: string;
};

export function getSessionCookie(): string | undefined {
  return cookies().get(COOKIE_NAME)?.value;
}

export function setSessionCookie(sessionId: string, expiresAt: Date) {
  cookies().set(COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0)
  });
}

export async function createSession(userId: number, ttlHours = 24 * 7) {
  const sessionId = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt
    }
  });

  setSessionCookie(sessionId, expiresAt);

  return { sessionId, expiresAt };
}

export async function deleteSessionById(sessionId: string) {
  await prisma.session.delete({ where: { id: sessionId } }).catch(() => null);
}

export async function getUserFromRequest(req: NextRequest): Promise<SessionUser | null> {
  const sessionId = req.cookies.get(COOKIE_NAME)?.value;
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true }
  });

  if (!session) return null;

  if (session.expiresAt.getTime() < Date.now()) {
    await deleteSessionById(sessionId);
    return null;
  }

  return { userId: session.user.id, email: session.user.email };
}
