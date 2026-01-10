'use client';

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { extractPriceUpdateData } from '@/services/geminiService';

export default function PriceUpdateImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null); // 'any' evita erro de build
  const [error, setError] = useState<string | null>(null);

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
      // Chama o serviço atualizado
      const data = await extractPriceUpdateData(file);
      
      // O serviço retorna { effectiveDate, items: [...] } ou apenas os itens
      // Normalizamos aqui para garantir que temos uma lista
      const items = data.items || (Array.isArray(data) ? data : []);
      const date = data.effectiveDate || new Date().toISOString().split('T')[0];

      setExtractedData({
        effectiveDate: date,
        items: items
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao processar arquivo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FileText className="text-blue-600" />
        Importar Reajuste de Preços
      </h2>

      <div className="space-y-6">
        {/* Área de Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors">
          <input
            type="file"
            id="update-upload"
            className="hidden"
            accept="image/*,.pdf"
            onChange={handleFileChange}
          />
          <label htmlFor="update-upload" className="cursor-pointer flex flex-col items-center">
            <Upload className="h-10 w-10 text-gray-400 mb-3" />
            <span className="text-sm font-medium text-gray-700">
              {file ? file.name : 'Clique para selecionar a imagem do comunicado'}
            </span>
            <span className="text-xs text-gray-500 mt-1">
              Suporta JPG, PNG (Tabelas ou Cartas)
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
                Lendo com IA...
              </>
            ) : (
              'Processar Reajuste'
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
                Dados Extraídos
              </div>
              <span className="text-sm text-gray-500">
                Vigência: <strong>{extractedData.effectiveDate}</strong>
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase border-b">
                  <tr>
                    <th className="pb-2">Código</th>
                    <th className="pb-2 text-right">Novo Preço</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {extractedData.items.length > 0 ? (
                    extractedData.items.map((item: any, index: number) => (
                      <tr key={index}>
                        <td className="py-2 font-medium text-gray-900">
                          {item.code || item.product_code || '---'}
                        </td>
                        <td className="py-2 text-right text-green-600 font-bold">
                          R$ {Number(item.newPrice || item.price || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="py-4 text-center text-gray-500">
                        Nenhum item identificado automaticamente.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <button className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-800 text-sm">
                Aplicar Atualizações <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}