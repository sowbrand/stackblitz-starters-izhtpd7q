'use client';

import React, { useState } from 'react';
import { Plus, Search, ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';
import { MeshForm } from '@/components/MeshForm';
import { FabricCard } from '@/components/FabricCard';
import { useSupplierContext } from '@/app/context/SupplierContext'; // Usando o contexto global

export default function SupplierDetailsPage({ params }: { params: { id: string } }) {
  // Agora pegamos os dados e funções do Contexto Global
  const { suppliers, meshes, addMesh, updateMesh, deleteMesh } = useSupplierContext();
  
  const [isAddingMesh, setIsAddingMesh] = useState(false);
  const [editingMesh, setEditingMesh] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const supplier = suppliers.find(s => s.id === params.id);

  if (!supplier) return <div className="p-20 text-center text-sow-dark">Fornecedor não encontrado</div>;

  // Filtra as malhas usando o estado global
  const supplierMeshes = meshes.filter(m => 
    m.supplierId === supplier.id && 
    (m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.code.includes(searchTerm))
  );

  const handleSaveMesh = (meshData: any) => {
    if (editingMesh) {
      updateMesh(meshData);
    } else {
      addMesh(meshData);
    }
    setIsAddingMesh(false);
    setEditingMesh(null);
  };

  const handleDeleteMesh = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      deleteMesh(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* CABEÇALHO */}
        <div className="flex items-center gap-6 mb-10">
          <Link href="/" className="p-3 bg-white rounded-full shadow-sm border border-gray-100 hover:border-sow-green transition-all group">
            <ArrowLeft size={20} className="text-sow-dark group-hover:text-sow-green" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-sow-black font-heading tracking-tight">{supplier.name}</h1>
            <p className="text-sow-dark opacity-60 font-medium">Gestão de Produtos e Preços</p>
          </div>
        </div>

        {/* BARRA DE FERRAMENTAS */}
        {!isAddingMesh && !editingMesh && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8 flex justify-between items-center flex-wrap gap-4">
            <div className="relative w-full md:w-[400px]">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Buscar por nome ou código..." 
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sow-green focus:border-transparent outline-none text-sm transition-all placeholder-gray-300 text-sow-dark"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button 
              onClick={() => setIsAddingMesh(true)}
              className="px-6 py-3 bg-sow-green text-white rounded-xl hover:bg-sow-green-hover flex items-center gap-2 font-bold shadow-lg shadow-green-100 transition-all transform hover:-translate-y-0.5"
            >
              <Plus size={20} /> Novo Produto
            </button>
          </div>
        )}

        {/* FORMULÁRIO */}
        {(isAddingMesh || editingMesh) && (
          <div className="mb-10">
            <MeshForm 
              onSubmit={handleSaveMesh}
              onCancel={() => { setIsAddingMesh(false); setEditingMesh(null); }}
              initialData={editingMesh}
              preselectedSupplierId={supplier.id}
              suppliers={[supplier]}
            />
          </div>
        )}

        {/* LISTA DE PRODUTOS */}
        {!isAddingMesh && !editingMesh && (
          <div className="grid grid-cols-1 gap-6">
            {supplierMeshes.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="bg-gray-50 p-4 rounded-full inline-block mb-4">
                    <Package className="h-10 w-10 text-gray-300" />
                </div>
                <p className="text-sow-dark font-semibold text-lg">Nenhum produto cadastrado</p>
                <p className="text-gray-400 mt-1">Utilize o botão acima para adicionar.</p>
              </div>
            ) : (
              supplierMeshes.map(mesh => (
                <FabricCard 
                  key={mesh.id}
                  mesh={mesh}
                  onEdit={setEditingMesh}
                  onDelete={handleDeleteMesh}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}