'use client';

import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Mesh } from '@/types';

// Componente simples para exibir os detalhes (Versão corrigida para o novo Banco de Dados)
const MeshCard: React.FC<{ mesh: Mesh; onEdit: () => void; onDelete: () => void }> = ({ mesh, onEdit, onDelete }) => {
  
  // Lógica corrigida: Busca o preço na lista de variações
  const priceBranco = mesh.variations?.find(v => v.name.includes('BRANCO'))?.priceCash || 0;
  const priceBase = priceBranco > 0 ? priceBranco : (mesh.price || 0);

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200 flex justify-between items-center">
      <div>
        <h4 className="font-bold text-lg">{mesh.name}</h4>
        <p className="text-sm text-gray-500">{mesh.code} - {mesh.composition}</p>
        
        {/* Exibe o preço base encontrado */}
        <div className="mt-2 text-sow-green font-bold">
            A partir de: R$ {priceBase.toFixed(2)}
        </div>

        {/* Lista compacta de variações */}
        <div className="flex flex-wrap gap-2 mt-2">
            {mesh.variations?.map((v, i) => (
                <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                    {v.name}: {v.priceCash.toFixed(2)}
                </span>
            ))}
        </div>
      </div>
      
      <div className="flex gap-2">
        <button onClick={onEdit} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
            <Edit2 size={18} />
        </button>
        <button onClick={onDelete} className="p-2 text-red-600 hover:bg-red-50 rounded">
            <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

interface SupplierDetailProps {
  supplier: any;
  meshes: Mesh[];
  onEditMesh: (mesh: Mesh) => void;
  onDeleteMesh: (id: string) => void;
}

export function SupplierDetail({ supplier, meshes, onEditMesh, onDeleteMesh }: SupplierDetailProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold mb-2">{supplier.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <p>Contato: {supplier.contact}</p>
            <p>Tel: {supplier.phone}</p>
            <p>Email: {supplier.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {meshes.map(mesh => (
          <MeshCard 
            key={mesh.id} 
            mesh={mesh} 
            onEdit={() => onEditMesh(mesh)}
            onDelete={() => onDeleteMesh(mesh.id)}
          />
        ))}
        {meshes.length === 0 && (
            <p className="text-center text-gray-400 py-8">Nenhum produto cadastrado.</p>
        )}
      </div>
    </div>
  );
}