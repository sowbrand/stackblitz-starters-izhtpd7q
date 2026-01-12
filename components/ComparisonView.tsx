'use client';

import React from 'react';
import { Mesh } from '@/types';

interface ComparisonViewProps {
  meshes: Mesh[];
}

export function ComparisonView({ meshes }: ComparisonViewProps) {
  if (meshes.length === 0) return <div className="p-4">Selecione itens para comparar</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-100 text-gray-700 uppercase font-bold text-xs">
          <tr>
            <th className="px-4 py-3 border-b">Atributo</th>
            {meshes.map(mesh => (
              <th key={mesh.id} className="px-4 py-3 border-b min-w-[200px]">
                {mesh.name} ({mesh.code})
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          <tr>
            <td className="px-4 py-2 font-medium text-gray-500 bg-gray-50">Largura</td>
            {meshes.map(mesh => (
              <td key={mesh.id} className="px-4 py-2">{mesh.width} m</td>
            ))}
          </tr>
          <tr>
            <td className="px-4 py-2 font-medium text-gray-500 bg-gray-50">Gramatura</td>
            {meshes.map(mesh => (
              <td key={mesh.id} className="px-4 py-2">{mesh.grammage} g/m²</td>
            ))}
          </tr>
          <tr>
            <td className="px-4 py-2 font-medium text-gray-500 bg-gray-50">Rendimento</td>
            {meshes.map(mesh => (
              <td key={mesh.id} className="px-4 py-2">{mesh.yield} m/kg</td>
            ))}
          </tr>
          <tr>
            <td className="px-4 py-2 font-medium text-gray-500 bg-gray-50 align-top pt-4">Tabela de Preços</td>
            {meshes.map(mesh => (
              <td key={mesh.id} className="px-4 py-2 align-top pt-4">
                <div className="space-y-1">
                  {mesh.variations.map(v => (
                    <div key={v.id} className="flex justify-between border-b border-dashed border-gray-200 pb-1 mb-1 last:border-0">
                      <span className="text-xs font-bold text-gray-500 uppercase">{v.name}</span>
                      <div className="text-right">
                        <div className="text-green-700 font-bold">R$ {v.priceCash.toFixed(2)}</div>
                        {v.priceFactored > 0 && (
                           <div className="text-[10px] text-orange-600">Fat: R$ {v.priceFactored.toFixed(2)}</div>
                        )}
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