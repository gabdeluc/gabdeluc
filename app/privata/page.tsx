"use client";

import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Key,
  Lock,
  Cookie,
  Fingerprint,
  Package,
  ArrowRight,
  Users,
  TrendingUp,
  Crown,
  BarChart3,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Stats {
  products: number;
  users: number;
  totalValue: number;
  avgPrice: number;
  mostExpensive: { Nome: string; Prezzo: number } | null;
}

function StatCard({
  icon,
  label,
  value,
  subtext,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold text-card-foreground">{value}</p>
      {subtext && (
        <p className="text-xs text-muted-foreground">{subtext}</p>
      )}
    </div>
  );
}

function AuthMethodCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 rounded-lg border border-border bg-card p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h3 className="mb-1 font-semibold text-card-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function PrivataPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const { data: stats } = useSWR<Stats>(
    user ? "/api/stats" : null,
    fetcher,
  );

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Area Privata</h1>
          <p className="text-sm text-muted-foreground">
            Benvenuto,{" "}
            <span className="font-medium text-foreground">
              {user.username}
            </span>
          </p>
        </div>
      </div>

      {/* Dashboard Stats */}
      {stats && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Package className="h-4 w-4" />}
            label="Prodotti"
            value={String(stats.products)}
            subtext="nel catalogo"
          />
          <StatCard
            icon={<Users className="h-4 w-4" />}
            label="Utenti"
            value={String(stats.users)}
            subtext="registrati"
          />
          <StatCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="Valore Totale"
            value={stats.totalValue.toLocaleString("it-IT", {
              style: "currency",
              currency: "EUR",
            })}
            subtext={`Media: ${stats.avgPrice.toLocaleString("it-IT", { style: "currency", currency: "EUR" })}`}
          />
          <StatCard
            icon={<Crown className="h-4 w-4" />}
            label="Piu Costoso"
            value={
              stats.mostExpensive
                ? stats.mostExpensive.Prezzo.toLocaleString("it-IT", {
                    style: "currency",
                    currency: "EUR",
                  })
                : "-"
            }
            subtext={stats.mostExpensive?.Nome || "Nessun prodotto"}
          />
        </div>
      )}

      {/* Quick link to products */}
      <Link
        href="/privata/prodotti"
        className="mb-8 flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-4 transition-colors hover:bg-primary/10"
      >
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-primary" />
          <div>
            <p className="font-medium text-foreground">Gestione Prodotti</p>
            <p className="text-sm text-muted-foreground">
              Visualizza, crea, modifica ed elimina prodotti dal catalogo
            </p>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-primary" />
      </Link>

      {/* Auth info with image */}
      <section className="mb-10 flex flex-col items-center gap-8 lg:flex-row lg:gap-12">
        <div className="flex-1">
          <Image
            src="/images/nextjs-auth.jpg"
            alt="Illustrazione dei meccanismi di autenticazione e sicurezza nelle applicazioni web"
            width={500}
            height={350}
            className="rounded-lg border border-border shadow-lg"
          />
        </div>
        <div className="flex flex-1 flex-col gap-4">
          <h2 className="text-xl font-bold text-foreground">
            Autenticazione in Next.js
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            Next.js non include un sistema di autenticazione integrato, ma offre
            strumenti potenti per implementarlo: API Routes, Middleware, Server
            Actions e cookies HTTP-only. Questa app utilizza sessioni basate su
            cookie con hash SHA-256 per le password.
          </p>
        </div>
      </section>

      {/* Auth Methods */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-foreground">
          Tecniche di autenticazione comuni
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <AuthMethodCard
            icon={<Cookie className="h-5 w-5" />}
            title="Session-based (Cookie)"
            description="L'utente si autentica e il server crea una sessione. Un cookie HTTP-only viene inviato al browser per le richieste successive. E' il metodo usato in questa app."
          />
          <AuthMethodCard
            icon={<Key className="h-5 w-5" />}
            title="JWT (JSON Web Token)"
            description="Dopo il login, il server genera un token firmato contenente le informazioni dell'utente. Il token viene inviato ad ogni richiesta nell'header Authorization."
          />
          <AuthMethodCard
            icon={<Lock className="h-5 w-5" />}
            title="OAuth 2.0"
            description="Delega l'autenticazione a provider esterni come Google, GitHub o Facebook. L'utente autorizza l'app senza condividere la propria password."
          />
          <AuthMethodCard
            icon={<Fingerprint className="h-5 w-5" />}
            title="NextAuth.js / Auth.js"
            description="Libreria open-source per Next.js che supporta molteplici provider di autenticazione, sessioni JWT o database, e callback personalizzabili."
          />
        </div>
      </section>
    </div>
  );
}
