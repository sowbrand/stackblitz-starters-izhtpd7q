'use client';

import React, { useState } from 'react';
import { Supplier, Mesh, BatchProduct } from '@/types';
import { extractBatchDataFromFiles } from '@/services/geminiService';
import { Upload, X, Layers, CheckCircle, AlertCircle, Loader2, RefreshCw, PlusCircle } from 'lucide-react';

interface BatchImporterProps {
  supplier: Supplier;
  onImport: (meshes: Mesh[]) => void;
  onCancel: () => void;
  existingMeshes: Mesh[];
}

export const BatchImporter: React.FC<BatchImporterProps> = ({ supplier, onImport, onCancel, existingMeshes }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<BatchProduct[] | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files);
    }
  };

  const processFiles = async (files: FileList) => {
    setIsLoading(true);
    setError(null);
    setExtractedData(null);
    
    try {
      const fileArray = Array.from(files);
      // Chama o serviço REAL (sem mocks falsos)
      const data = await extractBatchDataFromFiles(fileArray);
      
      if (data.length === 0) {
          setError("A IA não conseguiu identificar produtos. Verifique se as imagens estão nítidas ou se a Chave API está válida.");
      } else {
          setExtractedData(data);
          // Seleciona todos por padrão
          const allProductCodes = new Set(data.map(p => p.product_code));
          setSelectedProducts(allProductCodes);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar arquivos.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProductSelection = (code: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(code)) {
      newSelection.delete(code);
    } else {
      newSelection.add(code);
    }
    setSelectedProducts(newSelection);
  };

  const handleImport = () => {
    if (!extractedData) return;

    const productsToImport = extractedData.filter(p => selectedProducts.has(p.product_code));
    const finalMeshes: Mesh[] = [];

    productsToImport.forEach(product => {
      // Verifica se já existe produto com esse código para este fornecedor
      // Normalizamos para string para evitar erros de tipo
      const existingMesh = existingMeshes.find(m => 
          String(m.code) === String(product.product_code) && 
          String(m.supplierId) === String(supplier.id)
      );

      // Converte lista de preços da IA para objeto do sistema
      const newPrices: Record<string, number> = {};
      product.price_list.forEach(p => {
          const key = String(p.category_normalized || p.original_category_name);
          newPrices[key] = p.price_cash_kg;
      });

      if (existingMesh) {
        // --- ATUALIZAR (UPDATE) ---
        // Mantém ID original, atualiza dados técnicos e preços
        finalMeshes.push({
          ...existingMesh,
          name: product.product_name || existingMesh.name, // Prefere o nome novo se houver
          composition: product.composition || existingMesh.composition,
          width: product.specs.width_m ? product.specs.width_m * 100 : existingMesh.width, // m para cm
          grammage: product.specs.grammage_gsm || existingMesh.grammage,
          prices: newPrices, // Sobrescreve preços antigos
          // Atualiza data de modificação se você tiver esse campo, senão mantém
        });
      } else {
        // --- CRIAR NOVO (CREATE) ---
        const newMesh: Mesh = {
          id: Date.now().toString() + Math.random().toString().slice(2, 6),
          supplierId: supplier.id,
          code: product.product_code,
          name: product.product_name,
          composition: product.composition,
          width: product.specs.width_m ? product.specs.width_m * 100 : 0,
          grammage: product.specs.grammage_gsm || 0,
          yield: 0, // A IA nem sempre pega rendimento em tabela de preço
          prices: newPrices,
          complement: product.complement?.info,
          imageUrl: ''
        };
        finalMeshes.push(newMesh);
      }
    });

    onImport(finalMeshes);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Layers className="text-orange-500" />
          Importador em Lote: <span className="text-gray-700">{supplier.name}</span>
        </h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>

      {!extractedData ? (
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors
            ${isDragOver ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-400'}
            ${error ? 'border-red-300 bg-red-50' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isLoading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 text-orange-500 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Analisando arquivos com IA...</p>
              <p className="text-sm text-gray-400 mt-2">Isso pode levar alguns segundos. Estamos lendo os dados reais.</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <Layers className={`h-16 w-16 mx-auto ${error ? 'text-red-400' : 'text-gray-400'}`} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Arraste seus arquivos aqui</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Suporta imagens (JPG, PNG) e PDF. Envie quantos arquivos quiser.
                A IA lerá exatamente o que está nas tabelas.
              </p>
              
              {error && (
                <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md flex items-center justify-center gap-2 text-sm">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <label className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md font-medium transition-colors inline-flex items-center gap-2">
                <Upload size={20} />
                Selecionar Arquivos
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                  {extractedData.length} Produtos Encontrados
              </h3>
              <div className="text-sm text-gray-500">
                  Selecione os que deseja importar
              </div>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {extractedData.map((product, idx) => {
                const isSelected = selectedProducts.has(product.product_code);
                // Verifica se já existe para mostrar ícone diferente
                const isUpdate = existingMeshes.some(m => String(m.code) === String(product.product_code));

                return (
                  <div 
                    key={`${product.product_code}-${idx}`}
                    className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md
                      ${isSelected ? 'border-orange-500 bg-white ring-1 ring-orange-200' : 'border-gray-200 bg-white opacity-60'}`}
                    onClick={() => toggleProductSelection(product.product_code)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 flex-shrink-0 ${isSelected ? 'text-orange-500' : 'text-gray-300'}`}>
                        <CheckCircle size={20} fill={isSelected ? "currentColor" : "none"} />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-gray-900">{product.product_name}</h4>
                                {isUpdate ? (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                                        <RefreshCw size={10} /> Atualização
                                    </span>
                                ) : (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                                        <PlusCircle size={10} /> Novo
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 font-mono">Cód: {product.product_code}</p>
                          </div>
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-600 grid grid-cols-2 gap-2">
                          <p><span className="font-semibold">Comp:</span> {product.composition}</p>
                          <p><span className="font-semibold">Dados:</span> {product.specs.width_m}m | {product.specs.grammage_gsm}g/m²</p>
                        </div>

                        {product.price_list.length > 0 && (
                            <div className="mt-3 bg-gray-50 p-2 rounded text-xs border border-gray-100">
                            <p className="font-semibold mb-1 text-gray-700">Preços Detectados:</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                {product.price_list.map((price, pIdx) => (
                                <div key={pIdx} className="flex justify-between">
                                    <span className="text-gray-500 capitalize">{price.category_normalized || price.original_category_name}:</span>
                                    <span className="font-mono font-medium text-gray-900">R$ {price.price_cash_kg.toFixed(2)}</span>
                                </div>
                                ))}
                            </div>
                            </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => {
                setExtractedData(null);
                setSelectedProducts(new Set());
              }}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleImport}
              disabled={selectedProducts.size === 0}
              className={`px-6 py-2 rounded-md font-medium text-white transition-colors
                ${selectedProducts.size > 0 
                  ? 'bg-orange-600 hover:bg-orange-700 shadow-md' 
                  : 'bg-gray-300 cursor-not-allowed'}`}
            >
              {selectedProducts.size > 0 
                ? `Confirmar (${selectedProducts.size})` 
                : 'Selecione produtos'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}