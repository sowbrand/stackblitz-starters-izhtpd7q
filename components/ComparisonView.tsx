'use client';

import React from 'react';
import { Mesh } from '@/types';
import { PackageOpen, Trophy } from 'lucide-react';
import { useSupplierContext } from '@/app/context/SupplierContext';
import { SupplierBadge } from '@/components/ui/SupplierBadge';

interface ComparisonViewProps {
  meshes: Mesh[];
  criteria?: 'costBenefit' | 'pricePerKg' | 'yield' | 'width';
}

export function ComparisonView({ meshes, criteria = 'costBenefit' }: ComparisonViewProps) {
  const { suppliers } = useSupplierContext();

  if (meshes.length === 0) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center">
        <PackageOpen size={48} className="text-gray-300 mb-2" />
        <p className="text-[#545454] font-medium text-sm">Selecione produtos para comparar</p>
      </div>
    );
  }

  // --- CÁLCULOS ---
  const calculatedMeshes = meshes.map(mesh => {
     const supplier = suppliers.find(s => s.id === mesh.supplierId);
     const basePrice = Math.min(...mesh.variations.map(v => v.priceCash).filter(p => p > 0));
     const pricePerMeter = mesh.yield > 0 ? basePrice / mesh.yield : 999999;
     return { ...mesh, basePrice, pricePerMeter, supplier };
  });

  // Determina vencedor
  let bestValue: number;
  let isBest = (mesh: any) => false;
  let label = "";

  switch (criteria) {
    case 'pricePerKg':
        bestValue = Math.min(...calculatedMeshes.map(m => m.basePrice).filter(p => p > 0));
        isBest = (m) => m.basePrice === bestValue;
        label = "Menor Kg";
        break;
    case 'yield':
        bestValue = Math.max(...calculatedMeshes.map(m => m.yield));
        isBest = (m) => m.yield === bestValue;
        label = "Maior Rend";
        break;
    case 'width':
        bestValue = Math.max(...calculatedMeshes.map(m => m.width));
        isBest = (m) => m.width === bestValue;
        label = "+ Larga";
        break;
    case 'costBenefit':
    default:
        bestValue = Math.min(...calculatedMeshes.map(m => m.pricePerMeter).filter(p => p > 0));
        isBest = (m) => m.pricePerMeter === bestValue;
        label = "Melhor Opção";
        break;
  }

  return (
    <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
      <table className="w-full text-xs text-left border-collapse">
        <thead className="text-[10px] text-[#545454] uppercase bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-3 py-3 font-bold tracking-wider w-32 min-w-[120px] bg-gray-50 sticky left-0 z-20 border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                Característica
            </th>
            {calculatedMeshes.map(mesh => {
               const winner = isBest(mesh);
               return (
                // COLUNA COMPACTA: min-w-[140px] permite ver mais itens
                <th key={mesh.id} className={`px-3 py-3 min-w-[140px] max-w-[160px] align-top relative border-r border-gray-100 ${winner ? 'bg-[#72BF03]/10' : ''}`}>
                    {winner && (
                        <div className="absolute top-0 left-0 right-0 bg-[#72BF03] text-white text-[9px] font-bold text-center py-0.5 uppercase flex items-center justify-center gap-1">
                            <Trophy size={8} /> {label}
                        </div>
                    )}
                    <div className={`flex flex-col gap-1.5 ${winner ? 'mt-4' : ''}`}>
                        <SupplierBadge supplier={mesh.supplier} />
                        <div className="flex flex-col">
                            <span className="font-bold text-black text-xs leading-tight line-clamp-2" title={mesh.name}>
                                {mesh.name}
                            </span>
                            <span className="text-[9px] text-gray-400 font-mono mt-0.5">{mesh.code}</span>
                        </div>
                    </div>
                </th>
               );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          
          {/* Métrica Principal (Destacada) */}
          <tr className="bg-gray-50/50">
            <td className="px-3 py-3 font-bold text-black bg-gray-100/80 sticky left-0 z-10 border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                ANÁLISE
            </td>
            {calculatedMeshes.map(mesh => (
              <td key={mesh.id} className={`px-3 py-3 border-r border-gray-100 ${isBest(mesh) ? 'bg-[#72BF03]/5' : ''}`}>
                 <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] text-gray-500">
                        <span>Kg:</span> <strong>R$ {mesh.basePrice.toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500">
                        <span>Rend:</span> <strong>{mesh.yield}</strong>
                    </div>
                    <div className="border-t border-gray-200 mt-1 pt-1 flex justify-between items-center">
                        <span className="font-bold text-[#545454] text-[9px]">METRO:</span>
                        <span className={`font-bold text-sm ${criteria === 'costBenefit' && isBest(mesh) ? 'text-[#72BF03]' : 'text-gray-700'}`}>
                            R$ {mesh.pricePerMeter < 9999 ? mesh.pricePerMeter.toFixed(2) : '-'}
                        </span>
                    </div>
                 </div>
              </td>
            ))}
          </tr>

          {/* Dados Físicos */}
          {[
            { label: 'Largura', val: (m:any) => `${m.width} m` },
            { label: 'Gramatura', val: (m:any) => `${m.grammage} g` },
            { label: 'Composição', val: (m:any) => m.composition }
          ].map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="px-3 py-2 font-medium text-[10px] text-[#545454] uppercase bg-white sticky left-0 z-10 border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    {row.label}
                </td>
                {calculatedMeshes.map(mesh => (
                    <td key={mesh.id} className="px-3 py-2 text-[10px] text-[#545454] border-r border-gray-100 truncate">
                        {row.val(mesh)}
                    </td>
                ))}
            </tr>
          ))}

          {/* Preços Detalhados */}
          <tr>
            <td className="px-3 py-3 font-bold text-[#72BF03] bg-white sticky left-0 z-10 border-r border-gray-200 align-top pt-4 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                VARIAÇÕES
            </td>
            {calculatedMeshes.map(mesh => (
              <td key={mesh.id} className="px-3 py-3 align-top border-r border-gray-100">
                <div className="space-y-1">
                  {mesh.variations.map((v, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-gray-100 border-dashed last:border-0 pb-1 mb-1">
                      <span className="text-[9px] font-bold text-gray-400 uppercase truncate max-w-[60px]">{v.name}</span>
                      <span className="text-black font-bold text-[10px]">R$ {Number(v.priceCash).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </td>
            ))}
          </tr>

        </tbody>
      </table>
    </div>
  );
}