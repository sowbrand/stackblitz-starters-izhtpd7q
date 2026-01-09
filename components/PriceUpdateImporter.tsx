'use client';

import React, { useState, useMemo } from 'react';
import { Supplier, Mesh, PriceUpdateData } from '@/types';
import { extractPriceUpdateData } from '@/services/geminiService';
import { X, RefreshCcw, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface PriceUpdateImporterProps {
  supplier: Supplier;
  allMeshes: Mesh[];
  setMeshes: React.Dispatch<React.SetStateAction<Mesh[]>>;
  onClose: () => void;
}

export const PriceUpdateImporter: React.FC<PriceUpdateImporterProps> = ({ supplier, allMeshes, setMeshes, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<PriceUpdateData[] | null>(null);
  const [selectedUpdates, setSelectedUpdates] = useState<Set<string>>(new Set());

  const supplierMeshes = useMemo(() => allMeshes.filter(m => m.supplierId === supplier.id), [allMeshes, supplier.id]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setError(null);
      setFileName(file.name);
      setExtractedData(null);
      setSelectedUpdates(new Set());
      try {
        const data = await extractPriceUpdateData(file);
        setExtractedData(data);
        const allProductCodes = new Set(data.map(p => p.product_code));
        setSelectedUpdates(allProductCodes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleToggleUpdate = (productCode: string) => {
    setSelectedUpdates(prev => {
        const newSet = new Set(prev);
        if (newSet.has(productCode)) newSet.delete(productCode);
        else newSet.add(productCode);
        return newSet;
    });
  };

  const handleToggleAll = () => {
    if (!extractedData) return;
    if (selectedUpdates.size === extractedData.length) {
        setSelectedUpdates(new Set());
    } else {
        setSelectedUpdates(new Set(extractedData.map(p => p.product_code)));
    }
  };

  const handleImport = () => {
    if (!extractedData) return;

    const updatesToApply = extractedData.filter(p => selectedUpdates.has(p.product_code));
    let updatedCount = 0;

    setMeshes(prevMeshes => {
        const newMeshes = [...prevMeshes];
        updatesToApply.forEach(update => {
            const meshIndex = newMeshes.findIndex(m => m.code === update.product_code && m.supplierId === supplier.id);

            if (meshIndex > -1) {
                const currentMesh = newMeshes[meshIndex];
                const newPrices = { ...currentMesh.prices }; // Copia preços atuais
                
                // Sobrescreve com os novos
                update.price_list.forEach(p => {
                    const key = String(p.category_normalized);
                    newPrices[key] = p.price_cash_kg;
                });

                // Atualiza malha
                newMeshes[meshIndex] = {
                    ...currentMesh,
                    prices: newPrices,
                };
                updatedCount++;
            }
        });
        return newMeshes;
    });

    alert(`${updatedCount} produtos tiveram seus preços atualizados com sucesso!`);
    onClose();
  };


  return (
    <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-black">Atualizar Preços: <span className="text-teal-600">{supplier.name}</span></h1>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
        </div>
      
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 mb-8 text-center">
            <h2 className="text-xl font-semibold text-black mb-2">Atualizar Preços de Produtos Existentes (IA)</h2>
            <p className="text-gray-600 mb-4">Envie um arquivo de atualização. A IA irá identificar os produtos pelo código e extrair a nova tabela de preços.</p>
            <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center justify-center bg-teal-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-teal-700 transition-colors duration-300">
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <RefreshCcw size={20} className="mr-2" />}
                {isLoading ? 'Analisando Arquivo...' : 'Enviar Arquivo de Atualização'}
            </label>
            <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} disabled={isLoading} accept=".pdf,.png,.jpg,.jpeg,.xlsx" />
            {fileName && !isLoading && <p className="mt-3 text-sm text-gray-500">Arquivo: {fileName}</p>}
            {error && <p className="mt-3 text-sm text-red-500">Erro: {error}</p>}
        </div>

        {extractedData && (
             <div className="bg-white p-6 rounded-lg shadow-md border">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Atualizações de Preço Identificadas</h2>
                     <div className="flex items-center">
                        <input type="checkbox" id="select-all" className="h-5 w-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                            checked={selectedUpdates.size === extractedData.length}
                            onChange={handleToggleAll}
                        />
                        <label htmlFor="select-all" className="ml-2 font-semibold">Selecionar Todos</label>
                    </div>
                </div>
                <p className="mb-4 text-gray-600">Revise as atualizações de preço abaixo. Apenas os produtos encontrados no seu banco de dados para <span className="font-bold">{supplier.name}</span> serão atualizados.</p>

                <div className="space-y-4">
                    {extractedData.map(update => {
                        const existingMesh = supplierMeshes.find(m => m.code === update.product_code);
                        return (
                            <div key={update.product_code} className={`border rounded-lg p-4 ${existingMesh ? 'bg-gray-50' : 'bg-red-50'}`}>
                                 <div className="flex items-start">
                                    <input type="checkbox" id={`update-${update.product_code}`} className="h-5 w-5 rounded border-gray-400 text-teal-600 focus:ring-teal-500 mt-1"
                                        checked={selectedUpdates.has(update.product_code)}
                                        onChange={() => handleToggleUpdate(update.product_code)}
                                        disabled={!existingMesh}
                                    />
                                    <div className="ml-4 flex-grow">
                                        <h3 className="text-lg font-bold text-black">{update.product_name} <span className="font-normal text-gray-500">({update.product_code})</span></h3>
                                        {existingMesh ? (
                                            <div className="flex items-center text-sm text-green-600 font-semibold mt-1">
                                                <CheckCircle size={16} className="mr-1.5" />
                                                Produto Encontrado no Banco de Dados
                                            </div>
                                        ) : (
                                            <div className="flex items-center text-sm text-red-600 font-semibold mt-1">
                                                <XCircle size={16} className="mr-1.5" />
                                                Produto não encontrado. Esta atualização será ignorada.
                                            </div>
                                        )}
                                        
                                        <div className="mt-3">
                                            <h4 className="font-semibold text-gray-800 mb-1">Nova Tabela de Preços:</h4>
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-gray-200">
                                                    <tr>
                                                        <th className="p-2 font-semibold text-gray-800">Categoria</th>
                                                        <th className="p-2 font-semibold text-gray-800 text-right">Preço (R$/kg)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                {update.price_list.map((price, index) => (
                                                    <tr key={index} className="border-b">
                                                        <td className="p-2"><span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-medium">{price.category_normalized}</span></td>
                                                        <td className="p-2 text-right font-mono text-gray-900">R$ {price.price_cash_kg.toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                 </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 flex justify-end">
                    <button onClick={handleImport} disabled={selectedUpdates.size === 0 || !extractedData.some(u => supplierMeshes.some(m => m.code === u.product_code))}
                        className="bg-teal-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-teal-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">
                        Atualizar {selectedUpdates.size} {selectedUpdates.size === 1 ? 'produto' : 'produtos'}
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};