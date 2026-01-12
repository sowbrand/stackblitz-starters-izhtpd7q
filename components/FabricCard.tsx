'use client';

import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Mesh } from '@/types';
import { useSupplierContext } from '@/app/context/SupplierContext';
import { SupplierBadge } from '@/components/ui/SupplierBadge';

interface FabricCardProps {
  mesh: Mesh;
  onEdit: (mesh: Mesh) => void;
  onDelete: (id: string) => void;
}

export function FabricCard({ mesh, onEdit, onDelete }: FabricCardProps) {
  // Busca os dados do fornecedor para pegar a cor e nome
  const { suppliers } = useSupplierContext();
  const supplier = suppliers.find(s => s.id === mesh.supplierId);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group">
      
      {/* Cabeçalho do Card */}
      <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-white">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            {/* TAG DO FORNECEDOR (NOVA) */}
            {supplier && <SupplierBadge supplier={supplier} />}
            
            <span className="bg-sow-black text-white px-2 py-0.5 rounded text-[10px] font-bold font-heading tracking-wider">
              {mesh.code}
            </span>
          </div>
          <h3 className="font-bold text-lg text-sow-black font-heading tracking-tight mt-1">{mesh.name}</h3>
          <p className="text-xs text-sow-dark font-medium uppercase tracking-wide mt-1 opacity-80">{mesh.composition}</p>
        </div>
        
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(mesh)} className="p-2 text-sow-dark hover:text-sow-green hover:bg-gray-50 rounded-full">
            <Edit2 size={18} />
          </button>
          <button onClick={() => onDelete(mesh.id)} className="p-2 text-sow-dark hover:text-red-500 hover:bg-red-50 rounded-full">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Detalhes Técnicos */}
      <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50/50">
        <div className="flex flex-col">
            <span className="text-[10px] text-sow-dark uppercase font-bold tracking-wider opacity-60">Largura</span>
            <span className="font-semibold text-sow-black">{mesh.width > 0 ? `${mesh.width} m` : '-'}</span>
        </div>
        <div className="flex flex-col">
            <span className="text-[10px] text-sow-dark uppercase font-bold tracking-wider opacity-60">Gramatura</span>
            <span className="font-semibold text-sow-black">{mesh.grammage > 0 ? `${mesh.grammage} g/m²` : '-'}</span>
        </div>
        <div className="flex flex-col">
            <span className="text-[10px] text-sow-dark uppercase font-bold tracking-wider opacity-60">Rendimento</span>
            <span className="font-semibold text-sow-black">{mesh.yield > 0 ? `${mesh.yield} m/kg` : '-'}</span>
        </div>
        <div className="flex flex-col">
            <span className="text-[10px] text-sow-dark uppercase font-bold tracking-wider opacity-60">NCM</span>
            <span className="font-semibold text-sow-black">{mesh.ncm || '-'}</span>
        </div>
      </div>

      {/* Preços */}
      <div className="p-5 bg-white">
        <span className="block text-[10px] text-sow-dark uppercase font-bold mb-3 tracking-wider opacity-60">
            Tabela de Preços
        </span>
        <div className="flex flex-wrap gap-3">
          {mesh.variations && mesh.variations.length > 0 ? (
            mesh.variations.map((v, idx) => (
              <div key={idx} className="flex flex-col bg-white border border-gray-200 rounded-lg px-3 py-2 min-w-[130px] hover:border-sow-green transition-colors">
                <span className="text-[10px] font-bold text-sow-black uppercase mb-1">{v.name || 'ÚNICA'}</span>
                <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] text-gray-400 mb-0.5">À vista</span>
                        <span className="text-sow-green font-bold text-base">
                            R$ {Number(v.priceCash).toFixed(2)}
                        </span>
                    </div>
                </div>
              </div>
            ))
          ) : (
            <span className="text-sm text-gray-400 italic">Sem preços</span>
          )}
        </div>
      </div>
    </div>
  );
}