"use client";

import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import useSWR from "swr";
import Link from "next/link";
import { toast } from "sonner";
import {
  Package,
  Search,
  Plus,
  X,
  Star,
  Filter,
  Grid3X3,
  List,
  Tag,
  ChevronDown,
  ArrowUpDown,
  SlidersHorizontal,
} from "lucide-react";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch");
  }
  return res.json();
};

interface Product {
  ID: number;
  Nome: string;
  Descrizione?: string;
  Prezzo: number;
  Featured: number;
  Categoria_ID: number | null;
  Categoria_Nome: string | null;
}

interface Category {
  ID: number;
  Nome: string;
  Slug: string;
}

type SortOption = "nome-asc" | "nome-desc" | "prezzo-asc" | "prezzo-desc";

export default function ProdottiPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOption, setSortOption] = useState<SortOption>("nome-asc");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [newNome, setNewNome] = useState("");
  const [newDescrizione, setNewDescrizione] = useState("");
  const [newPrezzo, setNewPrezzo] = useState("");
  const [newCategoriaId, setNewCategoriaId] = useState("");
  const [newFeatured, setNewFeatured] = useState(false);
  const [adding, setAdding] = useState(false);

  // Build API URL with all filters
  const apiUrl = useMemo(() => {
    if (!user) return null;
    const params = new URLSearchParams();

    // Sort
    const [sortBy, sortOrder] = sortOption === "nome-asc" ? ["Nome", "ASC"]
      : sortOption === "nome-desc" ? ["Nome", "DESC"]
        : sortOption === "prezzo-asc" ? ["Prezzo", "ASC"]
          : ["Prezzo", "DESC"];
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);

    // Category
    if (selectedCategory) params.set("categoriaId", selectedCategory);

    // Price range
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);

    // Search (server-side)
    if (searchQuery) params.set("search", searchQuery);

    return `/api/prodotti?${params.toString()}`;
  }, [user, sortOption, selectedCategory, minPrice, maxPrice, searchQuery]);

  const {
    data: products,
    isLoading,
    mutate,
  } = useSWR<Product[]>(apiUrl, fetcher);

  const { data: categories } = useSWR<Category[]>(
    user ? "/api/categories" : null,
    fetcher
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const filteredProducts = Array.isArray(products) ? products : [];

  const hasActiveFilters = selectedCategory || minPrice || maxPrice;

  function clearFilters() {
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await fetch("/api/prodotti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Nome: newNome,
          Descrizione: newDescrizione,
          Prezzo: parseFloat(newPrezzo),
          Categoria_ID: newCategoriaId ? parseInt(newCategoriaId) : null,
          Featured: newFeatured,
        }),
      });
      if (res.ok) {
        toast.success("Prodotto aggiunto con successo!");
        setNewNome("");
        setNewDescrizione("");
        setNewPrezzo("");
        setNewCategoriaId("");
        setNewFeatured(false);
        setShowAddForm(false);
        mutate();
      } else {
        const data = await res.json();
        toast.error(data.error || "Errore nell'aggiunta del prodotto.");
      }
    } catch {
      toast.error("Errore di rete.");
    } finally {
      setAdding(false);
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center py-32">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Package className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Catalogo Prodotti
                </h1>
                <p className="text-muted-foreground">
                  {filteredProducts.length} prodotti
                  {hasActiveFilters || searchQuery ? " trovati" : " disponibili"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:-translate-y-0.5"
            >
              <Plus className="h-5 w-5" />
              Nuovo Prodotto
            </button>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="mb-8 space-y-4">
          {/* Main Search Bar */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cerca prodotti..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-input bg-card py-3 pl-12 pr-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="h-full appearance-none rounded-xl border border-input bg-card py-3 pl-10 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="nome-asc">Nome A-Z</option>
                <option value="nome-desc">Nome Z-A</option>
                <option value="prezzo-asc">Prezzo: crescente</option>
                <option value="prezzo-desc">Prezzo: decrescente</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>

            {/* Toggle Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${showFilters || hasActiveFilters
                ? "border-primary bg-primary/10 text-primary"
                : "border-input bg-card text-foreground hover:bg-accent"
                }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtri
              {hasActiveFilters && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {(selectedCategory ? 1 : 0) + (minPrice || maxPrice ? 1 : 0)}
                </span>
              )}
            </button>

            {/* View Toggle */}
            <div className="flex rounded-xl border border-input bg-card p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-lg p-2 transition-all ${viewMode === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-lg p-2 transition-all ${viewMode === "list"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex flex-wrap items-end gap-4">
                {/* Category */}
                <div className="min-w-[180px] flex-1">
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Categoria
                  </label>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-input bg-background py-2.5 pl-10 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Tutte le categorie</option>
                      {categories?.map((cat) => (
                        <option key={cat.ID} value={cat.ID}>
                          {cat.Nome}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Min Price */}
                <div className="w-32">
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Prezzo min (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Max Price */}
                <div className="w-32">
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Prezzo max (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="∞"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 rounded-xl border border-destructive/30 px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4" />
                    Pulisci filtri
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Add Product Form */}
        {showAddForm && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="border-b border-border bg-primary px-6 py-4">
              <h3 className="text-lg font-semibold text-primary-foreground">
                Aggiungi nuovo prodotto
              </h3>
            </div>
            <form onSubmit={handleAddProduct} className="p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Nome *
                  </label>
                  <input
                    type="text"
                    maxLength={40}
                    value={newNome}
                    onChange={(e) => setNewNome(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Nome del prodotto"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Prezzo (EUR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newPrezzo}
                    onChange={(e) => setNewPrezzo(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Categoria
                  </label>
                  <select
                    value={newCategoriaId}
                    onChange={(e) => setNewCategoriaId(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Nessuna categoria</option>
                    {categories?.map((cat) => (
                      <option key={cat.ID} value={cat.ID}>
                        {cat.Nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Descrizione
                </label>
                <textarea
                  maxLength={1000}
                  rows={3}
                  value={newDescrizione}
                  onChange={(e) => setNewDescrizione(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Descrizione del prodotto"
                />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <input
                  id="featured"
                  type="checkbox"
                  checked={newFeatured}
                  onChange={(e) => setNewFeatured(e.target.checked)}
                  className="h-5 w-5 rounded-md border-input text-primary focus:ring-ring"
                />
                <label
                  htmlFor="featured"
                  className="text-sm font-medium text-foreground"
                >
                  Prodotto in evidenza
                </label>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  disabled={adding}
                  className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50"
                >
                  {adding ? "Aggiunta..." : "Aggiungi prodotto"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-xl border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  Annulla
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products Grid/List */}
        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">
              {hasActiveFilters || searchQuery
                ? "Nessun prodotto trovato"
                : "Nessun prodotto disponibile"}
            </h3>
            <p className="mt-2 text-muted-foreground">
              {hasActiveFilters || searchQuery
                ? "Prova a modificare i filtri di ricerca"
                : "Aggiungi il tuo primo prodotto"}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <X className="h-4 w-4" />
                Rimuovi tutti i filtri
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <div
                key={product.ID}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Featured Badge */}
                {product.Featured === 1 && (
                  <div className="absolute left-4 top-4 z-10 flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                    <Star className="h-3 w-3 fill-current" />
                    Featured
                  </div>
                )}

                {/* Product Image Placeholder */}
                <div className="relative aspect-square bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="h-16 w-16 text-muted-foreground/30" />
                  </div>
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 opacity-0 transition-all duration-300 group-hover:bg-foreground/60 group-hover:opacity-100">
                    <Link
                      href={`/privata/prodotti/${product.ID}`}
                      className="rounded-xl bg-background px-5 py-2.5 text-sm font-semibold text-foreground shadow-lg transition-transform hover:scale-105"
                    >
                      Dettagli
                    </Link>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5">
                  {/* Category */}
                  {product.Categoria_Nome && (
                    <div className="mb-2 flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">
                        {product.Categoria_Nome}
                      </span>
                    </div>
                  )}

                  {/* Name */}
                  <Link href={`/privata/prodotti/${product.ID}`}>
                    <h3 className="font-semibold text-card-foreground transition-colors hover:text-primary">
                      {product.Nome}
                    </h3>
                  </Link>

                  {/* Price */}
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Prezzo
                      </p>
                      <p className="text-xl font-bold text-primary">
                        {product.Prezzo.toLocaleString("it-IT", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </p>
                    </div>
                    <Link
                      href={`/privata/prodotti/${product.ID}`}
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:scale-105"
                    >
                      <ArrowUpDown className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div
                key={product.ID}
                className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="relative aspect-video w-full bg-muted sm:aspect-square sm:w-48">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                    {product.Featured === 1 && (
                      <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                        <Star className="h-3 w-3 fill-current" />
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        {product.Categoria_Nome && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                            <Tag className="h-3 w-3" />
                            {product.Categoria_Nome}
                          </span>
                        )}
                      </div>
                      <Link href={`/privata/prodotti/${product.ID}`}>
                        <h3 className="mt-2 text-lg font-semibold text-card-foreground transition-colors hover:text-primary">
                          {product.Nome}
                        </h3>
                      </Link>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-2xl font-bold text-primary">
                        {product.Prezzo.toLocaleString("it-IT", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </p>
                      <div className="flex gap-2">
                        <Link
                          href={`/privata/prodotti/${product.ID}`}
                          className="rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                        >
                          Dettagli
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
