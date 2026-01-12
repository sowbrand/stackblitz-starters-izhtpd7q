'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, Layers, DollarSign, FileText } from 'lucide-react';
import { Mesh, PriceVariation, Supplier } from '@/types';

interface MeshFormData {
  id?: string;
  supplierId: string;
  code: string;
  name: string;
  composition: string;
  width: number;
  grammage: number;
  yield: number;
  ncm: string;
  complement: string;
  variations: PriceVariation[];
}

interface MeshFormProps {
  onSubmit: (data: Mesh) => void;
  onCancel: () => void;
  initialData?: Mesh | null;
  suppliers?: Supplier[];
  preselectedSupplierId?: string;
}

export function MeshForm({ onSubmit, onCancel, initialData, suppliers = [], preselectedSupplierId }: MeshFormProps) {
  const [formData, setFormData] = useState<MeshFormData>({
    supplierId: preselectedSupplierId || '',
    code: '',
    name: '',
    composition: '',
    width: 0,
    grammage: 0,
    yield: 0,
    ncm: '',
    complement: '',
    variations: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        supplierId: initialData.supplierId || preselectedSupplierId || '',
        code: initialData.code || '',
        name: initialData.name || '',
        composition: initialData.composition || '',
        width: Number(initialData.width || 0),
        grammage: Number(initialData.grammage || 0),
        yield: Number(initialData.yield || 0),
        ncm: initialData.ncm || '',
        complement: initialData.complement || '',
        variations: (initialData.variations && initialData.variations.length > 0) 
          ? initialData.variations 
          : [{ id: '1', name: 'Única', priceCash: Number(initialData.price || 0), priceFactored: 0 }]
      });
    } else {
        addVariation();
    }
  }, [initialData, preselectedSupplierId]);

  const addVariation = () => {
    setFormData(prev => ({
      ...prev,
      variations: [
        ...prev.variations,
        { id: Math.random().toString(36).substr(2, 9), name: '', priceCash: 0, priceFactored: 0 }
      ]
    }));
  };

  const removeVariation = (id: string) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.filter(v => v.id !== id)
    }));
  };

  const updateVariation = (id: string, field: keyof PriceVariation, value: any) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.map(v => 
        v.id === id ? { ...v, [field]: value } : v
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.variations.length === 0) {
        alert("Adicione pelo menos uma variação de preço/cor.");
        return;
    }
    const basePrice = Math.min(...formData.variations.map(v => v.priceCash || 0));
    const finalData: Mesh = {
        id: formData.id || Math.random().toString(36).substr(2, 9),
        supplierId: formData.supplierId,
        code: formData.code,
        name: formData.name,
        composition: formData.composition,
        width: formData.width,
        grammage: formData.grammage,
        yield: formData.yield,
        ncm: formData.ncm,
        complement: formData.complement,
        variations: formData.variations,
        price: basePrice,
        type: 'Malha',
        imageUrl: ''
    };
    onSubmit(finalData);
  };

  // Classe utilitária para inputs
  const inputClass = "w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-sow-green focus:border-sow-green outline-none transition-all text-sow-black placeholder-gray-400";
  const labelClass = "block text-xs font-bold text-sow-dark mb-1.5 uppercase tracking-wide";

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-bold text-sow-black font-heading flex items-center gap-3">
          <div className="p-2 bg-sow-black rounded-lg text-white">
            <Layers size={20} />
          </div>
          {initialData ? 'Editar Produto' : 'Novo Cadastro'}
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-sow-black transition-colors">
            <X size={28} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* BLOCO 1 */}
        <div>
            <h3 className="text-sm font-bold text-sow-green mb-4 uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 pb-2">
                <FileText size={16}/> Informações Gerais
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {suppliers.length > 0 && !preselectedSupplierId && (
                <div className="md:col-span-4">
                    <label className={labelClass}>Fornecedor</label>
                    <select
                        className={inputClass}
                        value={formData.supplierId}
                        onChange={e => setFormData({...formData, supplierId: e.target.value})}
                        required
                    >
                        <option value="">Selecione...</option>
                        {suppliers.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
                )}
                
                <div className="md:col-span-3">
                    <label className={labelClass}>Código / Ref *</label>
                    <input 
                        className={`${inputClass} font-mono bg-gray-50`}
                        value={formData.code} 
                        onChange={e => setFormData({...formData, code: e.target.value})}
                        placeholder="Ex: 76040"
                        required
                    />
                </div>
                
                <div className="md:col-span-9">
                    <label className={labelClass}>Nome do Artigo *</label>
                    <input 
                        className={`${inputClass} uppercase`}
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="Ex: SUEDINE 100% ALGODÃO"
                        required
                    />
                </div>

                <div className="md:col-span-3">
                    <label className={labelClass}>Largura (m)</label>
                    <input type="number" step="0.01" className={inputClass} value={formData.width || ''} onChange={e => setFormData({...formData, width: Number(e.target.value)})} placeholder="1.85"/>
                </div>
                <div className="md:col-span-3">
                    <label className={labelClass}>Gramatura (g/m²)</label>
                    <input type="number" className={inputClass} value={formData.grammage || ''} onChange={e => setFormData({...formData, grammage: Number(e.target.value)})} placeholder="210"/>
                </div>
                <div className="md:col-span-3">
                    <label className={labelClass}>Rendimento (m/kg)</label>
                    <input type="number" step="0.01" className={inputClass} value={formData.yield || ''} onChange={e => setFormData({...formData, yield: Number(e.target.value)})} placeholder="2.57"/>
                </div>
                <div className="md:col-span-3">
                    <label className={labelClass}>NCM</label>
                    <input className={inputClass} value={formData.ncm} onChange={e => setFormData({...formData, ncm: e.target.value})} placeholder="6006.21.00"/>
                </div>

                <div className="md:col-span-6">
                    <label className={labelClass}>Composição</label>
                    <input className={`${inputClass} uppercase`} value={formData.composition} onChange={e => setFormData({...formData, composition: e.target.value})} placeholder="Ex: 100% ALGODÃO"/>
                </div>
                <div className="md:col-span-6">
                    <label className={labelClass}>Complemento (Gola/Obs)</label>
                    <input className={inputClass} value={formData.complement} onChange={e => setFormData({...formData, complement: e.target.value})} placeholder="Ex: Usar com Ribana ref 050101"/>
                </div>
            </div>
        </div>

        {/* BLOCO 2: TABELA DE PREÇOS */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-sow-green uppercase tracking-widest flex items-center gap-2">
                    <DollarSign size={16}/> Tabela de Variações
                </h3>
                <button type="button" onClick={addVariation} className="text-xs bg-sow-black text-white px-4 py-2 rounded-lg hover:bg-sow-dark flex items-center gap-2 font-bold transition-all">
                    <Plus size={16}/> NOVA COR
                </button>
            </div>
            
            <div className="space-y-3">
                {formData.variations.map((v) => (
                    <div key={v.id} className="flex flex-wrap md:flex-nowrap gap-3 items-end bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-sow-green transition-colors">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Cor / Variação</label>
                            <input 
                                className="w-full border-b-2 border-gray-200 p-2 text-sm font-bold text-sow-black uppercase focus:border-sow-green outline-none bg-transparent"
                                value={v.name}
                                onChange={e => updateVariation(v.id, 'name', e.target.value)}
                                placeholder="Ex: BRANCO"
                            />
                        </div>
                        <div className="w-full md:w-40">
                            <label className="block text-[10px] uppercase font-bold text-sow-green mb-1">À VISTA (R$)</label>
                            <input 
                                type="number" step="0.01"
                                className="w-full border border-gray-200 rounded-lg p-2 text-sm font-bold text-sow-green bg-green-50/50 focus:ring-1 focus:ring-sow-green outline-none"
                                value={v.priceCash || ''}
                                onChange={e => updateVariation(v.id, 'priceCash', Number(e.target.value))}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="w-full md:w-40">
                            <label className="block text-[10px] uppercase font-bold text-sow-dark mb-1">FATURADO (R$)</label>
                            <input 
                                type="number" step="0.01"
                                className="w-full border border-gray-200 rounded-lg p-2 text-sm font-bold text-sow-dark bg-gray-50 focus:ring-1 focus:ring-gray-400 outline-none"
                                value={v.priceFactored || ''}
                                onChange={e => updateVariation(v.id, 'priceFactored', Number(e.target.value))}
                                placeholder="0.00"
                            />
                        </div>
                        <button 
                            type="button" 
                            onClick={() => removeVariation(v.id)}
                            className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>

        {/* RODAPÉ */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
          <button type="button" onClick={onCancel} className="px-6 py-3 border border-gray-300 rounded-xl text-sow-dark hover:bg-gray-50 font-bold tracking-wide transition-colors">
            CANCELAR
          </button>
          <button type="submit" className="px-8 py-3 bg-sow-green text-white rounded-xl hover:bg-sow-green-hover font-bold tracking-wide shadow-lg shadow-green-100 flex items-center gap-2 transition-all transform hover:-translate-y-0.5">
            <Save size={18} /> SALVAR PRODUTO
          </button>
        </div>
      </form>
    </div>
  );
}