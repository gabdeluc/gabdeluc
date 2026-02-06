import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyPassword, createToken, getExpirationDate } from '@/lib/auth';
import { createSession, setSessionCookie } from '@/lib/session';
import { User } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validazione input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username e password sono obbligatori' },
        { status: 400 }
      );
    }

    // Trova utente
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username) as User | undefined;

    if (!user) {
      return NextResponse.json(
        { error: 'Credenziali non valide' },
        { status: 401 }
      );
    }

    // Verifica password
    const isValid = await verifyPassword(password, user.password);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Credenziali non valide' },
        { status: 401 }
      );
    }

    // Crea token JWT
    const { password: _, ...safeUser } = user;
    const token = await createToken(safeUser);

    // Salva sessione nel database
    const expiresAt = getExpirationDate();
    await createSession(user.id, token, expiresAt);

    // Imposta cookie
    await setSessionCookie(token);

    return NextResponse.json({
      message: 'Login effettuato con successo',
      user: safeUser,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}