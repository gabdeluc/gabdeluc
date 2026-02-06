import { LayoutDashboard, Package, Users, TrendingUp, DollarSign } from 'lucide-react';
import { getCurrentUser } from '@/lib/session';
import db from '@/lib/db';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Statistiche prodotti
  const productsStats = db.prepare(`
    SELECT 
      COUNT(*) as total_products,
      SUM(stock) as total_stock,
      AVG(price) as avg_price,
      SUM(price * stock) as total_value,
      COUNT(CASE WHEN stock < 20 THEN 1 END) as low_stock_count
    FROM products
  `).get() as any;

  // Conteggio utenti
  const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;

  // Prodotti per categoria
  const categoryStats = db.prepare(`
    SELECT 
      category,
      COUNT(*) as count,
      SUM(stock) as total_stock
    FROM products
    GROUP BY category
    ORDER BY count DESC
  `).all() as any[];

  // Prodotti con stock basso
  const lowStockProducts = db.prepare(`
    SELECT id, name, stock, price
    FROM products
    WHERE stock < 20
    ORDER BY stock ASC
    LIMIT 5
  `).all() as any[];

  // Ultimi prodotti aggiunti
  const recentProducts = db.prepare(`
    SELECT id, name, price, stock, created_at
    FROM products
    ORDER BY created_at DESC
    LIMIT 5
  `).all() as any[];

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <LayoutDashboard size={32} className="text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <p className="text-gray-600">
          Benvenuto, <span className="font-semibold">{user?.username}</span>! 
          Panoramica completa dell&apos;inventario e statistiche.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 font-medium">Prodotti Totali</p>
              <p className="text-3xl font-bold text-gray-900">{productsStats.total_products || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package size={24} className="text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {productsStats.low_stock_count || 0} con stock basso (&lt; 20)
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 font-medium">Stock Totale</p>
              <p className="text-3xl font-bold text-gray-900">{productsStats.total_stock || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp size={24} className="text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">Unità in magazzino</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 font-medium">Valore Inventario</p>
              <p className="text-3xl font-bold text-gray-900">
                €{(productsStats.total_value || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign size={24} className="text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Prezzo medio: €{(productsStats.avg_price || 0).toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 font-medium">Utenti Registrati</p>
              <p className="text-3xl font-bold text-gray-900">{usersCount.count || 0}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Users size={24} className="text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">Account attivi nel sistema</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Prodotti per Categoria */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Prodotti per Categoria</h2>
          </div>
          <div className="p-6">
            {categoryStats.length > 0 ? (
              <div className="space-y-4">
                {categoryStats.map((cat) => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{cat.category}</span>
                      <span className="text-sm text-gray-600">
                        {cat.count} prodotti · {cat.total_stock} pz
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(cat.count / productsStats.total_products) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Nessuna categoria disponibile</p>
            )}
          </div>
        </div>

        {/* Prodotti con Stock Basso */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Allerta Stock Basso</h2>
          </div>
          <div className="p-6">
            {lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">€{product.price.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                        {product.stock} pz
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                  <TrendingUp size={24} className="text-green-600" />
                </div>
                <p className="text-green-600 font-medium">Tutto ok!</p>
                <p className="text-sm text-gray-500">Nessun prodotto con stock basso</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prodotti Recenti */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Ultimi Prodotti Aggiunti</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Nome</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Prezzo</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Stock</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Aggiunto il</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentProducts.length > 0 ? (
                recentProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{product.name}</td>
                    <td className="py-3 px-4 text-gray-700">€{product.price.toFixed(2)}</td>
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
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {new Date(product.created_at).toLocaleDateString('it-IT')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    Nessun prodotto disponibile
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}