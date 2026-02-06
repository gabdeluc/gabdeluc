import { Users } from 'lucide-react';

export default async function UtentiPage() {
  // Fetch utenti dall'API
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/utenti`, {
    cache: 'no-store',
  });
  
  const { users } = await res.json();

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Users size={32} className="text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Utenti Registrati</h1>
              <p className="text-gray-600 mt-1">
                Questa è una pagina pubblica (read-only) - nessun login richiesto
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Username</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Ruolo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Registrato il</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-900 font-mono">{user.id}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{user.username}</td>
                    <td className="py-3 px-4 text-gray-700">{user.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {new Date(user.created_at).toLocaleDateString('it-IT', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              💡 <strong>Nota:</strong> Questa pagina è accessibile senza autenticazione.
              Per accedere alle funzionalità di gestione prodotti, effettua il{' '}
              <a href="/login" className="underline font-semibold hover:text-blue-900">
                login
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}