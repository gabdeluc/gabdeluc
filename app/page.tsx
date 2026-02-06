import Link from 'next/link';
import { Database, Lock, Layers, Code, Server, Shield } from 'lucide-react';

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Benvenuto nella Demo Next.js Full Stack
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Una Web App dimostrativa che mostra le capacità di{' '}
            <span className="font-semibold text-blue-600">Next.js 14+</span> come
            framework full-stack moderno per applicazioni React production-ready.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Code size={24} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
  Cos&apos;è Next.js?
</h2>

            </div>
            <p className="text-gray-700 leading-relaxed">
              Next.js è un framework React che permette di creare applicazioni web
              complete con rendering lato server (SSR), generazione statica (SSG),
              routing automatico basato su file, API routes integrate, e molto altro.
              È la soluzione ideale per applicazioni moderne che richiedono performance
              eccellenti e SEO ottimizzato.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Layers size={24} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Architettura</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Questa demo implementa un&apos;architettura full-stack completa con frontend
              React, backend API Routes, database SQLite, sistema di autenticazione
              JWT, middleware per protezione route, e gestione file binari (BLOB).
              Tutto in un unico progetto Next.js.
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Funzionalità Implementate
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Lock size={24} className="text-purple-600" />
                <h3 className="text-lg font-bold text-purple-900">
                  Autenticazione
                </h3>
              </div>
              <ul className="space-y-2 text-purple-800 text-sm">
                <li>• Login con JWT tokens</li>
                <li>• Sessioni persistenti</li>
                <li>• Cookie httpOnly sicuri</li>
                <li>• Middleware di protezione</li>
                <li>• Role-based access control</li>
              </ul>
            </div>

            <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Database size={24} className="text-blue-600" />
                <h3 className="text-lg font-bold text-blue-900">
                  Database CRUD
                </h3>
              </div>
              <ul className="space-y-2 text-blue-800 text-sm">
                <li>• SQLite con better-sqlite3</li>
                <li>• Create: Nuovi prodotti</li>
                <li>• Read: Lista con sorting</li>
                <li>• Update: Modifica dettagli</li>
                <li>• Delete: Rimozione sicura</li>
              </ul>
            </div>

            <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Server size={24} className="text-green-600" />
                <h3 className="text-lg font-bold text-green-900">
                  File Upload
                </h3>
              </div>
              <ul className="space-y-2 text-green-800 text-sm">
                <li>• Upload immagini prodotti</li>
                <li>• Storage come BLOB in DB</li>
                <li>• Conversione Base64</li>
                <li>• Preview in tempo reale</li>
                <li>• Gestione dimensioni file</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-gray-50 rounded-lg p-6 mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield size={24} className="text-gray-600" />
            Stack Tecnologico
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-gray-700">
            <div>
              <p className="font-semibold mb-2">Frontend:</p>
              <ul className="space-y-1 text-sm ml-4">
                <li>• Next.js 14+ (App Router)</li>
                <li>• React 18+ (Server Components)</li>
                <li>• TypeScript per type safety</li>
                <li>• Tailwind CSS per styling</li>
                <li>• Lucide React per icone</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">Backend:</p>
              <ul className="space-y-1 text-sm ml-4">
                <li>• API Routes (REST)</li>
                <li>• SQLite + better-sqlite3</li>
                <li>• JWT con jose</li>
                <li>• bcrypt per password</li>
                <li>• Middleware per auth</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Credentials Box */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-blue-900 mb-3">
            🔑 Credenziali di Test
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded p-4">
              <p className="font-semibold text-blue-900 mb-2">Account Admin:</p>
              <p className="text-sm text-gray-700">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">username: admin</span>
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">password: admin123</span>
              </p>
            </div>
            <div className="bg-white rounded p-4">
              <p className="font-semibold text-blue-900 mb-2">Account User:</p>
              <p className="text-sm text-gray-700">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">username: user</span>
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">password: user123</span>
              </p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            Prova il Login →
          </Link>
          <Link
            href="/utenti"
            className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors shadow-md"
          >
            Vedi Utenti Registrati
          </Link>
        </div>
      </div>
    </main>
  );
}