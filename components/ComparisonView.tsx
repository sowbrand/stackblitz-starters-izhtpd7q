'use client';

import React from 'react';
import { Mesh } from '@/types';
import { PackageOpen, Trophy, AlertCircle } from 'lucide-react';

interface ComparisonViewProps {
  meshes: Mesh[];
}

export function ComparisonView({ meshes }: ComparisonViewProps) {
  if (meshes.length === 0) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center">
        <div className="bg-gray-50 p-4 rounded-full mb-4">
            <PackageOpen size={48} className="text-gray-300" />
        </div>
        <p className="text-[#545454] font-semibold text-lg">A tabela está vazia</p>
        <p className="text-gray-400 text-sm mt-1">Selecione produtos acima para começar a comparar.</p>
      </div>
    );
  }

  // Lógica para encontrar o melhor custo benefício (Preço Base / Rendimento)
  const calculatedMeshes = meshes.map(mesh => {
     // Pega o menor preço à vista disponível
     const basePrice = Math.min(...mesh.variations.map(v => v.priceCash).filter(p => p > 0));
     // Calcula preço por metro linear: Preço Kg / Rendimento
     const pricePerMeter = mesh.yield > 0 ? basePrice / mesh.yield : 0;
     return { ...mesh, basePrice, pricePerMeter };
  });

  // Encontra o menor preço por metro (vencedor)
  const minPricePerMeter = Math.min(...calculatedMeshes.map(m => m.pricePerMeter).filter(p => p > 0));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-[#545454] uppercase bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 font-bold tracking-wider w-48 bg-gray-50 sticky left-0 z-10 border-r border-gray-100">
                Atributos
            </th>
            {calculatedMeshes.map(mesh => {
               const isBestOption = mesh.pricePerMeter === minPricePerMeter && minPricePerMeter > 0;
               return (
                <th key={mesh.id} className={`px-6 py-4 min-w-[220px] align-top relative ${isBestOption ? 'bg-[#72BF03]/5' : ''}`}>
                    {isBestOption && (
                        <div className="absolute top-0 left-0 right-0 bg-[#72BF03] text-white text-[10px] font-bold text-center py-1 uppercase tracking-widest flex items-center justify-center gap-1">
                            <Trophy size={10} /> Melhor Custo/Benefício
                        </div>
                    )}
                    <div className={`flex flex-col gap-1 ${isBestOption ? 'mt-4' : ''}`}>
                        <span className="bg-black text-white text-[10px] px-2 py-0.5 rounded w-fit font-mono mb-1">
                            {mesh.code}
                        </span>
                        <span className="font-bold text-black text-base leading-tight">
                            {mesh.name}
                        </span>
                        <span className="text-[10px] font-normal text-gray-500 normal-case line-clamp-2">
                            {mesh.composition}
                        </span>
                    </div>
                </th>
               );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          
          {/* Métricas Calculadas */}
          <tr className="bg-gray-50/50">
            <td className="px-6 py-4 font-bold text-black bg-gray-100/50 sticky left-0 border-r border-gray-100 align-middle">
                Eficiência (Custo)
            </td>
            {calculatedMeshes.map(mesh => (
              <td key={mesh.id} className="px-6 py-4">
                 <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Preço Base (Kg):</span>
                        <span className="font-medium">R$ {mesh.basePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Rendimento:</span>
                        <span className="font-medium">{mesh.yield} m/kg</span>
                    </div>
                    <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between items-center">
                        <span className="font-bold text-[#545454] uppercase text-xs">Custo Metro:</span>
                        <span className={`font-bold text-lg ${mesh.pricePerMeter === minPricePerMeter ? 'text-[#72BF03]' : 'text-black'}`}>
                            R$ {mesh.pricePerMeter.toFixed(2)}
                        </span>
                    </div>
                 </div>
              </td>
            ))}
          </tr>

          {/* Dados Físicos */}
          <tr className="hover:bg-gray-50/50 transition-colors">
            <td className="px-6 py-4 font-bold text-[#545454] bg-white sticky left-0 border-r border-gray-100">Largura</td>
            {meshes.map(mesh => <td key={mesh.id} className="px-6 py-4 text-[#545454]">{mesh.width} m</td>)}
          </tr>
          <tr className="hover:bg-gray-50/50 transition-colors">
            <td className="px-6 py-4 font-bold text-[#545454] bg-white sticky left-0 border-r border-gray-100">Gramatura</td>
            {meshes.map(mesh => <td key={mesh.id} className="px-6 py-4 text-[#545454]">{mesh.grammage} g/m²</td>)}
          </tr>

          {/* Tabela de Preços Detalhada */}
          <tr>
            <td className="px-6 py-4 font-bold text-[#72BF03] bg-white sticky left-0 border-r border-gray-100 align-top pt-6">
                Todas as Variações
            </td>
            {meshes.map(mesh => (
              <td key={mesh.id} className="px-6 py-4 align-top">
                <div className="space-y-2">
                  {mesh.variations.map((v, idx) => (
                    <div key={idx} className="flex flex-col border-b border-gray-200 border-dashed last:border-0 pb-2 last:pb-0">
                      <span className="text-[10px] font-bold text-gray-500 uppercase mb-0.5">{v.name}</span>
                      <div className="flex justify-between items-baseline gap-4">
                        <span className="text-black font-bold text-sm">R$ {Number(v.priceCash).toFixed(2)}</span>
                      </div>
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