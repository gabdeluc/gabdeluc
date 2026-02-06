import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { Product } from '@/lib/types';

// GET - Lista tutti i prodotti
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    // Query parametri per sorting
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'name';
    const order = searchParams.get('order') || 'asc';

    // Validazione campi di sorting
    const validFields = ['name', 'price', 'stock', 'category', 'created_at'];
    const field = validFields.includes(sortBy) ? sortBy : 'name';
    const direction = order === 'desc' ? 'DESC' : 'ASC';

    // Query prodotti (senza BLOB per performance)
    const stmt = db.prepare(`
      SELECT id, name, price, stock, category, created_at, updated_at,
             CASE WHEN image IS NOT NULL THEN 1 ELSE 0 END as has_image
      FROM products
      ORDER BY ${field} ${direction}
    `);
    
    const products = stmt.all();

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei prodotti' },
      { status: 500 }
    );
  }
}

// POST - Crea nuovo prodotto
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    const { name, price, stock, category } = await request.json();

    // Validazione
    if (!name || price === undefined || stock === undefined || !category) {
      return NextResponse.json(
        { error: 'Tutti i campi sono obbligatori' },
        { status: 400 }
      );
    }

    if (price < 0 || stock < 0) {
      return NextResponse.json(
        { error: 'Prezzo e stock devono essere positivi' },
        { status: 400 }
      );
    }

    // Inserisci prodotto
    const stmt = db.prepare(`
      INSERT INTO products (name, price, stock, category)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(name, price, stock, category);

    // Recupera prodotto creato
    const getStmt = db.prepare('SELECT * FROM products WHERE id = ?');
    const product = getStmt.get(result.lastInsertRowid) as Product;

    return NextResponse.json(
      { message: 'Prodotto creato', product },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Errore nella creazione del prodotto' },
      { status: 500 }
    );
  }
}