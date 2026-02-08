"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useTheme } from "next-themes";
import { AuthModal } from "./auth-modal";
import {
  LogOut,
  Menu,
  X,
  User,
  ShieldCheck,
  Users,
  Package,
  Home,
  Sun,
  Moon,
  UserCircle,
} from "lucide-react";

export function Navbar() {
  const { user, mutate } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    mutate();
  }

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold text-foreground"
          >
            <Package className="h-6 w-6 text-primary" />
            <span>NextApp</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link
              href="/pubblica"
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Users className="h-4 w-4" />
              Utenti
            </Link>
            {user && (
              <>
                <Link
                  href="/privata"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Area Privata
                </Link>
                <Link
                  href="/privata/prodotti"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Package className="h-4 w-4" />
                  Prodotti
                </Link>
              </>
            )}
          </div>

          {/* Auth + theme buttons */}
          <div className="hidden items-center gap-3 md:flex">
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-transparent text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Cambia tema"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
            </button>
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/privata/profilo"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <UserCircle className="h-4 w-4" />
                  {user.username}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-sm text-secondary-foreground transition-colors hover:bg-secondary/80"
                >
                  <LogOut className="h-4 w-4" />
                  Esci
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowLogin(true)}
                  className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Accedi
                </button>
                <button
                  onClick={() => setShowRegister(true)}
                  className="rounded-md border border-border bg-transparent px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  Registrati
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-transparent text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Cambia tema"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-foreground"
            >
              {mobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-border bg-background px-4 pb-4 pt-2 md:hidden">
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-sm text-foreground"
              >
                <Home className="h-4 w-4" /> Home
              </Link>
              <Link
                href="/pubblica"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-sm text-foreground"
              >
                <Users className="h-4 w-4" /> Utenti
              </Link>
              {user && (
                <>
                  <Link
                    href="/privata"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 text-sm text-foreground"
                  >
                    <ShieldCheck className="h-4 w-4" /> Area Privata
                  </Link>
                  <Link
                    href="/privata/prodotti"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 text-sm text-foreground"
                  >
                    <Package className="h-4 w-4" /> Prodotti
                  </Link>
                  <Link
                    href="/privata/profilo"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 text-sm text-foreground"
                  >
                    <UserCircle className="h-4 w-4" /> Profilo
                  </Link>
                </>
              )}
              <hr className="border-border" />
              {user ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {user.username}
                  </span>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                    className="text-sm text-destructive"
                  >
                    Esci
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowLogin(true);
                      setMobileOpen(false);
                    }}
                    className="flex-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
                  >
                    Accedi
                  </button>
                  <button
                    onClick={() => {
                      setShowRegister(true);
                      setMobileOpen(false);
                    }}
                    className="flex-1 rounded-md border border-border bg-transparent px-3 py-1.5 text-sm font-medium text-foreground"
                  >
                    Registrati
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {showLogin && (
        <AuthModal
          mode="login"
          onClose={() => setShowLogin(false)}
          onSuccess={() => {
            setShowLogin(false);
            mutate();
          }}
        />
      )}
      {showRegister && (
        <AuthModal
          mode="register"
          onClose={() => setShowRegister(false)}
          onSuccess={() => {
            setShowRegister(false);
            mutate();
          }}
        />
      )}
    </>
  );
}
