import { cookies } from 'next/headers';
import db, { cleanupExpiredSessions } from './db';
import { verifyToken } from './auth';
import { Session, SafeUser, User } from './types';

const SESSION_COOKIE_NAME = 'session_token';

/**
 * Crea una nuova sessione
 */
export async function createSession(userId: number, token: string, expiresAt: string): Promise<void> {
  const stmt = db.prepare(`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (?, ?, ?)
  `);

  stmt.run(userId, token, expiresAt);

  // Cleanup vecchie sessioni
  cleanupExpiredSessions();
}

/**
 * Ottiene sessione da token
 */
export function getSessionByToken(token: string): Session | null {
  const stmt = db.prepare(`
    SELECT * FROM sessions 
    WHERE token = ? AND datetime(expires_at) > datetime('now')
  `);

  return stmt.get(token) as Session | null;
}

/**
 * Elimina sessione
 */
export function deleteSession(token: string): void {
  const stmt = db.prepare('DELETE FROM sessions WHERE token = ?');
  stmt.run(token);
}

/**
 * Elimina tutte le sessioni di un utente
 */
export function deleteUserSessions(userId: number): void {
  const stmt = db.prepare('DELETE FROM sessions WHERE user_id = ?');
  stmt.run(userId);
}

/**
 * Ottiene l'utente dalla sessione corrente
 */
export async function getCurrentUser(): Promise<SafeUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  // Verifica JWT
  const payload = await verifyToken(token);
  if (!payload) return null;

  // Verifica sessione nel DB
  const session = getSessionByToken(token);
  if (!session) return null;

  // Ottieni utente
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  const user = stmt.get(payload.userId) as User | undefined;

  if (!user) return null;

  // Rimuovi password
  const { password, ...safeUser } = user;
  return safeUser;
}

/**
 * Imposta cookie di sessione
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 giorni
    path: '/',
  });
}

/**
 * Rimuove cookie di sessione
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}