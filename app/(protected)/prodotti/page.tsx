'use client';

import { useState, useEffect } from 'react';
import { Package, Plus, AlertCircle } from 'lucide-react';
import ProductForm, { ProductFormData } from '@/components/ProductForm';
import ProductTable from '@/components/ProductTable';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  has_image?: number;
  imageUrl?: string;
}

export default function ProdottiPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [sortField, setSortField] = useState<keyof Product>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Carica prodotti
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/prodotti?sortBy=${sortField}&order=${sortOrder}`);
      
      if (!res.ok) throw new Error('Errore nel caricamento');
      
      const data = await res.json();
      
      // Carica immagini per ogni prodotto che le ha
      const productsWithImages = await Promise.all(
        data.products.map(async (p: Product) => {
          if (p.has_image) {
            try {
              const imgRes = await fetch(`/api/prodotti/${p.id}`);
              if (imgRes.ok) {
                const imgData = await imgRes.json();
                return { ...p, imageUrl: imgData.product.imageUrl };
              }
            } catch (err) {
              console.error(`Error loading image for product ${p.id}:`, err);
            }
          }
          return p;
        })
      );
      
      setProducts(productsWithImages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [sortField, sortOrder]);

  // Crea/Aggiorna prodotto
  const handleSave = async (data: ProductFormData) => {
    try {
      const url = editingProduct 
        ? `/api/prodotti/${editingProduct.id}`
        : '/api/prodotti';
      
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Errore nel salvataggio');
      }

      setSuccess(editingProduct ? 'Prodotto aggiornato!' : 'Prodotto creato!');
      setShowForm(false);
      setEditingProduct(null);
      fetchProducts();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  // Elimina prodotto
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/prodotti/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Errore nell\'eliminazione');

      setSuccess('Prodotto eliminato!');
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  // Upload immagine
  const handleImageUpload = async (id: number, file: File) => {
    try {
      // Converti in base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      await new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64 = reader.result as string;
            
            const res = await fetch(`/api/prodotti/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ imageBase64: base64 }),
            });

            if (!res.ok) throw new Error('Errore upload immagine');

            setSuccess('Immagine caricata!');
            fetchProducts();
            setTimeout(() => setSuccess(''), 3000);
            resolve(true);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = reject;
      });
    } catch (err: any) {
      setError(err.message || 'Errore upload');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Modifica prodotto
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  // Cancella form
  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  // Sorting
  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package size={32} className="text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestione Prodotti</h1>
              <p className="text-gray-600 mt-1">
                CRUD completo con upload immagini e sorting
              </p>
            </div>
          </div>
          
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
            >
              <Plus size={20} />
              <span>Nuovo Prodotto</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="mb-6">
          <ProductForm
            product={editingProduct}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Table */}
      {!loading && (
        <ProductTable
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onImageUpload={handleImageUpload}
          onSort={handleSort}
          sortField={sortField}
          sortOrder={sortOrder}
        />
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          💡 <strong>Tips:</strong> Clicca sulle intestazioni della tabella per ordinare i dati.
          Passa il mouse sulle immagini per caricare nuove foto. Le immagini sono salvate come BLOB nel database SQLite.
        </p>
      </div>
    </main>
  );
}
