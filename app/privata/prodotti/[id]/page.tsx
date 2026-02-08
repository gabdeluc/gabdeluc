"use client";

import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Upload,
  ImageIcon,
  Trash2,
  Package,
  Star,
  Tag,
} from "lucide-react";
import Link from "next/link";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

interface ProductDetail {
  ID: number;
  Nome: string;
  Descrizione: string;
  Prezzo: number;
  Featured: number;
  Categoria_ID: number | null;
  Categoria_Nome: string | null;
  hasFoto: boolean;
}

interface RelatedProduct {
  ID: number;
  Nome: string;
  Prezzo: number;
  Featured: number;
  Categoria_Nome: string | null;
  hasFoto: number;
}

interface Category {
  ID: number;
  Nome: string;
}

export default function ProductDetailPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const {
    data: product,
    isLoading,
    mutate,
  } = useSWR<ProductDetail>(user ? `/api/prodotti/${id}` : null, fetcher);

  const { data: relatedProducts } = useSWR<RelatedProduct[]>(
    user && product ? `/api/prodotti/${id}/related` : null,
    fetcher
  );

  const { data: categories } = useSWR<Category[]>(
    user ? "/api/categories" : null,
    fetcher
  );

  const [nome, setNome] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [prezzo, setPrezzo] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [featured, setFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [photoKey, setPhotoKey] = useState(0);

  const populateForm = useCallback(() => {
    if (product && product.Nome) {
      setNome(product.Nome);
      setDescrizione(product.Descrizione || "");
      setPrezzo(String(product.Prezzo));
      setCategoriaId(product.Categoria_ID?.toString() || "");
      setFeatured(product.Featured === 1);
    }
  }, [product]);

  useEffect(() => {
    populateForm();
  }, [populateForm]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/prodotti/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Nome: nome,
          Descrizione: descrizione,
          Prezzo: parseFloat(prezzo),
          Categoria_ID: categoriaId ? parseInt(categoriaId) : null,
          Featured: featured,
        }),
      });
      if (res.ok) {
        toast.success("Prodotto aggiornato con successo!");
        mutate();
      } else {
        toast.error("Errore nel salvataggio.");
      }
    } catch {
      toast.error("Errore di rete.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/prodotti/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Prodotto eliminato con successo!");
        router.push("/privata/prodotti");
      } else {
        toast.error("Errore nell'eliminazione del prodotto.");
      }
    } catch {
      toast.error("Errore di rete.");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("foto", file);

    try {
      const res = await fetch(`/api/prodotti/${id}/foto`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        toast.success("Foto caricata con successo!");
        setPhotoKey((k) => k + 1);
        mutate();
      } else {
        toast.error("Errore nel caricamento della foto.");
      }
    } catch {
      toast.error("Errore di rete.");
    } finally {
      setUploading(false);
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

  if (!user || !product) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/privata/prodotti"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna ai Prodotti
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - Current Details */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-bold text-card-foreground">
                Dettagli Attuali
              </h2>

              {/* Product Image */}
              <div className="relative mb-6 aspect-square overflow-hidden rounded-2xl bg-muted">
                {product.hasFoto ? (
                  <img
                    key={photoKey}
                    src={`/api/prodotti/${id}/foto?v=${photoKey}`}
                    alt={`Foto di ${product.Nome}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-muted-foreground">
                    <Package className="h-20 w-20 opacity-30" />
                    <span className="text-sm">Nessuna immagine</span>
                  </div>
                )}
                {/* Badges */}
                <div className="absolute left-4 top-4 flex flex-col gap-2">
                  {product.Featured === 1 && (
                    <div className="flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      In Evidenza
                    </div>
                  )}
                  {product.Categoria_Nome && (
                    <div className="flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1.5 text-xs font-medium text-card-foreground shadow-sm backdrop-blur-sm">
                      <Tag className="h-3.5 w-3.5" />
                      {product.Categoria_Nome}
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Nome Prodotto
                  </p>
                  <h3 className="mt-1 text-2xl font-bold text-card-foreground">
                    {product.Nome}
                  </h3>
                </div>

                {product.Descrizione && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Descrizione
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {product.Descrizione}
                    </p>
                  </div>
                )}

                <div className="border-t border-border pt-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Prezzo
                  </p>
                  <p className="mt-1 text-3xl font-bold text-primary">
                    {product.Prezzo.toLocaleString("it-IT", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Edit Product */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-card-foreground">
                  Modifica Prodotto
                </h2>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Elimina
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-5">
                {/* Nome */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Nome Prodotto *
                  </label>
                  <input
                    type="text"
                    maxLength={40}
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {nome.length}/40 caratteri
                  </p>
                </div>

                {/* Prezzo & Categoria */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Prezzo (EUR) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={prezzo}
                      onChange={(e) => setPrezzo(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Categoria
                    </label>
                    <select
                      value={categoriaId}
                      onChange={(e) => setCategoriaId(e.target.value)}
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

                {/* Descrizione */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Descrizione
                  </label>
                  <textarea
                    maxLength={1000}
                    rows={4}
                    value={descrizione}
                    onChange={(e) => setDescrizione(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Descrizione del prodotto..."
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {descrizione.length}/1000 caratteri
                  </p>
                </div>

                {/* Product Image Upload */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Immagine Prodotto
                  </label>
                  <div className="relative aspect-[3/2] overflow-hidden rounded-xl border-2 border-dashed border-input bg-muted/30">
                    {product.hasFoto ? (
                      <img
                        key={photoKey}
                        src={`/api/prodotti/${id}/foto?v=${photoKey}`}
                        alt={`Foto di ${product.Nome}`}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                        <ImageIcon className="h-10 w-10 opacity-50" />
                        <span className="text-sm">Nessuna immagine</span>
                      </div>
                    )}
                  </div>
                  <label
                    className={`mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-primary/50 bg-primary/5 px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10 ${uploading ? "pointer-events-none opacity-50" : ""}`}
                  >
                    <Upload className="h-4 w-4" />
                    {uploading ? "Caricamento..." : "Scegli file immagine (JPG, PNG)"}
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handlePhotoUpload}
                      className="sr-only"
                      disabled={uploading}
                    />
                  </label>
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center gap-3 rounded-xl border border-input bg-muted/30 p-4">
                  <input
                    id="featured"
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="h-5 w-5 rounded border-input text-primary focus:ring-ring"
                  />
                  <div>
                    <label htmlFor="featured" className="text-sm font-medium text-foreground">
                      Prodotto in evidenza
                    </label>
                    <p className="text-xs text-muted-foreground">
                      I prodotti in evidenza vengono mostrati con un badge speciale
                    </p>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50"
                >
                  <Save className="h-5 w-5" />
                  {saving ? "Salvataggio..." : "Salva Modifiche"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                Prodotti Correlati
              </h2>
              {product.Categoria_Nome && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                  <Tag className="h-3.5 w-3.5" />
                  {product.Categoria_Nome}
                </span>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((related) => (
                <div
                  key={related.ID}
                  className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-muted">
                    {related.hasFoto ? (
                      <img
                        src={`/api/prodotti/${related.ID}/foto`}
                        alt={related.Nome}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                    {related.Featured === 1 && (
                      <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
                        <Star className="h-3 w-3 fill-current" />
                      </div>
                    )}
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 opacity-0 transition-all duration-300 group-hover:bg-foreground/60 group-hover:opacity-100">
                      <Link
                        href={`/privata/prodotti/${related.ID}`}
                        className="rounded-lg bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-lg transition-transform hover:scale-105"
                      >
                        Dettagli
                      </Link>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <Link href={`/privata/prodotti/${related.ID}`}>
                      <h3 className="font-semibold text-card-foreground transition-colors hover:text-primary line-clamp-1">
                        {related.Nome}
                      </h3>
                    </Link>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-lg font-bold text-primary">
                        {related.Prezzo.toLocaleString("it-IT", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </p>
                      <Link
                        href={`/privata/prodotti/${related.ID}`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105"
                      >
                        <ArrowLeft className="h-4 w-4 rotate-180" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/50 backdrop-blur-sm"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="relative mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-destructive/10 p-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/20">
                <Trash2 className="h-7 w-7 text-destructive" />
              </div>
            </div>
            <div className="p-6 text-center">
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                Conferma eliminazione
              </h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Sei sicuro di voler eliminare{" "}
                <span className="font-semibold text-foreground">{product.Nome}</span>?
                <br />
                Questa azione non può essere annullata.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-xl border border-border bg-background py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  Annulla
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 rounded-xl bg-destructive py-3 text-sm font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50"
                >
                  {deleting ? "Eliminazione..." : "Elimina Prodotto"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
