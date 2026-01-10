import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
// Importação segura assumindo app/context
import { SupplierProvider } from './context/SupplierContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sowbrand',
  description: 'Gestão de Malhas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <SupplierProvider>
            {/* Header Fixo */}
            <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
                  <span className="text-xl font-bold text-gray-900">Sow<span className="text-gray-500">brand</span></span>
                </div>
                <nav className="flex space-x-6">
                  <a href="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Fornecedores</a>
                  <a href="/compare" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Comparador</a>
                  <a href="/manage" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Gerenciar</a>
                </nav>
              </div>
            </header>
            
            {children}
        </SupplierProvider>
      </body>
    </html>
  );
}