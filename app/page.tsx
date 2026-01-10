'use client';

import React, { useState } from 'react';
// Caminhos ajustados para voltar uma pasta (../) até a raiz
import { MESH_TYPES } from '../lib/constants';
import { FabricCard } from '../components/FabricCard';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
// Caminho ajustado para a pasta context que está dentro de app
import { useSupplierContext } from './context/SupplierContext';

export default function Home() {
  const { meshes, suppliers } = useSupplierContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const filteredMeshes = meshes.filter(mesh => {
    const matchesSearch = mesh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          mesh.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType ? mesh.name.toLowerCase().includes(selectedType.toLowerCase()) : true;
    
    return matchesSearch && matchesType;
  });

  const getSupplierName = (id: string) => {
    return suppliers.find(s => String(s.id) === String(id))?.name || 'Fornecedor Desconhecido';
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 flex flex-col">
      <div className="max-w-7xl mx-auto flex-grow w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Catálogo de Malhas</h1>
        
        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Buscar por nome, código..." 
                className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative min-w-[200px]">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select 
                className="w-full pl-10 pr-8 py-2 border rounded-lg appearance-none bg-white outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">Todos os Tipos</option>
                {MESH_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
              <SlidersHorizontal className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
        </div>

        {/* Grid */}
        <div className="mb-4 text-sm text-gray-500">Mostrando {filteredMeshes.length} resultados</div>

        {filteredMeshes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMeshes.map((mesh) => (
              <div key={mesh.id} className="group relative">
                <Link href={`/suppliers/${mesh.supplierId}`} className="block h-full">
                  <FabricCard fabric={mesh} />
                </Link>
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-gray-600 shadow-sm border">
                  {getSupplierName(mesh.supplierId)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">Nenhuma malha encontrada.</div>
        )}
      </div>
      
      {/* Rodapé para forçar atualização */}
      <footer className="mt-12 text-center text-xs text-gray-400 border-t pt-4">
        <p>Sowbrand System © 2026</p>
      </footer>
    </main>
  );
}