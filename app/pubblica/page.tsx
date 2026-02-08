"use client";

import useSWR from "swr";
import { Users, Calendar } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface UserRecord {
  id: number;
  username: string;
  created_at: string;
}

export default function PubblicaPage() {
  const { data: users, isLoading } = useSWR<UserRecord[]>("/api/users", fetcher);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Utenti registrati</h1>
          <p className="text-sm text-muted-foreground">Pagina pubblica - accessibile senza login</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : !users || users.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <Users className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
          <p className="text-lg font-medium text-card-foreground">Nessun utente registrato</p>
          <p className="text-sm text-muted-foreground">Registrati per essere il primo!</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">#</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Username</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Data registrazione</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm text-muted-foreground">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{user.username}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(user.created_at).toLocaleDateString("it-IT", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
