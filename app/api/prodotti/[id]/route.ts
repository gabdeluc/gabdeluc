import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;
  const product = db.prepare("SELECT ID, Nome, Descrizione, Prezzo FROM Prodotto WHERE ID = ?").get(Number(id)) as Record<string, unknown> | undefined;

  if (!product) {
    return NextResponse.json({ error: "Prodotto non trovato" }, { status: 404 });
  }

  // Check if photo exists
  const photoCheck = db.prepare("SELECT CASE WHEN Foto IS NOT NULL THEN 1 ELSE 0 END as hasFoto FROM Prodotto WHERE ID = ?").get(Number(id)) as { hasFoto: number };
  
  return NextResponse.json({ ...product, hasFoto: photoCheck.hasFoto === 1 });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { Nome, Descrizione, Prezzo } = body;

  db.prepare("UPDATE Prodotto SET Nome = ?, Descrizione = ?, Prezzo = ? WHERE ID = ?").run(
    Nome,
    Descrizione,
    Prezzo,
    Number(id)
  );

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;
  const result = db.prepare("DELETE FROM Prodotto WHERE ID = ?").run(Number(id));

  if (result.changes === 0) {
    return NextResponse.json({ error: "Prodotto non trovato" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
