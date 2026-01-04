// REPLACE FILE: src/lib/auth.ts
import { cookies } from "next/headers";

export const COOKIE_NAME = "admin_session";

export async function get_session_cookie(): Promise<string | undefined> {
  const cookie_store = await cookies();
  return cookie_store.get(COOKIE_NAME)?.value;
}

export async function set_session_cookie(
  session_id: string,
  expires_at: Date
): Promise<void> {
  const cookie_store = await cookies();

  cookie_store.set({
    name: COOKIE_NAME,
    value: session_id,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expires_at
  });
}

export async function clear_session_cookie(): Promise<void> {
  const cookie_store = await cookies();

  cookie_store.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0)
  });
}
