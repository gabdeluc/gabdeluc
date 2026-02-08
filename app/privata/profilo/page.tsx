"use client";

import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import Link from "next/link";
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    MapPin,
    Save,
    Calendar,
    Shield,
} from "lucide-react";

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
};

interface UserProfile {
    id: number;
    username: string;
    email: string | null;
    nome: string | null;
    cognome: string | null;
    telefono: string | null;
    indirizzo: string | null;
    created_at: string;
}

export default function ProfilePage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const {
        data: profile,
        isLoading,
        mutate,
    } = useSWR<UserProfile>(user ? "/api/profile" : null, fetcher);

    const [nome, setNome] = useState("");
    const [cognome, setCognome] = useState("");
    const [email, setEmail] = useState("");
    const [telefono, setTelefono] = useState("");
    const [indirizzo, setIndirizzo] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (profile) {
            setNome(profile.nome || "");
            setCognome(profile.cognome || "");
            setEmail(profile.email || "");
            setTelefono(profile.telefono || "");
            setIndirizzo(profile.indirizzo || "");
        }
    }, [profile]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/");
        }
    }, [user, authLoading, router]);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome,
                    cognome,
                    email,
                    telefono,
                    indirizzo,
                }),
            });

            if (res.ok) {
                toast.success("Profilo aggiornato con successo!");
                mutate();
            } else {
                const data = await res.json();
                toast.error(data.error || "Errore nel salvataggio");
            }
        } catch {
            toast.error("Errore di rete");
        } finally {
            setSaving(false);
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

    if (!user || !profile) return null;

    const memberSince = new Date(profile.created_at).toLocaleDateString("it-IT", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Link
                    href="/privata"
                    className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Torna alla Dashboard
                </Link>

                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <User className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">
                                Il Mio Profilo
                            </h1>
                            <p className="text-muted-foreground">
                                Gestisci le tue informazioni personali
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Left Column - User Info Card */}
                    <div className="lg:col-span-1">
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            {/* Avatar */}
                            <div className="mb-6 flex flex-col items-center">
                                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
                                    {profile.username.charAt(0).toUpperCase()}
                                </div>
                                <h2 className="mt-4 text-xl font-bold text-card-foreground">
                                    {profile.nome && profile.cognome
                                        ? `${profile.nome} ${profile.cognome}`
                                        : profile.username}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    @{profile.username}
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="space-y-3 border-t border-border pt-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">ID Utente:</span>
                                    <span className="ml-auto font-medium text-foreground">
                                        #{profile.id}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Membro dal:</span>
                                    <span className="ml-auto font-medium text-foreground">
                                        {memberSince}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Edit Form */}
                    <div className="lg:col-span-2">
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <h2 className="mb-6 text-xl font-bold text-card-foreground">
                                Informazioni Personali
                            </h2>

                            <form onSubmit={handleSave} className="space-y-5">
                                {/* Nome & Cognome */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            Nome
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={50}
                                            value={nome}
                                            onChange={(e) => setNome(e.target.value)}
                                            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                            placeholder="Il tuo nome"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            Cognome
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={50}
                                            value={cognome}
                                            onChange={(e) => setCognome(e.target.value)}
                                            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                            placeholder="Il tuo cognome"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        maxLength={100}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                        placeholder="email@esempio.com"
                                    />
                                </div>

                                {/* Telefono */}
                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        Telefono
                                    </label>
                                    <input
                                        type="tel"
                                        maxLength={20}
                                        value={telefono}
                                        onChange={(e) => setTelefono(e.target.value)}
                                        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                        placeholder="+39 123 456 7890"
                                    />
                                </div>

                                {/* Indirizzo */}
                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        Indirizzo
                                    </label>
                                    <textarea
                                        maxLength={200}
                                        rows={3}
                                        value={indirizzo}
                                        onChange={(e) => setIndirizzo(e.target.value)}
                                        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                        placeholder="Via Roma 123, 00100 Roma (RM)"
                                    />
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
            </div>
        </div>
    );
}
