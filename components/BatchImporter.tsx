'use client';

import React, { useState } from 'react';
import { Supplier, Mesh, BatchProduct } from '@/types';
import { extractBatchDataFromFiles } from '@/services/geminiService';
import { Upload, X, Layers, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

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
      const data = await extractBatchDataFromFiles(fileArray);
      setExtractedData(data);
      const allProductCodes = new Set(data.map(p => p.product_code));
      setSelectedProducts(allProductCodes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido ao processar os arquivos.');
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

  const toggleSelectAll = () => {
    if (!extractedData) return;
    
    if (selectedProducts.size === extractedData.length) {
      setSelectedProducts(new Set());
    } else {
      const allCodes = new Set(extractedData.map(p => p.product_code));
      setSelectedProducts(allCodes);
    }
  };

  const handleImport = () => {
    if (!extractedData) return;

    const productsToImport = extractedData.filter(p => selectedProducts.has(p.product_code));
    const newMeshes: Mesh[] = [];

    productsToImport.forEach(product => {
      const existingMesh = existingMeshes.find(m => m.code === product.product_code);

      const newPrices: Record<string, number> = {};
      product.price_list.forEach(p => {
          const key = String(p.category_normalized || p.original_category_name);
          newPrices[key] = p.price_cash_kg;
      });

      // CORREÇÃO: Accesso seguro ao complemento
      const newComplement = product.complement?.info || '';

      if (existingMesh) {
        newMeshes.push({
          ...existingMesh,
          name: product.product_name,
          composition: product.composition,
          // CORREÇÃO: Usar 'specs' e 'width_m'
          width: product.specs.width_m ? product.specs.width_m * 100 : existingMesh.width,
          grammage: product.specs.grammage_gsm || existingMesh.grammage,
          yield: product.specs.yield_m_kg || existingMesh.yield,
          prices: newPrices,
          complement: newComplement || existingMesh.complement
        });
      } else {
        const newMesh: Mesh = {
          id: Date.now().toString() + Math.random().toString(),
          supplierId: supplier.id,
          code: product.product_code,
          name: product.product_name,
          composition: product.composition,
          // CORREÇÃO: Usar 'specs'
          width: product.specs.width_m ? product.specs.width_m * 100 : 0,
          grammage: product.specs.grammage_gsm || 0,
          yield: product.specs.yield_m_kg || 0,
          prices: newPrices,
          complement: newComplement,
          imageUrl: ''
        };
        newMeshes.push(newMesh);
      }
    });

    onImport(newMeshes);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Layers className="text-orange-500" />
          Importador em Lote: <span className="text-orange-500">{supplier.name}</span>
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
              <p className="text-gray-600 font-medium">Analisando fichas técnicas com IA...</p>
              <p className="text-sm text-gray-400 mt-2">Isso pode levar alguns segundos.</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <Layers className={`h-16 w-16 mx-auto ${error ? 'text-red-400' : 'text-gray-400'}`} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Importar Múltiplas Fichas (IA)</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Envie várias imagens de fichas técnicas (e.g., Urbano Têxtil) de uma vez.
              </p>
              
              {error && (
                <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md flex items-center justify-center gap-2">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <label className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md font-medium transition-colors inline-flex items-center gap-2">
                <Upload size={20} />
                Enviar Arquivos
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
              <p className="text-xs text-gray-400 mt-4">Suporta: JPG, PNG, PDF</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Produtos Extraídos</h3>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="selectAll"
                  className="rounded text-orange-500 focus:ring-orange-500"
                  checked={selectedProducts.size === extractedData.length && extractedData.length > 0}
                  onChange={toggleSelectAll}
                />
                <label htmlFor="selectAll" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Selecionar Todos
                </label>
              </div>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {extractedData.map((product, idx) => {
                const isSelected = selectedProducts.has(product.product_code);
                return (
                  <div 
                    key={`${product.product_code}-${idx}`}
                    className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md
                      ${isSelected ? 'border-orange-500 bg-white ring-1 ring-orange-200' : 'border-gray-200 bg-white opacity-60'}`}
                    onClick={() => toggleProductSelection(product.product_code)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 flex-shrink-0 text-orange-500 opacity-${isSelected ? '100' : '0'}`}>
                        <CheckCircle size={20} fill={isSelected ? "currentColor" : "none"} className={isSelected ? "text-orange-500" : "text-gray-300"} />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-gray-900">{product.product_name}</h4>
                            <p className="text-xs text-gray-500">Cód: {product.product_code}</p>
                          </div>
                          {product.complement?.info && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                              {product.complement.info}
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-600 grid grid-cols-2 gap-2">
                          <p>Comp: {product.composition}</p>
                          <p>Larg: {product.specs.width_m}m | {product.specs.grammage_gsm}g/m²</p>
                        </div>

                        <div className="mt-3 bg-gray-50 p-2 rounded text-xs">
                          <p className="font-semibold mb-1 text-gray-700">Lista de Preços:</p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            {product.price_list.map((price, pIdx) => (
                              <div key={pIdx} className="flex justify-between">
                                <span className="text-gray-500">{price.category_normalized || price.original_category_name}:</span>
                                <span className="font-mono font-medium">R$ {price.price_cash_kg.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
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
              Voltar
            </button>
            <button
              onClick={handleImport}
              disabled={selectedProducts.size === 0}
              className={`px-6 py-2 rounded-md font-medium text-white transition-colors
                ${selectedProducts.size > 0 
                  ? 'bg-orange-600 hover:bg-orange-700 shadow-md' 
                  : 'bg-gray-300 cursor-not-allowed'}`}
            >
              Importar {selectedProducts.size} produtos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}