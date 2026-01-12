import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { SupplierProvider } from "@/app/context/SupplierContext"; // <--- IMPORTANTE

// Configurando a fonte do manual da marca
const montserrat = Montserrat({ 
  subsets: ["latin"],
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: "Sowbrand System",
  description: "Gestão de Malhas e Preços",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${montserrat.variable} font-sans bg-[#FDFDFD] text-[#545454] antialiased`}>
        {/* O erro acontecia porque este Provider estava faltando ou mal configurado */}
        <SupplierProvider>
          {children}
        </SupplierProvider>
      </body>
    </html>
  );
}