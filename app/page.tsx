'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Package, ChevronRight, BarChart3, Layers, Scale } from 'lucide-react';
import { useSupplierContext } from '@/app/context/SupplierContext';
import { FabricCard } from '@/components/FabricCard'; // Reutilizando o card para mostrar resultados da busca

export default function Home() {
  const { suppliers, meshes } = useSupplierContext();
  const [searchTerm, setSearchTerm] = useState('');

  // Mudança 3: A busca agora filtra MALHAS (Produtos), não fornecedores
  const filteredMeshes = meshes.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* LOGO E CABEÇALHO */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl tracking-tighter text-black">
              <span className="font-light">sow</span><span className="font-bold">brand</span>
            </h1>
            <p className="text-[10px] text-[#545454] uppercase tracking-[0.2em] mt-1 font-medium">
              Intelligence System
            </p>
          </div>
          
          {/* Mudança 3: Busca de Malha */}
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 group-focus-within:text-[#72BF03] transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Buscar malha, código ou tecido..." 
              className="w-full pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-full shadow-sm focus:ring-1 focus:ring-[#72BF03] focus:border-[#72BF03] outline-none transition-all placeholder-gray-300 text-[#545454]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* DASHBOARD CARDS (MENU) */}
        {!searchTerm && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              
              {/* Mudança 2: Botão para Todos os Produtos */}
              <Link href="/products" className="block group">
                <div className="bg-black text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between h-44 relative overflow-hidden transition-transform transform group-hover:scale-[1.02]">
                    <div className="z-10">
                        <h2 className="text-5xl font-bold mb-1">{meshes.length}</h2>
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Catálogo de Produtos</p>
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#72BF03]">
                        Ver Categorias <ChevronRight size={14} />
                    </div>
                    <Layers className="absolute right-[-20px] bottom-[-20px] text-gray-800 w-32 h-32 opacity-20 group-hover:opacity-30 transition-opacity" />
                </div>
              </Link>
              
              {/* Card Fornecedores */}
              <Link href="/manage" className="block group">
                <div className="bg-[#545454] text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between h-44 relative overflow-hidden transition-transform transform group-hover:scale-[1.02]">
                    <div className="z-10">
                        <h2 className="text-5xl font-bold mb-1">{suppliers.length}</h2>
                        <p className="text-xs text-gray-300 uppercase tracking-widest font-semibold">Fornecedores</p>
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                        Gerenciar <ChevronRight size={14} />
                    </div>
                    <BarChart3 className="absolute right-[-20px] bottom-[-20px] text-black w-32 h-32 opacity-20 group-hover:opacity-30 transition-opacity" />
                </div>
              </Link>

              {/* Mudança 4: Atalho para o Comparador */}
              <Link href="/compare" className="block group">
                <div className="bg-[#72BF03] text-white p-8 rounded-3xl shadow-xl shadow-green-100 flex flex-col justify-between h-44 relative overflow-hidden transition-transform transform group-hover:scale-[1.02]">
                    <div className="z-10">
                        <h2 className="text-3xl font-bold mb-1 mt-2">Comparador</h2>
                        <p className="text-xs text-green-100 uppercase tracking-widest font-semibold">Análise de Custo</p>
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                        Iniciar Comparação <ChevronRight size={14} />
                    </div>
                    <Scale className="absolute right-[-20px] bottom-[-20px] text-white w-32 h-32 opacity-20 group-hover:opacity-30 transition-opacity" />
                </div>
              </Link>
          </div>
        )}

        {/* ÁREA DE RESULTADOS DA BUSCA OU LISTA DE FORNECEDORES */}
        {searchTerm ? (
           <div className="space-y-6">
              <h3 className="text-lg font-bold text-black font-heading">
                 Resultados para "{searchTerm}"
              </h3>
              <div className="grid grid-cols-1 gap-4">
                 {filteredMeshes.length > 0 ? (
                    filteredMeshes.map(mesh => (
                       <FabricCard 
                          key={mesh.id} 
                          mesh={mesh} 
                          onEdit={() => {}} 
                          onDelete={() => {}} 
                       />
                    ))
                 ) : (
                    <p className="text-gray-400">Nenhuma malha encontrada.</p>
                 )}
              </div>
           </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-gray-100 pb-2 mb-6">
                <h3 className="text-sm font-bold text-black uppercase tracking-widest">
                  Acesso Rápido - Fornecedores
                </h3>
                <Link href="/manage" className="text-xs text-[#72BF03] font-bold hover:underline">
                    Ver Todos
                </Link>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {suppliers.slice(0, 5).map((supplier) => {
                const count = meshes.filter(m => m.supplierId === supplier.id).length;
                return (
                  <Link key={supplier.id} href={`/suppliers/${supplier.id}`} className="block group">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#72BF03] transition-all duration-300 flex justify-between items-center">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-[#F5F5F5] rounded-full flex items-center justify-center text-black font-bold text-lg group-hover:bg-[#72BF03] group-hover:text-white transition-colors duration-300">
                          {supplier.name.charAt(0)}
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-[#545454] group-hover:text-black transition-colors">
                              {supplier.name}
                          </h2>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {count} produtos cadastrados
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-gray-300 group-hover:text-[#72BF03]" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}