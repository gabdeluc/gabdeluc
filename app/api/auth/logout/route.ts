import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (token) {
      // Elimina sessione dal database
      deleteSession(token);
    }

    // Rimuovi cookie
    cookieStore.delete('session_token');

    return NextResponse.json({ message: 'Logout effettuato con successo' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Errore durante il logout' },
      { status: 500 }
    );
  }
}