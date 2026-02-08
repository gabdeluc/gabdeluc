import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sortBy = searchParams.get("sortBy") || "Nome";
  const sortOrder = searchParams.get("sortOrder") || "ASC";
  const categoriaId = searchParams.get("categoriaId");
  const search = searchParams.get("search");
  const featured = searchParams.get("featured");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const allowedSort = ["Nome", "Prezzo", "created_at"];
  const allowedOrder = ["ASC", "DESC"];
  const safeSort = allowedSort.includes(sortBy) ? `p.${sortBy}` : "p.Nome";
  const safeOrder = allowedOrder.includes(sortOrder) ? sortOrder : "ASC";

  let query = `
    SELECT 
      p.ID, 
      p.Nome, 
      p.Prezzo, 
      p.Featured,
      p.Categoria_ID,
      c.Nome as Categoria_Nome
    FROM Prodotto p
    LEFT JOIN Categoria c ON p.Categoria_ID = c.ID
    WHERE 1=1
  `;

  const params: any[] = [];

  if (categoriaId) {
    query += " AND p.Categoria_ID = ?";
    params.push(parseInt(categoriaId));
  }

  if (search) {
    query += " AND (p.Nome LIKE ? OR p.Descrizione LIKE ?)";
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }

  if (featured === "true") {
    query += " AND p.Featured = 1";
  }

  if (minPrice) {
    const min = parseFloat(minPrice);
    if (!isNaN(min)) {
      query += " AND p.Prezzo >= ?";
      params.push(min);
    }
  }

  if (maxPrice) {
    const max = parseFloat(maxPrice);
    if (!isNaN(max)) {
      query += " AND p.Prezzo <= ?";
      params.push(max);
    }
  }

  query += ` ORDER BY ${safeSort} ${safeOrder}`;

  const products = db.prepare(query).all(...params);
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const body = await request.json();
  const { Nome, Descrizione, Prezzo, Categoria_ID, Featured = 0 } = body;

  if (!Nome || Nome.trim().length === 0) {
    return NextResponse.json({ error: "Il nome e' obbligatorio." }, { status: 400 });
  }
  if (typeof Prezzo !== "number" || Prezzo < 0) {
    return NextResponse.json({ error: "Il prezzo deve essere un numero positivo." }, { status: 400 });
  }

  const result = db
    .prepare(
      "INSERT INTO Prodotto (Nome, Descrizione, Prezzo, Categoria_ID, Featured) VALUES (?, ?, ?, ?, ?)"
    )
    .run(
      Nome.trim(),
      Descrizione?.trim() || "",
      Prezzo,
      Categoria_ID || null,
      Featured ? 1 : 0
    );

  return NextResponse.json({ success: true, id: result.lastInsertRowid }, { status: 201 });
}
