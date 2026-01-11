'use client';

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X, Key, ArrowRight, RefreshCw } from 'lucide-react';
import { extractPriceUpdateData } from '@/services/geminiService';

interface Props {
  supplier: any;
  allMeshes: any[];
  setMeshes: (meshes: any[]) => void;
  onClose: () => void;
}

export function PriceUpdateImporter({ supplier, allMeshes, setMeshes, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualKey, setManualKey] = useState('');
  const [updatedCount, setUpdatedCount] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setExtractedData(null);
      setUpdatedCount(0);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    if (!manualKey) {
      setError("Por favor, informe a Chave de API no campo amarelo.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await extractPriceUpdateData(file, manualKey);
      
      if (!data || !data.items) {
        throw new Error("A IA não retornou dados válidos.");
      }
      
      const items = Array.isArray(data.items) ? data.items : [];
      const date = data.effectiveDate || new Date().toISOString().split('T')[0];

      // Conta quantos produtos serão afetados
      let matches = 0;
      const sysCodes = new Set(allMeshes.map(m => String(m.code).trim().toUpperCase()));
      
      items.forEach((item: any) => {
        if (sysCodes.has(String(item.code).trim().toUpperCase())) {
          matches++;
        }
      });

      setUpdatedCount(matches);
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

  const handleConfirm = () => {
    if (!extractedData || !extractedData.items) return;

    const priceMap = new Map();
    extractedData.items.forEach((item: any) => {
        if (item.code && item.newPrice) {
            priceMap.set(String(item.code).trim().toUpperCase(), Number(item.newPrice));
        }
    });

    const updatedMeshes = allMeshes.map(mesh => {
        const meshCode = String(mesh.code).trim().toUpperCase();
        if (mesh.supplierId === supplier.id && priceMap.has(meshCode)) {
            return { ...mesh, price: priceMap.get(meshCode) };
        }
        return mesh;
    });

    setMeshes(updatedMeshes);
    onClose();
  };

  return (
    <div className="bg-white p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <RefreshCw className="text-blue-600" />
          Atualizar Preços
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto">
        
        {!extractedData && (
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <label className="block text-xs font-bold text-yellow-800 mb-1 flex items-center gap-1">
              <Key size={14} /> Chave API Google:
            </label>
            <input 
              type="text" 
              value={manualKey}
              onChange={(e) => setManualKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full p-2 border border-yellow-300 rounded bg-white text-xs text-gray-800 outline-none"
            />
          </div>
        )}

        {!extractedData && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50">
            <input type="file" id="price-update-upload" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
            <label htmlFor="price-update-upload" className="cursor-pointer flex flex-col items-center">
              <Upload className="h-10 w-10 text-gray-400 mb-3" />
              <span className="text-sm font-medium text-gray-700">
                {file ? file.name : 'Selecionar Imagem do Comunicado'}
              </span>
            </label>
          </div>
        )}

        {file && !extractedData && (
          <button
            onClick={handleProcess}
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="animate-spin" size={18} /> Lendo Comunicado...</> : 'Ler e Simular'}
          </button>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {extractedData && (
          <div className="border-t pt-4">
            <div className={`mb-4 p-3 rounded-lg text-sm ${updatedCount > 0 ? 'bg-green-50 text-green-800' : 'bg-orange-50 text-orange-800'}`}>
              <p><strong>Data de Vigência:</strong> {extractedData.effectiveDate}</p>
              <p className="mt-1 flex items-center gap-2">
                 <CheckCircle size={16}/> 
                 Encontrados {extractedData.items.length} itens.
              </p>
              <p className="mt-1 font-bold">
                 {updatedCount} produtos serão atualizados.
              </p>
            </div>

            <div className="bg-white border rounded-lg max-h-64 overflow-y-auto mb-4">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="p-2">Código</th>
                    <th className="p-2 text-right">Novo Preço</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {extractedData.items.map((item: any, i: number) => {
                    const isMatch = allMeshes.some(m => String(m.code).trim().toUpperCase() === String(item.code).trim().toUpperCase() && m.supplierId === supplier.id);
                    return (
                        <tr key={i} className={`border-b ${isMatch ? 'bg-green-50' : 'opacity-50'}`}>
                        <td className="p-2 font-medium">{item.code}</td>
                        <td className="p-2 text-right font-bold text-green-600">
                            R$ {Number(item.newPrice || 0).toFixed(2)}
                        </td>
                        <td className="p-2 text-center text-xs">
                            {isMatch ? 'Atualiza' : 'Não encontrado'}
                        </td>
                        </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded text-gray-700 text-sm">Cancelar</button>
              <button 
                onClick={handleConfirm} 
                disabled={updatedCount === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm flex items-center gap-2 disabled:opacity-50"
              >
                <ArrowRight size={16} /> Confirmar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}