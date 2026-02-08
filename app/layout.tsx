import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/navbar";
import "./globals.css";

const _inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NextApp - Web App con Next.js",
  description:
    "Applicazione web full-stack costruita con Next.js, SQLite e autenticazione personalizzata.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main>{children}</main>
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}

