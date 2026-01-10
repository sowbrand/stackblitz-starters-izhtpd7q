'use client';

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, ArrowRight, X } from 'lucide-react';
import { extractPriceUpdateData } from '@/services/geminiService';
import { Supplier, Mesh } from '@/types';

// DEFINIÇÃO DAS PROPS (Isso corrige o erro do Vercel)
interface PriceUpdateImporterProps {
  supplier: Supplier;
  allMeshes: Mesh[];
  setMeshes: React.Dispatch<React.SetStateAction<Mesh[]>>;
  onClose: () => void;
}

export function PriceUpdateImporter({ supplier, allMeshes, setMeshes, onClose }: PriceUpdateImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
      const data = await extractPriceUpdateData(file);
      
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

  // Função para efetivar a atualização dos preços
  const handleApplyUpdates = () => {
    if (!extractedData || !extractedData.items) return;

    const updates = extractedData.items;
    let updateCount = 0;

    // Cria um mapa para busca rápida: Código -> Novo Preço
    const priceMap = new Map<string, number>();
    updates.forEach((u: any) => {
      const code = u.code || u.product_code;
      const price = Number(u.newPrice || u.price);
      if (code && !isNaN(price)) {
        priceMap.set(String(code).toUpperCase().trim(), price);
      }
    });

    // Atualiza a lista principal de malhas
    const newMeshes = allMeshes.map(mesh => {
      // Só atualiza se for deste fornecedor E tiver o código na lista
      if (String(mesh.supplierId) === String(supplier.id)) {
        const newPrice = priceMap.get(String(mesh.code).toUpperCase().trim());
        if (newPrice !== undefined) {
          updateCount++;
          return { ...mesh, price: newPrice };
        }
      }
      return mesh;
    });

    setMeshes(newMeshes);
    setSuccessMsg(`${updateCount} produtos atualizados com sucesso!`);
    
    // Fecha o modal após 1.5s
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="bg-white p-6 relative">
      {/* Botão de Fechar */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
      >
        <X size={20} />
      </button>

      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FileText className="text-blue-600" />
        Importar Reajuste - {supplier.name}
      </h2>

      <div className="space-y-6">
        {/* Área de Upload */}
        {!extractedData && !successMsg && (
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
        )}

        {/* Botão de Processar */}
        {file && !extractedData && !successMsg && (
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

        {/* Mensagens */}
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        
        {successMsg && (
          <div className="p-4 bg-green-50 text-green-700 rounded-lg text-center font-medium flex flex-col items-center gap-2">
            <CheckCircle size={32} />
            {successMsg}
          </div>
        )}

        {/* Resultado e Confirmação */}
        {extractedData && !successMsg && (
          <div className="mt-2 border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                <CheckCircle size={16} />
                Dados Identificados
              </div>
              <span className="text-sm text-gray-500">
                Vigência: <strong>{extractedData.effectiveDate}</strong>
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto mb-4">
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
                        Nenhum item identificado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancelar
              </button>
              <button 
                onClick={handleApplyUpdates}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
              >
                Confirmar Atualização <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}