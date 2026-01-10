'use client';

import React from 'react';
import Link from 'next/link';
// Caminho relativo para garantir que funcione
import { useSupplierContext } from './context/SupplierContext';
import { Building2, ChevronRight, Package, Settings, Users } from 'lucide-react';

export default function Home() {
  const { suppliers, meshes } = useSupplierContext();

  // Função auxiliar para mostrar quantos produtos cada fornecedor tem
  const getMeshCount = (supplierId: string) => {
    return meshes.filter(m => String(m.supplierId) === String(supplierId)).length;
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho da Aba 1 */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="text-blue-600" />
              Fornecedores
            </h1>
            <p className="text-gray-500 mt-2">Selecione um fornecedor para ver produtos e importar tabelas.</p>
          </div>
          
          {/* Botão de Atalho para a Aba 3 (Gerenciar) */}
          <Link 
            href="/manage" 
            className="flex items-center gap-2 text-gray-700 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 hover:text-blue-600 font-medium transition-colors shadow-sm"
          >
            <Settings size={18} />
            Gerenciar Lista
          </Link>
        </div>

        {/* Grid de Fornecedores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplier) => (
            <Link 
              key={supplier.id} 
              href={`/suppliers/${supplier.id}`}
              className="group block h-full"
            >
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all h-full flex flex-col justify-between cursor-pointer relative overflow-hidden">
                {/* Detalhe visual de hover */}
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 transform -translate-x-1 transition-transform group-hover:translate-x-0"></div>

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {supplier.name.substring(0, 2).toUpperCase()}
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
                    {supplier.name}
                  </h3>
                  <div className="text-sm text-gray-500 mb-4">
                    {supplier.email || '• Clique para acessar a área de uploads'}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center gap-2 text-sm text-gray-600">
                  <Package size={16} className="text-gray-400" />
                  <span className="font-bold text-gray-900">{getMeshCount(supplier.id)}</span> 
                  <span className="text-gray-500">produtos cadastrados</span>
                </div>
              </div>
            </Link>
          ))}

          {/* Card Atalho para Adicionar Novo */}
          <Link 
            href="/manage"
            className="group block border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-blue-400 hover:bg-blue-50 transition-all min-h-[200px]"
          >
            <div className="h-12 w-12 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
              <Settings size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Novo Fornecedor</h3>
            <p className="text-sm text-gray-500 mt-1">Cadastrar parceiro manual</p>
          </Link>
        </div>
      </div>
    </main>
  );
}