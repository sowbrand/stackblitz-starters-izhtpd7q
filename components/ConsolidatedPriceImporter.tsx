'use client';

import React, { useState } from 'react';
import { Supplier, Mesh, ConsolidatedProduct } from '@/types';
import { extractConsolidatedPriceListData } from '@/services/geminiService';
import { X, FileJson, Loader2 } from 'lucide-react';

interface ConsolidatedPriceImporterProps {
  supplier: Supplier;
  allMeshes: Mesh[];
  setMeshes: React.Dispatch<React.SetStateAction<Mesh[]>>;
  onClose: () => void;
}

export const ConsolidatedPriceImporter: React.FC<ConsolidatedPriceImporterProps> = ({ supplier, allMeshes, setMeshes, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ConsolidatedProduct[] | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setError(null);
      setFileName(file.name);
      setExtractedData(null);
      setSelectedProducts(new Set());
      try {
        const data = await extractConsolidatedPriceListData(file);
        setExtractedData(data);
        const allProductCodes = new Set(data.map(p => p.code));
        setSelectedProducts(allProductCodes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleToggleProduct = (productCode: string) => {
    setSelectedProducts(prev => {
        const newSet = new Set(prev);
        if (newSet.has(productCode)) newSet.delete(productCode);
        else newSet.add(productCode);
        return newSet;
    });
  };

  const handleToggleAll = () => {
    if (!extractedData) return;
    if (selectedProducts.size === extractedData.length) {
        setSelectedProducts(new Set());
    } else {
        setSelectedProducts(new Set(extractedData.map(p => p.code)));
    }
  };

  const handleImport = () => {
    if (!extractedData) return;

    const productsToImport = extractedData.filter(p => selectedProducts.has(p.code));
    let updatedMeshes = [...allMeshes];

    productsToImport.forEach(product => {
      const existingMeshIndex = updatedMeshes.findIndex(m => m.code === product.code && m.supplierId === supplier.id);
      
      // Converte lista de preços para Objeto
      const newPrices: Record<string, number> = {};
      product.price_list.forEach(p => {
          const key = String(p.category || p.original_label);
          newPrices[key] = p.price_cash;
      });

      if (existingMeshIndex > -1) {
        const existingMesh = updatedMeshes[existingMeshIndex];
        updatedMeshes[existingMeshIndex] = {
            ...existingMesh,
            name: product.name || existingMesh.name,
            composition: product.specs.composition || existingMesh.composition,
            width: product.specs?.width_m ? product.specs.width_m * 100 : existingMesh.width,
            grammage: product.specs?.grammage_gsm || existingMesh.grammage,
            yield: product.specs?.yield_m_kg || existingMesh.yield,
            prices: newPrices, // Objeto atualizado
        };
      } else {
        const newMesh: Mesh = {
          id: Date.now().toString() + Math.random(),
          name: product.name,
          code: product.code,
          supplierId: supplier.id,
          prices: newPrices,
          width: product.specs?.width_m ? product.specs.width_m * 100 : 0,
          grammage: product.specs?.grammage_gsm || 0,
          yield: product.specs?.yield_m_kg || 0,
          composition: product.specs.composition || '',
          // Campos opcionais
          complement: product.is_complement ? 'Acessório' : undefined
        };
        updatedMeshes.push(newMesh);
      }
    });

    setMeshes(updatedMeshes);
    alert(`${productsToImport.length} produtos importados/atualizados com sucesso!`);
    onClose();
  };

  return (
    <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-black">Importador Consolidado: <span className="text-purple-600">{supplier.name}</span></h1>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
        </div>
      
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 mb-8 text-center">
            <h2 className="text-xl font-semibold text-black mb-2">Importar Tabela de Preços Consolidada (IA)</h2>
            <p className="text-gray-600 mb-4">Envie uma tabela complexa (e.g., FN Malhas) para agrupar produtos e extrair múltiplos preços.</p>
            <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center justify-center bg-purple-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-300">
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <FileJson size={20} className="mr-2" />}
                {isLoading ? 'Analisando Tabela...' : 'Enviar Arquivo'}
            </label>
            <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} disabled={isLoading} accept=".pdf,.png,.jpg,.jpeg" />
            {fileName && !isLoading && <p className="mt-3 text-sm text-gray-500">Arquivo: {fileName}</p>}
            {error && <p className="mt-3 text-sm text-red-500">Erro: {error}</p>}
        </div>

        {extractedData && (
             <div className="bg-white p-6 rounded-lg shadow-md border">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Produtos Extraídos e Agrupados</h2>
                     <div className="flex items-center">
                        <input 
                            type="checkbox" id="select-all" className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            checked={selectedProducts.size === extractedData.length}
                            onChange={handleToggleAll}
                        />
                        <label htmlFor="select-all" className="ml-2 font-semibold">Selecionar Todos</label>
                    </div>
                </div>
                <p className="mb-4 text-gray-600">Fornecedor identificado: <span className="font-bold">{extractedData[0]?.supplier}</span>. Revise os produtos agrupados abaixo.</p>

                <div className="space-y-4">
                    {extractedData.map(product => (
                        <div key={product.code} className="border rounded-lg p-4 bg-gray-50">
                             <div className="flex items-start">
                                <input 
                                    type="checkbox" id={`product-${product.code}`} className="h-5 w-5 rounded border-gray-400 text-purple-600 focus:ring-purple-500 mt-1"
                                    checked={selectedProducts.has(product.code)}
                                    onChange={() => handleToggleProduct(product.code)}
                                />
                                <div className="ml-4 flex-grow">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-bold text-black">{product.name} <span className="font-normal text-gray-500">({product.code})</span></h3>
                                        {product.is_complement && <span className="text-xs font-bold bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">ACESSÓRIO</span>}
                                    </div>
                                    <p className="text-sm text-gray-600">{product.specs.composition}</p>
                                    <div className="flex gap-4 text-sm mt-1 text-gray-800">
                                        <span>Largura: <span className="font-semibold">{product.specs.width_m} m</span></span>
                                        <span>Gramatura: <span className="font-semibold">{product.specs.grammage_gsm} g/m²</span></span>
                                        <span>Rendimento: <span className="font-semibold">{product.specs.yield_m_kg} m/kg</span></span>
                                    </div>

                                    <div className="mt-3">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-200">
                                                <tr>
                                                    <th className="p-2 font-semibold text-gray-800">Categoria Original</th>
                                                    <th className="p-2 font-semibold text-gray-800">Categoria Normalizada</th>
                                                    <th className="p-2 font-semibold text-gray-800 text-right">Preço (R$/kg)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            {product.price_list.map((price, index) => (
                                                <tr key={index} className="border-b">
                                                    <td className="p-2 text-gray-900">{price.original_label}</td>
                                                    <td className="p-2"><span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-medium">{price.category}</span></td>
                                                    <td className="p-2 text-right font-mono text-gray-900">R$ {price.price_cash.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                             </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={handleImport} 
                        disabled={selectedProducts.size === 0}
                        className="bg-purple-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Importar {selectedProducts.size} {selectedProducts.size === 1 ? 'produto' : 'produtos'}
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};