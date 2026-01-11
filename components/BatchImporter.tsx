'use client';

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X, Key, Plus } from 'lucide-react';
import { extractBatchDataFromFiles } from '@/services/geminiService';

// Ajustamos a interface para aceitar o que a página pai (page.tsx) envia
interface Props {
  supplier: any;          // Recebe o fornecedor atual
  existingMeshes?: any[]; // Recebe malhas existentes (opcional)
  onCancel: () => void;   // A página usa 'onCancel' em vez de 'onClose'
  onImport: (data: any[]) => void;
}

export function BatchImporter({ supplier, onCancel, onImport }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualKey, setManualKey] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
      setError(null);
      setExtractedData(null);
    }
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    if (!manualKey) {
      setError("Por favor, cole sua Chave de API no campo amarelo.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await extractBatchDataFromFiles(files, manualKey);
      
      if (data.length === 0) {
        throw new Error("Nenhum dado foi extraído.");
      }

      setExtractedData(data);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao processar lote.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (extractedData) {
      // Formata os dados antes de devolver para a página pai
      // Adicionando o ID do fornecedor corretamente
      const formattedData = extractedData.map(item => ({
        ...item,
        supplierId: supplier?.id, // Vincula ao fornecedor atual
        // Garante campos numéricos
        price: Number(item.price || 0),
        width: Number(item.width || 0),
        grammage: Number(item.grammage || 0),
        yield: Number(item.yield || 0),
        type: 'Malha'
      }));

      onImport(formattedData);
      onCancel(); // Fecha o modal
    }
  };

  return (
    <div className="bg-white p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="text-blue-600" />
          Importação em Lote ({supplier?.name || 'Fornecedor'})
        </h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto">
        
        {/* CAMPO DE CHAVE MANUAL */}
        {!extractedData && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <label className="block text-sm font-bold text-yellow-800 mb-2 flex items-center gap-2">
              <Key size={16} /> Chave API do Google (AI Studio):
            </label>
            <input 
              type="text" 
              value={manualKey}
              onChange={(e) => setManualKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full p-2 border border-yellow-300 rounded bg-white text-gray-800 text-sm focus:ring-2 focus:ring-yellow-500 outline-none"
            />
          </div>
        )}

        {!extractedData && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50">
            <input 
              type="file" 
              id="batch-upload" 
              className="hidden" 
              accept="image/*" 
              multiple 
              onChange={handleFileChange} 
            />
            <label htmlFor="batch-upload" className="cursor-pointer flex flex-col items-center">
              <Upload className="h-10 w-10 text-gray-400 mb-3" />
              <span className="text-sm font-medium text-gray-700">
                {files.length > 0 ? `${files.length} arquivos selecionados` : 'Selecionar Múltiplas Imagens'}
              </span>
            </label>
          </div>
        )}

        {files.length > 0 && !extractedData && (
          <button
            onClick={handleProcess}
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="animate-spin" size={18} /> Processando {files.length} imagens...</> : 'Iniciar Processamento'}
          </button>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {extractedData && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 text-green-700 font-medium mb-4">
              <CheckCircle size={16} /> {extractedData.length} Processados com Sucesso
            </div>
            
            <div className="bg-white border rounded-lg max-h-80 overflow-y-auto mb-4">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="p-3">Img</th>
                    <th className="p-3">Nome</th>
                    <th className="p-3">Código</th>
                    <th className="p-3 text-right">Preço</th>
                  </tr>
                </thead>
                <tbody>
                  {extractedData.map((item: any, i: number) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-gray-500 text-xs truncate max-w-[100px]">{item.originalFile}</td>
                      <td className="p-3 font-medium">{item.name || '---'}</td>
                      <td className="p-3">{item.code || '---'}</td>
                      <td className="p-3 text-right text-green-600 font-bold">
                        R$ {Number(item.price || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={onCancel} className="px-4 py-2 bg-gray-100 rounded text-gray-700">Cancelar</button>
              <button onClick={handleConfirmImport} className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2">
                <Plus size={16} /> Adicionar ao Sistema
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}