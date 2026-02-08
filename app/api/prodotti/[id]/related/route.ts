import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface Product {
    ID: number;
    Nome: string;
    Prezzo: number;
    Featured: number;
    Categoria_ID: number | null;
    Categoria_Nome: string | null;
    hasFoto: number;
}

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { id } = await params;
    const productId = Number(id);

    // Get the current product to find its category
    const currentProduct = db
        .prepare("SELECT Categoria_ID FROM Prodotto WHERE ID = ?")
        .get(productId) as { Categoria_ID: number | null } | undefined;

    if (!currentProduct) {
        return NextResponse.json({ error: "Prodotto non trovato" }, { status: 404 });
    }

    // If no category, return empty array
    if (!currentProduct.Categoria_ID) {
        return NextResponse.json([]);
    }

    // Get related products from the same category, excluding current product
    const relatedProducts = db
        .prepare(
            `
      SELECT 
        p.ID, 
        p.Nome, 
        p.Prezzo, 
        p.Featured,
        p.Categoria_ID,
        c.Nome as Categoria_Nome,
        CASE WHEN p.Foto IS NOT NULL THEN 1 ELSE 0 END as hasFoto
      FROM Prodotto p
      LEFT JOIN Categoria c ON p.Categoria_ID = c.ID
      WHERE p.Categoria_ID = ? AND p.ID != ?
      ORDER BY p.Featured DESC, RANDOM()
      LIMIT 4
    `
        )
        .all(currentProduct.Categoria_ID, productId) as Product[];

    return NextResponse.json(relatedProducts);
}
