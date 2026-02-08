"use client";

import React from "react"

import { useState } from "react";
import { X } from "lucide-react";

interface AuthModalProps {
  mode: "login" | "register";
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ mode, onClose, onSuccess }: AuthModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Errore sconosciuto.");
      } else {
        onSuccess();
      }
    } catch {
      setError("Errore di rete.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/50 backdrop-blur-sm" onClick={onClose}>
      <div className="relative mx-4 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-6 text-xl font-semibold text-card-foreground">
          {mode === "login" ? "Accedi" : "Registrati"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium text-card-foreground">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Il tuo username"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-card-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="La tua password"
              required
            />
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Caricamento..." : mode === "login" ? "Accedi" : "Registrati"}
          </button>
        </form>
      </div>
    </div>
  );
}
