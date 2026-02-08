import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

interface Category {
    ID: number;
    Nome: string;
    Slug: string;
    Descrizione: string | null;
    Icona: string | null;
    product_count: number;
}

export async function GET() {
    try {
        const categories = db
            .prepare(
                `
        SELECT 
          c.ID,
          c.Nome,
          c.Slug,
          c.Descrizione,
          c.Icona,
          COUNT(p.ID) as product_count
        FROM Categoria c
        LEFT JOIN Prodotto p ON c.ID = p.Categoria_ID
        GROUP BY c.ID
        ORDER BY c.Nome ASC
      `
            )
            .all() as Category[];

        return NextResponse.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json(
            { error: "Failed to fetch categories" },
            { status: 500 }
        );
    }
}
