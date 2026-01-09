'use client';

import React, { useState } from 'react';
import { Supplier, Mesh } from '@/types';
import { extractPriceListData } from '@/services/geminiService';
import { Upload, X, CheckCircle, Loader2, FileText } from 'lucide-react';

interface PriceListImporterProps {
  supplier: Supplier;
  onImport: (meshes: Mesh[]) => void;
  onCancel: () => void;
  existingMeshes: Mesh[];
}

export const PriceListImporter: React.FC<PriceListImporterProps> = ({ supplier, onImport, onCancel, existingMeshes }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setError(null);
      setExtractedData(null);
      try {
        const data = await extractPriceListData(file);
        setExtractedData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleConfirmImport = () => {
    if (!extractedData || !extractedData.products) return;

    const newMeshes: Mesh[] = extractedData.products.map((product: any) => {
      // Verifica se já existe pelo código para manter dados antigos se necessário
      // mas neste caso estamos criando novos ou atualizando totalmente
      const prices: Record<string, number> = {};
      product.price_list.forEach((p: any) => {
          prices[p.category_normalized || p.original_category_name] = p.price_cash_kg;
      });

      return {
        id: Date.now().toString() + Math.random().toString(),
        supplierId: supplier.id,
        code: product.product_code,
        name: product.product_name,
        composition: product.composition,
        width: product.specs.width_m ? product.specs.width_m * 100 : 0,
        grammage: product.specs.grammage_gsm || 0,
        yield: 0, // Tabela simples muitas vezes não tem rendimento
        prices: prices,
        complement: ''
      };
    });

    onImport(newMeshes);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="text-blue-600" />
          Importar Tabela Simples: <span className="text-blue-600">{supplier.name}</span>
        </h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
      </div>

      {!extractedData ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50">
           {isLoading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Analisando tabela...</p>
            </div>
          ) : (
            <>
                <p className="text-gray-600 mb-6">Envie uma tabela de preços simples (PDF ou Imagem) para extração.</p>
                {error && <div className="mb-4 text-red-500 bg-red-100 p-2 rounded">{error}</div>}
                
                <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors inline-flex items-center gap-2">
                    <Upload size={20} />
                    Selecionar Arquivo
                    <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
                </label>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded border border-green-200">
                <h3 className="font-bold text-green-800 flex items-center mb-2">
                    <CheckCircle size={20} className="mr-2"/> Sucesso!
                </h3>
                <p className="text-green-700">
                    Foram identificados <strong>{extractedData.products.length}</strong> produtos na tabela do fornecedor <strong>{extractedData.supplier_name}</strong>.
                </p>
            </div>
            
            <div className="flex justify-end gap-3">
                <button onClick={() => setExtractedData(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Voltar</button>
                <button onClick={handleConfirmImport} className="px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700">
                    Confirmar Importação
                </button>
            </div>
        </div>
      )}
    </div>
  );
};