'use client';

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { extractConsolidatedPriceListData } from '@/services/geminiService';

export function ConsolidatedPriceImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<any>>(new Set());

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setExtractedData(null);
    }
  };

  const handleProcess = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const data = await extractConsolidatedPriceListData(file);
      
      // Garante que é um array
      const safeData = Array.isArray(data) ? data : (data as any).products || [];
      
      setExtractedData(safeData);
      
      // Seleciona tudo por padrão
      const allCodes = new Set(safeData.map((p: any) => String(p.code || '')));
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
      const allCodes = new Set(extractedData.map((p: any) => String(p.code || '')));
      setSelectedProducts(allCodes);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FileText className="text-blue-600" />
        Importar Tabela Consolidada
      </h2>

      <div className="space-y-6">
        {/* Área de Upload */}
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
              {file ? file.name : 'Clique para selecionar a imagem da tabela'}
            </span>
            <span className="text-xs text-gray-500 mt-1">
              Suporta JPG, PNG (Tabelas completas)
            </span>
          </label>
        </div>

        {/* Botão de Ação */}
        {file && !extractedData && (
          <button
            onClick={handleProcess}
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Lendo Tabela...
              </>
            ) : (
              'Processar Tabela'
            )}
          </button>
        )}

        {/* Exibição de Erro */}
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Resultado da Extração */}
        {extractedData && (
          <div className="mt-6 border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                <CheckCircle size={16} />
                {extractedData.length} Produtos Encontrados
              </div>
              <button onClick={toggleAll} className="text-sm text-blue-600 hover:underline">
                {selectedProducts.size === extractedData.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
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
                  {extractedData?.map((item: any, index: number) => (
                    <tr key={index} className="hover:bg-white transition-colors">
                      <td className="px-4 py-2">
                        <input 
                          type="checkbox" 
                          checked={selectedProducts.has(String(item.code || ''))}
                          onChange={() => toggleProduct(String(item.code || ''))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-2 font-medium text-gray-900">{item.code || '---'}</td>
                      <td className="px-4 py-2 text-gray-600">{item.name}</td>
                      <td className="px-4 py-2 text-right font-bold text-green-600">
                        R$ {Number(item.price || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">
                Importar {selectedProducts.size} Selecionados <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}