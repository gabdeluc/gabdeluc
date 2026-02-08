import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface UserProfile {
    id: number;
    username: string;
    email: string | null;
    nome: string | null;
    cognome: string | null;
    telefono: string | null;
    indirizzo: string | null;
    created_at: string;
}

// GET current user's profile
export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const user = db
        .prepare(
            `SELECT id, username, email, nome, cognome, telefono, indirizzo, created_at 
       FROM users WHERE id = ?`
        )
        .get(session.userId) as UserProfile | undefined;

    if (!user) {
        return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
    }

    return NextResponse.json(user);
}

// PUT update user's profile
export async function PUT(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const body = await request.json();
    const { email, nome, cognome, telefono, indirizzo } = body;

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json(
            { error: "Formato email non valido" },
            { status: 400 }
        );
    }

    // Validate phone format if provided (simple check)
    if (telefono && !/^[\d\s\+\-\(\)]+$/.test(telefono)) {
        return NextResponse.json(
            { error: "Formato telefono non valido" },
            { status: 400 }
        );
    }

    try {
        db.prepare(
            `UPDATE users SET 
        email = ?,
        nome = ?,
        cognome = ?,
        telefono = ?,
        indirizzo = ?
       WHERE id = ?`
        ).run(
            email?.trim() || null,
            nome?.trim() || null,
            cognome?.trim() || null,
            telefono?.trim() || null,
            indirizzo?.trim() || null,
            session.userId
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            { error: "Errore nel salvataggio del profilo" },
            { status: 500 }
        );
    }
}
