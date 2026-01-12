'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Tag, Package } from 'lucide-react';
import { useSupplierContext } from '@/app/context/SupplierContext';
import { FabricCard } from '@/components/FabricCard';
import { Modal } from '@/components/ui/Modal'; // Importando o novo modal

export default function AllProductsPage() {
  const { meshes, suppliers } = useSupplierContext();
  
  // Estado para controlar o modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');

  const getCategory = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('suedine')) return 'Suedine';
    if (n.includes('cotton')) return 'Cotton';
    if (n.includes('moletom') || n.includes('mole')) return 'Moletom';
    if (n.includes('ribana') || n.includes('gola') || n.includes('punho') || n.includes('kit')) return 'Ribanas e Complementos';
    if (n.includes('meia malha') || n.includes('30.1') || n.includes('24.1')) return 'Meia Malha';
    if (n.includes('piquet') || n.includes('piquê')) return 'Piquet';
    return 'Outros';
  };

  const groupedMeshes = meshes.reduce((acc, mesh) => {
    const category = getCategory(mesh.name);
    if (!acc[category]) acc[category] = [];
    acc[category].push(mesh);
    return acc;
  }, {} as Record<string, typeof meshes>);

  const categoryOrder = ['Suedine', 'Cotton', 'Meia Malha', 'Moletom', 'Ribanas e Complementos', 'Piquet', 'Outros'];
  const activeCategories = categoryOrder.filter(cat => groupedMeshes[cat] && groupedMeshes[cat].length > 0);

  // Função para abrir o modal com a mensagem correta
  const handleEditAttempt = (mesh: any) => {
    const supplierName = suppliers.find(s => s.id === mesh.supplierId)?.name || 'Fornecedor desconhecido';
    setModalContent(`Para editar o produto <strong>${mesh.name}</strong>, você deve acessar a área de gestão do fornecedor:<br/><br/><span class="text-black font-bold">Fornecedores > ${supplierName}</span>`);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex items-center gap-6 mb-10">
          <Link href="/" className="p-3 bg-white rounded-full shadow-sm border border-gray-100 hover:border-[#72BF03] transition-all group">
            <ArrowLeft size={20} className="text-[#545454] group-hover:text-[#72BF03]" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-black font-heading tracking-tight">Catálogo de Produtos</h1>
            <p className="text-[#545454] opacity-60 font-medium text-sm">Organizado por categorias</p>
          </div>
        </div>

        <div className="space-y-12">
          {activeCategories.map(category => (
            <div key={category} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-2">
                <Tag size={18} className="text-[#72BF03]" />
                <h2 className="text-xl font-bold text-black uppercase tracking-wider">{category}</h2>
                <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-1 rounded-full font-bold">
                    {groupedMeshes[category].length}
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {groupedMeshes[category].map(mesh => (
                  <FabricCard 
                    key={mesh.id} 
                    mesh={mesh}
                    onEdit={() => handleEditAttempt(mesh)} 
                    onDelete={() => {}}
                  />
                ))}
              </div>
            </div>
          ))}

          {activeCategories.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="bg-gray-50 p-4 rounded-full inline-block mb-4">
                    <Package className="h-10 w-10 text-gray-300" />
                </div>
                <p className="text-[#545454] font-semibold text-lg">Nenhum produto cadastrado</p>
                <p className="text-gray-400 mt-1">Cadastre produtos dentro de cada Fornecedor.</p>
              </div>
          )}
        </div>
      </div>

      {/* Modal de Alerta */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title="Modo de Visualização"
      >
        <p dangerouslySetInnerHTML={{ __html: modalContent }} className="text-sm leading-relaxed" />
      </Modal>

    </div>
  );
}