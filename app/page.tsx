import React from "react"
import Image from "next/image";
import { Server, Zap, FileCode, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Hero Section */}
      <section className="mb-16 flex flex-col items-center gap-8 lg:flex-row lg:gap-12">
        <div className="flex flex-1 flex-col gap-6">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Zap className="h-4 w-4" />
            Next.js 16
          </div>
          <h1 className="text-balance text-4xl font-bold leading-tight text-foreground lg:text-5xl">
            Il framework React per il web moderno
          </h1>
          <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
            Next.js offre un&apos;esperienza di sviluppo completa con rendering ibrido,
            routing basato su file system, supporto TypeScript nativo e ottimizzazioni
            automatiche delle performance.
          </p>
          <div className="flex gap-3">
            <Link href="/pubblica" className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              Esplora Utenti
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="flex-1">
          <Image
            src="/images/nextjs-hero.jpg"
            alt="Illustrazione del framework Next.js con elementi di codice e sviluppo web"
            width={600}
            height={400}
            className="rounded-lg border border-border shadow-lg"
            priority
          />
        </div>
      </section>

      {/* Features Grid */}
      <section className="mb-16">
        <h2 className="mb-2 text-center text-2xl font-bold text-foreground">Caratteristiche principali</h2>
        <p className="mb-8 text-center text-muted-foreground">
          Tutto quello che serve per costruire applicazioni web moderne e performanti.
        </p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<Server className="h-5 w-5" />}
            title="Server Components"
            description="Rendering lato server con React Server Components per performance ottimali e tempi di caricamento ridotti."
          />
          <FeatureCard
            icon={<FileCode className="h-5 w-5" />}
            title="App Router"
            description="Sistema di routing basato su file system con layout nidificati, loading states e gestione degli errori integrata."
          />
          <FeatureCard
            icon={<Zap className="h-5 w-5" />}
            title="Turbopack"
            description="Bundler di nuova generazione scritto in Rust, fino a 700 volte piu veloce di Webpack per lo sviluppo locale."
          />
          <FeatureCard
            icon={<Globe className="h-5 w-5" />}
            title="API Routes"
            description="Crea endpoint API direttamente nel progetto Next.js con Route Handlers e middleware personalizzati."
          />
        </div>
      </section>

      {/* Info Section with Image */}
      <section className="mb-16 flex flex-col items-center gap-8 lg:flex-row lg:gap-12">
        <div className="flex-1">
          <Image
            src="/images/nextjs-features.jpg"
            alt="Diagramma delle funzionalita di Next.js: SSR, SSG, API Routes e File-based Routing"
            width={600}
            height={400}
            className="rounded-lg border border-border shadow-lg"
          />
        </div>
        <div className="flex flex-1 flex-col gap-4">
          <h2 className="text-2xl font-bold text-foreground">Rendering ibrido</h2>
          <p className="leading-relaxed text-muted-foreground">
            Next.js supporta sia il rendering statico (SSG) che quello lato server (SSR),
            permettendo di scegliere la strategia migliore per ogni pagina. Con le nuove
            direttive &quot;use cache&quot; e i Cache Components, il caching diventa esplicito e flessibile.
          </p>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Static Site Generation (SSG)
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Server-Side Rendering (SSR)
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Incremental Static Regeneration (ISR)
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Client-Side Rendering (CSR)
            </li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
        <p>Costruito con Next.js 16, SQLite e React 19</p>
      </footer>
    </div>
  );
}
