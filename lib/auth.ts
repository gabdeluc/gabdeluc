import { cookies } from "next/headers";
import { createHash, randomBytes } from "crypto";
import db from "./db";

function hashPassword(password: string, salt: string): string {
  return createHash("sha256").update(password + salt).digest("hex");
}

export function createUser(username: string, password: string): { success: boolean; error?: string } {
  try {
    const salt = randomBytes(16).toString("hex");
    const hashed = hashPassword(password, salt);
    db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run(
      username,
      `${salt}:${hashed}`
    );
    return { success: true };
  } catch {
    return { success: false, error: "Username già in uso." };
  }
}

export function verifyUser(username: string, password: string): boolean {
  const user = db.prepare("SELECT password FROM users WHERE username = ?").get(username) as { password: string } | undefined;
  if (!user) return false;
  const [salt, hash] = user.password.split(":");
  const check = hashPassword(password, salt);
  return check === hash;
}

export function getUserId(username: string): number | null {
  const user = db.prepare("SELECT id FROM users WHERE username = ?").get(username) as { id: number } | undefined;
  return user?.id ?? null;
}

const SESSION_COOKIE = "session_token";
const sessions = new Map<string, { username: string; userId: number; expiresAt: number }>();

export function createSession(username: string, userId: number): string {
  const token = randomBytes(32).toString("hex");
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  sessions.set(token, { username, userId, expiresAt });
  return token;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60,
    path: "/",
  });
}

export async function getSession(): Promise<{ username: string; userId: number } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return { username: session.username, userId: session.userId };
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    sessions.delete(token);
  }
  cookieStore.delete(SESSION_COOKIE);
}
