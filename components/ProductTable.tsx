'use client';

import { useState } from 'react';
import {
  Edit2,
  Trash2,
  Camera,
  ArrowUpDown,
  Package,
} from 'lucide-react';
import Image from 'next/image';

/* =======================
   TYPES
======================= */

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  has_image?: number;
  imageUrl?: string;
}

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onImageUpload: (id: number, file: File) => Promise<void>;
  onSort: (field: keyof Product) => void;
  sortField: keyof Product;
  sortOrder: 'asc' | 'desc';
}

/* =======================
   SORT ICON (OUTSIDE!)
======================= */

function SortIcon({
  field,
  sortField,
  sortOrder,
}: {
  field: keyof Product;
  sortField: keyof Product;
  sortOrder: 'asc' | 'desc';
}) {
  if (sortField !== field) {
    return <ArrowUpDown size={14} className="text-gray-400" />;
  }

  return (
    <span className="text-blue-600">
      {sortOrder === 'asc' ? '↑' : '↓'}
    </span>
  );
}

/* =======================
   COMPONENT
======================= */

export default function ProductTable({
  products,
  onEdit,
  onDelete,
  onImageUpload,
  onSort,
  sortField,
  sortOrder,
}: ProductTableProps) {
  const [imageLoadingId, setImageLoadingId] = useState<number | null>(null);

  const handleImageChange = async (
    productId: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageLoadingId(productId);
    await onImageUpload(productId, file);
    setImageLoadingId(null);
  };

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Confermi l'eliminazione di "${name}"?`)) {
      onDelete(id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Immagine
              </th>

              {(['name', 'price', 'stock', 'category'] as (keyof Product)[]).map(
                (field) => (
                  <th
                    key={field}
                    onClick={() => onSort(field)}
                    className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2 capitalize">
                      {field}
                      <SortIcon
                        field={field}
                        sortField={sortField}
                        sortOrder={sortOrder}
                      />
                    </div>
                  </th>
                )
              )}

              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Azioni
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden group">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <Camera size={24} className="text-gray-400" />
                      </div>
                    )}

                    {imageLoadingId === product.id ? (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <label className="absolute inset-0 cursor-pointer opacity-0 group-hover:opacity-100 bg-black/50 flex items-center justify-center transition-opacity">
                        <Camera size={20} className="text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleImageChange(product.id, e)
                          }
                        />
                      </label>
                    )}
                  </div>
                </td>

                <td className="py-3 px-4 font-medium text-gray-900">
                  {product.name}
                </td>

                <td className="py-3 px-4 text-gray-700">
                  €{product.price.toFixed(2)}
                </td>

                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.stock < 20
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {product.stock} pz
                  </span>
                </td>

                <td className="py-3 px-4 text-gray-700">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                    {product.category}
                  </span>
                </td>

                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(product)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                      title="Modifica"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(product.id, product.name)
                      }
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      title="Elimina"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            <Package size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">
              Nessun prodotto trovato
            </p>
            <p className="text-sm">
              Crea il tuo primo prodotto usando il form sopra
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
