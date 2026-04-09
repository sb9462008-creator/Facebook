import { cookies } from "next/headers";
import { getUserById } from "./store";
import type { User } from "./store";

const SESSION_COOKIE = "session_uid";

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const uid = cookieStore.get(SESSION_COOKIE)?.value;
  if (!uid) return null;
  return getUserById(uid);
}

export async function setSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
