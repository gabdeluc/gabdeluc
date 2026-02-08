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
  const row = db.prepare("SELECT Foto FROM Prodotto WHERE ID = ?").get(Number(id)) as { Foto: Buffer | null } | undefined;

  if (!row || !row.Foto) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(row.Foto, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=60",
    },
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;
  const formData = await request.formData();
  const file = formData.get("foto") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Nessun file caricato" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  db.prepare("UPDATE Prodotto SET Foto = ? WHERE ID = ?").run(buffer, Number(id));

  return NextResponse.json({ success: true });
}
