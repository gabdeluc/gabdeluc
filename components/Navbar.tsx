'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Users, LayoutDashboard, Package, LogIn, LogOut } from 'lucide-react';
import { SafeUser } from '@/lib/types';

interface NavbarProps {
  user: SafeUser | null;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (res.ok) {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo e navigazione principale */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-blue-600 hover:text-blue-700">
              Next.js Demo
            </Link>
            
            <div className="flex gap-1">
              <Link
                href="/"
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  isActive('/') 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Home size={18} />
                <span className="font-medium">Home</span>
              </Link>

              <Link
                href="/utenti"
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  isActive('/utenti') 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Users size={18} />
                <span className="font-medium">Utenti</span>
              </Link>

              {user && (
                <>
                  <Link
                    href="/dashboard"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      isActive('/dashboard') 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <LayoutDashboard size={18} />
                    <span className="font-medium">Dashboard</span>
                  </Link>

                  <Link
                    href="/prodotti"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      isActive('/prodotti') 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Package size={18} />
                    <span className="font-medium">Prodotti</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* User info e azioni */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="text-sm text-gray-600">
                  Ciao, <span className="font-semibold text-gray-900">{user.username}</span>
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-medium"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
              >
                <LogIn size={18} />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}