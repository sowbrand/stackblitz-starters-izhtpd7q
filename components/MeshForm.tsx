'use client';

import React, { useState, useEffect } from 'react';
import { Upload, FileText, Loader2, AlertCircle, Key } from 'lucide-react';
import { extractDataFromFile } from '@/services/geminiService';

interface MeshFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any | null;
  suppliers?: any[];
  preselectedSupplierId?: string;
}

export function MeshForm({ onSubmit, onCancel, initialData, suppliers = [], preselectedSupplierId }: MeshFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualKey, setManualKey] = useState('');

  const [formData, setFormData] = useState({
    name: '', code: '', price: 0, width: 0, grammage: 0, yield: 0, composition: '', type: 'Malha', color: '',
    supplierId: preselectedSupplierId || ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        code: initialData.code || '',
        price: Number(initialData.price || 0),
        width: Number(initialData.width || 0),
        grammage: Number(initialData.grammage || 0),
        yield: Number(initialData.yield || 0),
        composition: initialData.composition || '',
        type: initialData.type || 'Malha',
        color: initialData.color || '',
        supplierId: initialData.supplierId || preselectedSupplierId || ''
      });
    }
  }, [initialData, preselectedSupplierId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleProcessAI = async () => {
    if (!file) return;
    if (!manualKey) {
      setError("Por favor, informe a Chave de API no campo amarelo.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data: any = await extractDataFromFile(file, manualKey);
      setFormData(prev => ({
        ...prev,
        name: data.name || prev.name,
        code: data.code || prev.code,
        price: data.price || prev.price,
        width: data.width || prev.width,
        grammage: data.grammage || prev.grammage,
        yield: data.yield || prev.yield,
        composition: data.composition || prev.composition
      }));
    } catch (err: any) {
      setError(err.message || 'Erro na leitura da imagem.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-gray-900">{initialData ? 'Editar Malha' : 'Nova Malha / Tecido'}</h2>
      
      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mb-6">
        <label className="block text-xs font-bold text-yellow-800 mb-1 flex items-center gap-1"><Key size={14} /> Chave API Google:</label>
        <input type="text" value={manualKey} onChange={(e) => setManualKey(e.target.value)} placeholder="AIzaSy..." className="w-full p-2 border border-yellow-300 rounded bg-white text-xs" />
      </div>

      <div className="mb-6 border-b border-gray-100 pb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Preenchimento Automático com IA</label>
        <div className="flex gap-2">
           <input type="file" id="mesh" className="hidden" accept="image/*" onChange={handleFileChange} />
           <label htmlFor="mesh" className="flex-1 cursor-pointer border border-gray-300 rounded-md p-2 text-center text-sm hover:bg-gray-50 flex items-center justify-center gap-2">
              <Upload size={16} /> {file ? file.name : "Selecionar Imagem"}
           </label>
           <button type="button" onClick={handleProcessAI} disabled={!file || loading} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
             {loading ? <Loader2 className="animate-spin" size={16} /> : 'Ler Imagem'}
           </button>
        </div>
        {error && <p className="text-red-600 text-xs mt-2 flex items-center gap-1"><AlertCircle size={12}/> {error}</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {suppliers.length > 0 && !preselectedSupplierId && (
           <div>
            <label className="block text-sm text-gray-700">Fornecedor</label>
            <select className="w-full border rounded p-2 text-sm" value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} required>
              <option value="">Selecione...</option>
              {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
           </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm text-gray-700">Código</label><input className="w-full border rounded p-2 text-sm" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required /></div>
          <div><label className="block text-sm text-gray-700">Nome</label><input className="w-full border rounded p-2 text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-sm text-gray-700">Preço (R$)</label><input type="number" step="0.01" className="w-full border rounded p-2 text-sm" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} /></div>
          <div><label className="block text-sm text-gray-700">Largura (cm)</label><input type="number" className="w-full border rounded p-2 text-sm" value={formData.width} onChange={e => setFormData({...formData, width: Number(e.target.value)})} /></div>
          <div><label className="block text-sm text-gray-700">Gramatura</label><input type="number" className="w-full border rounded p-2 text-sm" value={formData.grammage} onChange={e => setFormData({...formData, grammage: Number(e.target.value)})} /></div>
        </div>
        <div><label className="block text-sm text-gray-700">Composição</label><input className="w-full border rounded p-2 text-sm" value={formData.composition} onChange={e => setFormData({...formData, composition: e.target.value})} /></div>
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-4">
          <button type="button" onClick={onCancel} className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50 text-sm font-medium">Cancelar</button>
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium">Salvar</button>
        </div>
      </form>
    </div>
  );
}