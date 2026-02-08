import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const productCount = db
    .prepare("SELECT COUNT(*) as count FROM Prodotto")
    .get() as { count: number };
  const userCount = db
    .prepare("SELECT COUNT(*) as count FROM users")
    .get() as { count: number };
  const totalValue = db
    .prepare("SELECT COALESCE(SUM(Prezzo), 0) as total FROM Prodotto")
    .get() as { total: number };
  const avgPrice = db
    .prepare("SELECT COALESCE(AVG(Prezzo), 0) as avg FROM Prodotto")
    .get() as { avg: number };
  const mostExpensive = db
    .prepare("SELECT Nome, Prezzo FROM Prodotto ORDER BY Prezzo DESC LIMIT 1")
    .get() as { Nome: string; Prezzo: number } | undefined;

  return NextResponse.json({
    products: productCount.count,
    users: userCount.count,
    totalValue: totalValue.total,
    avgPrice: avgPrice.avg,
    mostExpensive: mostExpensive || null,
  });
}
