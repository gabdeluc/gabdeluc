import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Se non autenticato, redirect a login
  if (!user) {
    redirect('/login');
  }

  return <>{children}</>;
}