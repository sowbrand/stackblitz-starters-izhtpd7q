
import React from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/ui/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sowbrand - Gestão Têxtil Inteligente",
  description: "Um aplicativo inteligente para gestão, leitura, comparação e análise de malhas têxteis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white min-h-screen text-[#545454]">
        <Navbar />
        <main className="p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
