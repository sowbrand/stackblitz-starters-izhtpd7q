'use client';

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, ArrowRight, X, Key } from 'lucide-react';
import { extractConsolidatedPriceListData } from '@/services/geminiService';

interface Props {
  supplier: any;
  allMeshes: any[];
  setMeshes: (meshes: any[]) => void;
  onClose: () => void;
}

export function ConsolidatedPriceImporter({ supplier, allMeshes, setMeshes, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // CORREÇÃO: Definindo explicitamente como Set<string> para evitar erro de tipo
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  
  const [manualKey, setManualKey] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setExtractedData(null);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    if (!manualKey) {
      setError("Por favor, cole sua Chave de API no campo amarelo.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await extractConsolidatedPriceListData(file, manualKey);
      
      const safeData = Array.isArray(data) ? data : (data as any).products || [];
      setExtractedData(safeData);
      
      // CORREÇÃO: Convertendo explicitamente para string
      const allCodes = new Set<string>(
        safeData.map((p: any) => String(p.code || ''))
      );
      setSelectedProducts(allCodes);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao processar arquivo.');
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = (code: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(code)) {
      newSelected.delete(code);
    } else {
      newSelected.add(code);
    }
    setSelectedProducts(newSelected);
  };

  const toggleAll = () => {
    if (!extractedData) return;
    if (selectedProducts.size === extractedData.length) {
      setSelectedProducts(new Set());
    } else {
      const allCodes = new Set<string>(
        extractedData.map((p: any) => String(p.code || ''))
      );
      setSelectedProducts(allCodes);
    }
  };

  const handleImportSelected = () => {
    if (!extractedData) return;

    const newMeshes = extractedData
      .filter((item: any) => selectedProducts.has(String(item.code || '')))
      .map((item: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: item.name,
        code: item.code || 'S/C',
        price: Number(item.price || 0),
        supplierId: supplier?.id,
        width: 0, grammage: 0, yield: 0, composition: '', type: 'Malha', imageUrl: '', color: ''
      }));

    setMeshes([...allMeshes, ...newMeshes]);
    onClose();
  };

  return (
    <div className="bg-white p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="text-blue-600" />
          Importar Tabela
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto">
        
        {/* Input da Chave */}
        {!extractedData && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <label className="block text-sm font-bold text-yellow-800 mb-2 flex items-center gap-2">
              <Key size={16} /> Chave API Google:
            </label>
            <input 
              type="text" 
              value={manualKey}
              onChange={(e) => setManualKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full p-2 border border-yellow-300 rounded bg-white text-gray-800 text-sm outline-none"
            />
          </div>
        )}

        {/* Upload */}
        {!extractedData && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors">
            <input
              type="file"
              id="consolidated-upload"
              className="hidden"
              accept="image/*,.pdf"
              onChange={handleFileChange}
            />
            <label htmlFor="consolidated-upload" className="cursor-pointer flex flex-col items-center">
              <Upload className="h-10 w-10 text-gray-400 mb-3" />
              <span className="text-sm font-medium text-gray-700">
                {file ? file.name : 'Selecionar Imagem da Tabela'}
              </span>
            </label>
          </div>
        )}

        {/* Botão Processar */}
        {file && !extractedData && (
          <button
            onClick={handleProcess}
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Processar Agora'}
          </button>
        )}

        {/* Erro */}
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Tabela de Resultados */}
        {extractedData && (
          <div className="mt-6 border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                <CheckCircle size={16} />
                {extractedData.length} Itens
              </div>
              <button onClick={toggleAll} className="text-sm text-blue-600 hover:underline">
                Selecionar Todos
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase border-b bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 w-8">
                      <input 
                        type="checkbox" 
                        checked={selectedProducts.size === extractedData.length && extractedData.length > 0}
                        onChange={toggleAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-2">Código</th>
                    <th className="px-4 py-2">Nome</th>
                    <th className="px-4 py-2 text-right">Preço</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {extractedData.map((item: any, index: number) => {
                     const itemCode = String(item.code || '');
                     return (
                      <tr key={index} className="hover:bg-white transition-colors">
                        <td className="px-4 py-2">
                          <input 
                            type="checkbox" 
                            checked={selectedProducts.has(itemCode)}
                            onChange={() => toggleProduct(itemCode)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-2 font-medium text-gray-900">{itemCode || '---'}</td>
                        <td className="px-4 py-2 text-gray-600">{item.name}</td>
                        <td className="px-4 py-2 text-right font-bold text-green-600">
                          R$ {Number(item.price || 0).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end gap-3">
               <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                Cancelar
              </button>
              <button onClick={handleImportSelected} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">
                Importar <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}