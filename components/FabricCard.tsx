'use client';

import React from 'react';
// CORREÇÃO: Importamos 'Mesh' em vez de 'Fabric'
import { Mesh, ColorCategory } from '@/types/index';
// Mantive os imports utilitários caso você os tenha, se der erro neles, remova.
import { Star, Edit, BarChart2 } from 'lucide-react';

interface FabricCardProps {
  // CORREÇÃO: Tipo atualizado para Mesh
  fabric: Mesh;
  onEdit?: (fabric: Mesh) => void;
  onCompare?: (fabric: Mesh) => void;
}

export const FabricCard: React.FC<FabricCardProps> = ({ fabric, onEdit, onCompare }) => {
  
  // CORREÇÃO: Acesso ao preço adaptado para o novo formato Record<string, number>
  // Tenta pegar 'Claras', se não existir pega 'Branco', se não pega o primeiro valor, ou 0.
  const price = fabric.prices['Claras'] || 
                fabric.prices['Branco'] || 
                (Object.values(fabric.prices).length > 0 ? Object.values(fabric.prices)[0] : 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col h-full">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900 line-clamp-1" title={fabric.name}>
            {fabric.name}
          </h3>
          <p className="text-sm text-gray-500 font-mono">{fabric.code}</p>
        </div>
        {/* Exibição do Preço */}
        <div className="bg-green-50 text-green-700 px-2.5 py-1 rounded-md font-bold text-sm border border-green-100">
          R$ {price.toFixed(2)}
        </div>
      </div>

      {/* Detalhes Técnicos */}
      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600 mb-4 flex-grow">
        <div className="flex flex-col">
          <span className="text-xs text-gray-400 uppercase font-semibold">Largura</span>
          <span>{fabric.width} cm</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-400 uppercase font-semibold">Gramatura</span>
          <span>{fabric.grammage} g/m²</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-400 uppercase font-semibold">Rendimento</span>
          <span>{fabric.yield} m/kg</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-400 uppercase font-semibold">Composição</span>
          <span className="truncate" title={fabric.composition}>{fabric.composition}</span>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-gray-100">
        {onEdit && (
          <button 
            onClick={() => onEdit(fabric)}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit size={16} />
            Editar
          </button>
        )}
        {onCompare && (
          <button 
            onClick={() => onCompare(fabric)}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-[#72bf03] hover:bg-lime-600 rounded-lg transition-colors shadow-sm"
          >
            <BarChart2 size={16} />
            Comparar
          </button>
        )}
      </div>
    </div>
  );
};