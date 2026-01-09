
'use client';

import React from 'react';
import { Fabric, ColorCategory } from '@/types/index';
import { formatCurrency, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Star } from 'lucide-react';

interface FabricCardProps {
  fabric: Fabric;
  selectedCategory: ColorCategory;
  isBestOption: boolean;
}

export const FabricCard: React.FC<FabricCardProps> = ({ fabric, selectedCategory, isBestOption }) => {
  const { name, supplier, code, technical_specs } = fabric;
  const { width_cm, grammage_gsm, yield_m_kg, composition } = technical_specs;

  const priceData = fabric.price_list.find(p => p.category === selectedCategory);
  const priceKg = priceData?.price_kg;

  const priceMeter = priceKg && yield_m_kg > 0 ? priceKg / yield_m_kg : undefined;
  const costM2 = priceKg && grammage_gsm > 0 ? (priceKg / 1000) * grammage_gsm : undefined;

  return (
    <div className={cn(
        "bg-white rounded-lg border flex flex-col w-full relative transition-all duration-300 shadow-sm",
        isBestOption ? "border-2 border-brand-green shadow-lg ring-2 ring-lime-100" : "border-gray-200"
    )}>
      {isBestOption && (
        <div className="absolute top-3 right-3 z-10">
          <Badge icon={Star}>Melhor Opção</Badge>
        </div>
      )}

      <div className="border-b px-5 py-4">
        <h3 className="font-bold text-lg text-black truncate pr-24">{name}</h3>
        <p className="text-sm text-gray-500">{supplier} - Cód: {code}</p>
      </div>

      <div className="p-4 flex-grow grid grid-cols-2 gap-4 text-sm">
        <div className="col-span-2 p-3 rounded-md bg-gray-50">
          <p className="font-semibold text-gray-800">Preço / kg ({selectedCategory})</p>
          <p className="text-2xl font-bold text-black">{formatCurrency(priceKg)}</p>
        </div>

        <div className="p-3 rounded-md bg-gray-50">
          <p className="font-semibold text-gray-800">Custo / m²</p>
          <p className="text-xl font-bold text-black">{formatCurrency(costM2)}</p>
        </div>
        <div className="p-3 rounded-md bg-gray-50">
          <p className="font-semibold text-gray-800">Preço / metro</p>
          <p className="text-xl font-bold text-black">{formatCurrency(priceMeter)}</p>
        </div>
        
        <div className="col-span-2 pt-2 space-y-1">
          <p><span className="font-semibold">Rendimento:</span> {yield_m_kg.toFixed(2)} m/kg</p>
          <p><span className="font-semibold">Gramatura:</span> {grammage_gsm} g/m²</p>
          <p><span className="font-semibold">Largura:</span> {width_cm} cm</p>
          <p><span className="font-semibold">Composição:</span> {composition}</p>
        </div>
      </div>
    </div>
  );
};
