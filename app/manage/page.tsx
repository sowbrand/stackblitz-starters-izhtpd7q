'use client';

import React, { useState } from 'react';
import { Mesh, Supplier } from '@/types';
import { INITIAL_MESHES, INITIAL_SUPPLIERS, MESH_TYPES } from '@/lib/constants';
import { FabricCard } from '@/components/FabricCard';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [meshes] = useState<Mesh[]>(INITIAL_MESHES);

  const filteredMeshes = meshes.filter(mesh => {
    const matchesSearch = mesh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          mesh.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType ? mesh.name.toLowerCase().includes(selectedType.toLowerCase()) : true;
    
    return matchesSearch && matchesType;
  });

  const getSupplierName = (id: string) => {
    return INITIAL_SUPPLIERS.find(s => String(s.id) === String(id))?.name || 'Fornecedor Desconhecido';
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Catálogo de Malhas</h1>
            
            <div className="flex gap-2 w-full md:w-auto">
              <Link href="/compare" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Comparador
              </Link>
              <Link href="/manage" className="px-4 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors">
                Gerenciar
              </Link>
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Buscar por nome, código..." 
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative min-w-[200px]">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select 
                className="w-full pl-10 pr-8 py-2 border rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">Todos os Tipos</option>
                {MESH_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <SlidersHorizontal className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4 text-sm text-gray-500">
          Mostrando {filteredMeshes.length} resultados
        </div>

        {filteredMeshes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMeshes.map((mesh) => (
              <div key={mesh.id} className="group relative">
                <Link href={`/suppliers/${mesh.supplierId}`} className="block h-full">
                  <FabricCard fabric={mesh} />
                </Link>
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-gray-600 shadow-sm">
                  {getSupplierName(mesh.supplierId)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600 font-medium">Nenhuma malha encontrada</p>
            <p className="text-gray-400 mt-2">Tente ajustar os filtros ou buscar por outro termo.</p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedType(''); }}
              className="mt-4 text-blue-600 hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>
    </main>
  );
}