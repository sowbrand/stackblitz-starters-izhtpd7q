
import React, { useState, useMemo, useEffect } from 'react';
import { Mesh, Supplier, ColorCategory } from '../types';
import { MESH_TYPES } from '@/lib/constants';
import { X, Plus, Star } from 'lucide-react';

interface ComparisonViewProps {
  allMeshes: Mesh[];
  initialMeshes: Mesh[];
  suppliers: Supplier[];
}

type HighlightMetric = 'geral' | 'price_kg' | 'price_m' | 'cost_m2' | 'yield';

const ComparisonCard: React.FC<{
  mesh: Mesh;
  supplierName: string;
  onRemove: (id: number) => void;
  isWinner: boolean;
  selectedCategory: ColorCategory;
}> = ({ mesh, supplierName, onRemove, isWinner, selectedCategory }) => {

  const selectedPriceData = mesh.prices.find(p => p.colorCategory === selectedCategory);
  const priceKg = selectedPriceData?.price;

  const priceMetre = priceKg !== undefined && mesh.yield > 0 ? priceKg / mesh.yield : undefined;
  const costM2 = priceKg !== undefined && mesh.grammage > 0 ? (priceKg / 1000) * mesh.grammage : undefined;
  
  const cardClasses = isWinner 
    ? 'border-2 border-lime-500 shadow-lg ring-2 ring-lime-200' 
    : 'border border-gray-200 shadow-sm';

  return (
    <div className={`bg-white rounded-lg flex flex-col w-80 flex-shrink-0 relative transition-all duration-300 ${cardClasses}`}>
        {isWinner && (
             <div className="absolute top-0 left-0 bg-[#72bf03] text-white text-xs font-bold px-3 py-1 rounded-br-lg z-10 flex items-center">
                <Star size={12} className="mr-1.5" fill="white"/>
                Melhor Opção
             </div>
        )}
        <button onClick={() => onRemove(mesh.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 z-10"><X size={18} /></button>
        <div className={`border-b px-4 pb-4 ${isWinner ? 'pt-8' : 'pt-4'}`}>
            <h3 className="font-bold text-lg text-black truncate">{mesh.name}</h3>
            <p className="text-sm text-gray-500">{supplierName}</p>
        </div>
        <div className="p-4 flex-grow space-y-2 text-sm">
            <div className="p-3 rounded-md bg-gray-50">
                <p className="font-semibold text-gray-800">Preço / kg</p>
                {priceKg !== undefined ? (
                    <>
                        <p className="text-xl font-bold text-black">R$ {priceKg.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">({selectedCategory})</p>
                    </>
                ) : (
                    <p className="text-lg font-bold text-gray-400">Indisponível</p>
                )}
            </div>
            <div className="p-3 rounded-md bg-gray-50">
                <p className="font-semibold text-gray-800">Preço / metro (calc.)</p>
                {priceMetre !== undefined ? (
                    <p className="text-xl font-bold text-black">R$ {priceMetre.toFixed(2)}</p>
                ) : (
                     <p className="text-lg font-bold text-gray-400">N/A</p>
                )}
            </div>
             <div className="p-3 rounded-md bg-gray-50">
                <p className="font-semibold text-gray-800">Custo / m² (calc.)</p>
                {costM2 !== undefined ? (
                    <p className="text-xl font-bold text-black">R$ {costM2.toFixed(2)}</p>
                ) : (
                    <p className="text-lg font-bold text-gray-400">N/A</p>
                )}
            </div>
            <div className="p-3 rounded-md bg-gray-50">
                <p className="font-semibold text-gray-800">Rendimento</p>
                <p className="text-xl font-bold text-black">{mesh.yield.toFixed(2)} m/kg</p>
            </div>
            <div className="pt-2">
                <p><span className="font-semibold">Gramatura:</span> {mesh.grammage} g/m²</p>
                <p><span className="font-semibold">Largura:</span> {mesh.width} cm</p>
                <p><span className="font-semibold">Composição:</span> {mesh.composition}</p>
            </div>
        </div>
    </div>
  );
};

export const ComparisonView: React.FC<ComparisonViewProps> = ({ allMeshes, initialMeshes, suppliers }) => {
  const [comparing, setComparing] = useState<Mesh[]>(initialMeshes);
  const [selectedType, setSelectedType] = useState<string>('');
  const [highlightedMetric, setHighlightedMetric] = useState<HighlightMetric>('geral');
  const [selectedCategory, setSelectedCategory] = useState<ColorCategory>(ColorCategory.Claras);
  
  const availableCategories = useMemo(() => {
    const categories = new Set<ColorCategory>();
    comparing.forEach(mesh => {
        mesh.prices.forEach(priceInfo => {
            categories.add(priceInfo.colorCategory);
        });
    });
    const sorted = Array.from(categories).sort();
    if (sorted.length > 0 && !sorted.includes(selectedCategory)) {
        setSelectedCategory(sorted[0]);
    }
    return sorted;
  }, [comparing, selectedCategory]);


  useEffect(() => {
    if (initialMeshes.length > 0) {
      const firstMeshName = initialMeshes[0].name.toLowerCase();
      const foundType = MESH_TYPES.find(type => firstMeshName.includes(type.toLowerCase()));
      if (foundType) {
        setSelectedType(foundType);
      }
    }
  }, [initialMeshes]);

  const availableMeshes = useMemo(() => {
    return allMeshes.filter(m => 
      (!selectedType || m.name.toLowerCase().includes(selectedType.toLowerCase())) &&
      !comparing.some(c => c.id === m.id)
    );
  }, [allMeshes, comparing, selectedType]);

  const bestValues = useMemo(() => {
    if (comparing.length === 0) return null;
    
    const getPrice = (mesh: Mesh) => mesh.prices.find(p => p.colorCategory === selectedCategory)?.price;
    const getValidMeshes = (valueExtractor: (mesh: Mesh) => number | undefined) => 
        comparing.map(valueExtractor).filter((v): v is number => v !== undefined && v > 0);

    const validPricesKg = getValidMeshes(getPrice);
    const validPricesM = getValidMeshes(m => {
        const p = getPrice(m);
        return p && m.yield > 0 ? p / m.yield : undefined;
    });
    const validCostsM2 = getValidMeshes(m => {
        const p = getPrice(m);
        return p && m.grammage > 0 ? (p / 1000) * m.grammage : undefined;
    });

    return {
      price_kg: validPricesKg.length > 0 ? Math.min(...validPricesKg) : Infinity,
      price_m: validPricesM.length > 0 ? Math.min(...validPricesM) : Infinity,
      cost_m2: validCostsM2.length > 0 ? Math.min(...validCostsM2) : Infinity,
      yield: Math.max(...comparing.map(m => m.yield || 0)),
    }
  }, [comparing, selectedCategory]);

  const addMeshToCompare = (mesh: Mesh) => setComparing(prev => [...prev, mesh]);
  const removeMeshFromCompare = (id: number) => setComparing(prev => prev.filter(m => m.id !== id));
  const getSupplierName = (id: number) => suppliers.find(s => s.id === id)?.name || 'Desconhecido';

  const isBest = (mesh: Mesh, metric: HighlightMetric) => {
    if (!bestValues || comparing.length < 1) return false;
    const price = mesh.prices.find(p => p.colorCategory === selectedCategory)?.price;

    if (price === undefined || price <= 0) return false;

    switch (metric) {
        case 'geral':
        case 'cost_m2': 
            return ((price / 1000) * mesh.grammage) === bestValues.cost_m2;
        case 'price_kg': 
            return price === bestValues.price_kg;
        case 'price_m': 
            return (price / (mesh.yield || Infinity)) === bestValues.price_m;
        case 'yield': 
            // Yield is special, it doesn't depend on price. Higher is better.
            return mesh.yield === bestValues.yield;
        default: 
            return false;
    }
  }

  return (
    <div>
        <h1 className="text-3xl font-bold text-black mb-2">Comparador de Malhas</h1>
        <p className="text-gray-600 mb-6">Analise diferentes malhas lado a lado para tomar a melhor decisão de compra.</p>

        <div className="bg-gray-50 p-4 rounded-lg border mb-6 flex flex-wrap items-center gap-4">
            <div className="flex-grow min-w-[200px]">
                <label className="font-semibold block mb-1">Filtrar por tipo de malha:</label>
                <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="w-full p-2 border rounded bg-white text-gray-900">
                    <option value="">Todos os tipos</option>
                    {MESH_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
            </div>
             <div className="flex-grow min-w-[200px]">
                <label className="font-semibold block mb-1">Comparar Tabela de:</label>
                <select 
                    value={selectedCategory} 
                    onChange={e => setSelectedCategory(e.target.value as ColorCategory)} 
                    className="w-full p-2 border rounded bg-white text-gray-900"
                    disabled={availableCategories.length === 0}
                >
                    {availableCategories.length > 0 ? (
                      availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)
                    ) : (
                      <option>Nenhuma opção</option>
                    )}
                </select>
            </div>
            <div className="flex-grow min-w-[200px]">
                <label className="font-semibold block mb-1">Destacar melhor opção por:</label>
                <select value={highlightedMetric} onChange={e => setHighlightedMetric(e.target.value as HighlightMetric)} className="w-full p-2 border rounded bg-white text-gray-900">
                    <option value="geral">Geral (Custo-Benefício)</option>
                    <option value="price_kg">Preço / kg</option>
                    <option value="price_m">Preço / metro</option>
                    <option value="cost_m2">Custo / m²</option>
                    <option value="yield">Rendimento</option>
                </select>
            </div>
        </div>

        <div className="flex overflow-x-auto space-x-6 pb-6 pt-4">
            {comparing.map(mesh => {
              const isWinner = isBest(mesh, highlightedMetric);
              return (
                <ComparisonCard 
                    key={mesh.id}
                    mesh={mesh}
                    supplierName={getSupplierName(mesh.supplierId)}
                    onRemove={removeMeshFromCompare}
                    selectedCategory={selectedCategory}
                    isWinner={isWinner}
                />
              )
            })}

            <div className="bg-gray-100 border-2 border-dashed rounded-lg flex flex-col items-center justify-center w-80 flex-shrink-0 p-4">
                <h3 className="font-bold text-lg mb-4">Adicionar Malha à Comparação</h3>
                <div className="w-full max-h-64 overflow-y-auto">
                    {availableMeshes.length > 0 ? availableMeshes.map(mesh => (
                        <button key={mesh.id} onClick={() => addMeshToCompare(mesh)} className="w-full text-left p-2 rounded hover:bg-gray-200 flex justify-between items-center">
                            <span>{mesh.name} <span className="text-xs text-gray-500">({getSupplierName(mesh.supplierId)})</span></span>
                            <Plus size={16} className="text-lime-600"/>
                        </button>
                    )) : <p className="text-sm text-gray-500 text-center">Nenhuma outra malha encontrada.</p>}
                </div>
            </div>
        </div>
    </div>
  );
};
