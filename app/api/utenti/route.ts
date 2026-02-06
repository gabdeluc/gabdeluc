import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { User, SafeUser } from '@/lib/types';

export async function GET() {
  try {
    // Query tutti gli utenti (senza password)
    const stmt = db.prepare('SELECT id, username, email, role, created_at FROM users');
    const users = stmt.all() as SafeUser[];

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero degli utenti' },
      { status: 500 }
    );
  }
}