'use client';

import React from 'react';
import { Mesh } from '@/types';
import { PackageOpen, Trophy } from 'lucide-react';

interface ComparisonViewProps {
  meshes: Mesh[];
  criteria?: 'costBenefit' | 'pricePerKg' | 'yield' | 'width'; // Novo prop opcional (padrão costBenefit)
}

export function ComparisonView({ meshes, criteria = 'costBenefit' }: ComparisonViewProps) {
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

  // --- LÓGICA DO VENCEDOR DINÂMICA ---
  const calculatedMeshes = meshes.map(mesh => {
     // Menor preço base (à vista)
     const basePrice = Math.min(...mesh.variations.map(v => v.priceCash).filter(p => p > 0));
     
     // Cálculos
     const pricePerMeter = mesh.yield > 0 ? basePrice / mesh.yield : 999999;
     
     return { ...mesh, basePrice, pricePerMeter };
  });

  // Determina quem é o "Melhor" baseado no critério escolhido
  let bestValue: number;
  let isBest = (mesh: any) => false;
  let label = "";

  switch (criteria) {
    case 'pricePerKg':
        bestValue = Math.min(...calculatedMeshes.map(m => m.basePrice).filter(p => p > 0));
        isBest = (m) => m.basePrice === bestValue;
        label = "Menor Preço Kg";
        break;
    case 'yield':
        bestValue = Math.max(...calculatedMeshes.map(m => m.yield));
        isBest = (m) => m.yield === bestValue;
        label = "Maior Rendimento";
        break;
    case 'width':
        bestValue = Math.max(...calculatedMeshes.map(m => m.width));
        isBest = (m) => m.width === bestValue;
        label = "Maior Largura";
        break;
    case 'costBenefit':
    default:
        bestValue = Math.min(...calculatedMeshes.map(m => m.pricePerMeter).filter(p => p > 0));
        isBest = (m) => m.pricePerMeter === bestValue;
        label = "Melhor Custo/Benefício";
        break;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-[#545454] uppercase bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 font-bold tracking-wider w-48 bg-gray-50 sticky left-0 z-10 border-r border-gray-100">
                Atributos
            </th>
            {calculatedMeshes.map(mesh => {
               const winner = isBest(mesh);
               return (
                <th key={mesh.id} className={`px-6 py-4 min-w-[220px] align-top relative ${winner ? 'bg-[#72BF03]/10' : ''}`}>
                    {winner && (
                        <div className="absolute top-0 left-0 right-0 bg-[#72BF03] text-white text-[10px] font-bold text-center py-1 uppercase tracking-widest flex items-center justify-center gap-1 shadow-sm">
                            <Trophy size={10} /> {label}
                        </div>
                    )}
                    <div className={`flex flex-col gap-1 ${winner ? 'mt-6' : 'mt-2'}`}>
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
          
          {/* Métricas Calculadas (Destaques) */}
          <tr className="bg-gray-50/50">
            <td className="px-6 py-4 font-bold text-black bg-gray-100/50 sticky left-0 border-r border-gray-100 align-middle">
                Análise
            </td>
            {calculatedMeshes.map(mesh => (
              <td key={mesh.id} className={`px-6 py-4 ${isBest(mesh) ? 'bg-[#72BF03]/5' : ''}`}>
                 <div className="flex flex-col gap-2">
                    {/* Preço Base */}
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Preço Kg:</span>
                        <span className={`font-bold ${criteria === 'pricePerKg' && isBest(mesh) ? 'text-[#72BF03]' : 'text-black'}`}>
                           R$ {mesh.basePrice.toFixed(2)}
                        </span>
                    </div>
                    {/* Rendimento */}
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Rendimento:</span>
                        <span className={`font-bold ${criteria === 'yield' && isBest(mesh) ? 'text-[#72BF03]' : 'text-black'}`}>
                           {mesh.yield} m/kg
                        </span>
                    </div>
                    {/* Custo Metro */}
                    <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                        <span className="font-bold text-[#545454] uppercase text-[10px]">Custo Metro:</span>
                        <span className={`font-bold text-lg ${criteria === 'costBenefit' && isBest(mesh) ? 'text-[#72BF03]' : 'text-gray-700'}`}>
                            R$ {mesh.pricePerMeter < 9999 ? mesh.pricePerMeter.toFixed(2) : '-'}
                        </span>
                    </div>
                 </div>
              </td>
            ))}
          </tr>

          {/* Dados Físicos */}
          <tr className="hover:bg-gray-50/50 transition-colors">
            <td className="px-6 py-4 font-bold text-[#545454] bg-white sticky left-0 border-r border-gray-100">Largura</td>
            {meshes.map(mesh => (
                <td key={mesh.id} className={`px-6 py-4 ${criteria === 'width' && isBest(mesh) ? 'text-[#72BF03] font-bold' : 'text-[#545454]'}`}>
                    {mesh.width} m
                </td>
            ))}
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