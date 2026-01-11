'use client';

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X, Key, Plus } from 'lucide-react';
import { extractBatchDataFromFiles } from '@/services/geminiService';

interface Props {
  supplier: any;
  existingMeshes?: any[]; // Compatibilidade
  onCancel: () => void;
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
      if (data.length === 0) throw new Error("Nenhum dado foi extraído.");
      setExtractedData(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao processar lote.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (extractedData) {
      const formattedData = extractedData.map(item => ({
        ...item,
        supplierId: supplier?.id,
        price: Number(item.price || 0),
        width: Number(item.width || 0),
        grammage: Number(item.grammage || 0),
        yield: Number(item.yield || 0),
        type: 'Malha'
      }));
      onImport(formattedData);
      onCancel();
    }
  };

  return (
    <div className="bg-white p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="text-blue-600" /> Importação em Lote
        </h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
      </div>
      <div className="space-y-4 flex-1 overflow-y-auto">
        {!extractedData && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <label className="block text-sm font-bold text-yellow-800 mb-2 flex items-center gap-2">
              <Key size={16} /> Chave API Google:
            </label>
            <input type="text" value={manualKey} onChange={(e) => setManualKey(e.target.value)} placeholder="AIzaSy..." className="w-full p-2 border border-yellow-300 rounded bg-white text-gray-800 text-sm outline-none" />
          </div>
        )}
        {!extractedData && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50">
            <input type="file" id="batch" className="hidden" accept="image/*" multiple onChange={handleFileChange} />
            <label htmlFor="batch" className="cursor-pointer flex flex-col items-center">
              <Upload className="h-10 w-10 text-gray-400 mb-3" />
              <span className="text-sm font-medium text-gray-700">{files.length > 0 ? `${files.length} arquivos` : 'Selecionar Múltiplas'}</span>
            </label>
          </div>
        )}
        {files.length > 0 && !extractedData && (
          <button onClick={handleProcess} disabled={loading} className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Iniciar'}
          </button>
        )}
        {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}
        {extractedData && (
          <div className="border-t pt-4">
            <div className="bg-white border rounded-lg max-h-80 overflow-y-auto mb-4">
              <table className="w-full text-sm text-left">
                <tbody>
                  {extractedData.map((item: any, i: number) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-xs text-gray-500">{item.originalFile}</td>
                      <td className="p-3 font-medium">{item.name || '---'}</td>
                      <td className="p-3">{item.code || '---'}</td>
                      <td className="p-3 text-right text-green-600 font-bold">R$ {Number(item.price || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={onCancel} className="px-4 py-2 bg-gray-100 rounded text-gray-700">Cancelar</button>
              <button onClick={handleConfirmImport} className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2"><Plus size={16} /> Adicionar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}