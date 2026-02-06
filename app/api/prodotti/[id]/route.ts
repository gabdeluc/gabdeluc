import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { Product } from '@/lib/types';

// GET - Dettagli prodotto singolo (con immagine)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
    const product = stmt.get(params.id) as Product | undefined;

    if (!product) {
      return NextResponse.json(
        { error: 'Prodotto non trovato' },
        { status: 404 }
      );
    }

    // Converti BLOB in base64 per invio al client
    let productWithImage = { ...product, imageUrl: null as string | null };
    
    if (product.image) {
      const base64 = Buffer.from(product.image).toString('base64');
      productWithImage.imageUrl = `data:image/jpeg;base64,${base64}`;
    }

    // Rimuovi il BLOB dal response
    const { image, ...productData } = productWithImage;

    return NextResponse.json({ product: productData });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero del prodotto' },
      { status: 500 }
    );
  }
}

// PUT - Aggiorna prodotto
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, price, stock, category, imageBase64 } = body;

    // Verifica esistenza prodotto
    const checkStmt = db.prepare('SELECT id FROM products WHERE id = ?');
    const exists = checkStmt.get(params.id);

    if (!exists) {
      return NextResponse.json(
        { error: 'Prodotto non trovato' },
        { status: 404 }
      );
    }

    // Prepara update
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (price !== undefined) {
      if (price < 0) {
        return NextResponse.json(
          { error: 'Il prezzo deve essere positivo' },
          { status: 400 }
        );
      }
      updates.push('price = ?');
      values.push(price);
    }
    if (stock !== undefined) {
      if (stock < 0) {
        return NextResponse.json(
          { error: 'Lo stock deve essere positivo' },
          { status: 400 }
        );
      }
      updates.push('stock = ?');
      values.push(stock);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      values.push(category);
    }
    if (imageBase64 !== undefined) {
      if (imageBase64 === null) {
        updates.push('image = NULL');
      } else {
        // Converti base64 a Buffer
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        updates.push('image = ?');
        values.push(buffer);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'Nessun campo da aggiornare' },
        { status: 400 }
      );
    }

    // Aggiungi updated_at
    updates.push("updated_at = datetime('now')");

    // Esegui update
    values.push(params.id);
    const stmt = db.prepare(`
      UPDATE products 
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    // Recupera prodotto aggiornato
    const getStmt = db.prepare('SELECT * FROM products WHERE id = ?');
    const product = getStmt.get(params.id) as Product;

    return NextResponse.json({ message: 'Prodotto aggiornato', product });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento del prodotto' },
      { status: 500 }
    );
  }
}

// DELETE - Elimina prodotto
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    const result = stmt.run(params.id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Prodotto non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Prodotto eliminato' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione del prodotto' },
      { status: 500 }
    );
  }
}