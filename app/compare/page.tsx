'use client';

import React, { useState } from 'react';
import { useSupplierContext } from '@/app/context/SupplierContext';
import { ComparisonView } from '@/components/ComparisonView';
import { ArrowLeft, Plus, X, BarChart2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ComparePage() {
  const { meshes, suppliers } = useSupplierContext();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectorValue, setSelectorValue] = useState('');
  
  // Novo estado para o critério de comparação
  const [criteria, setCriteria] = useState<'costBenefit' | 'pricePerKg' | 'yield' | 'width'>('costBenefit');

  const handleAdd = (id: string) => {
    if (id && !selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
      setSelectorValue('');
    }
  };

  const handleRemove = (id: string) => {
    setSelectedIds(selectedIds.filter(itemId => itemId !== id));
  };

  const selectedMeshes = meshes.filter(m => selectedIds.includes(m.id));
  const availableMeshes = meshes.filter(m => !selectedIds.includes(m.id));

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabeçalho */}
        <div className="flex items-center gap-6 mb-8">
          <Link href="/" className="p-3 bg-white rounded-full shadow-sm border border-gray-100 hover:border-[#72BF03] transition-all group">
            <ArrowLeft size={20} className="text-[#545454] group-hover:text-[#72BF03]" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-black font-heading tracking-tight">Comparador</h1>
            <p className="text-[#545454] opacity-60 font-medium text-sm">Analise custos e benefícios lado a lado</p>
          </div>
        </div>

        {/* Controles: Seleção de Produto + Critério */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 space-y-6">
          
          {/* Linha 1: Critério de Comparação */}
          <div>
             <label className="block text-xs font-bold text-[#545454] uppercase tracking-widest mb-3 flex items-center gap-2">
               <BarChart2 size={16} className="text-[#72BF03]" /> Critério de Vencedor
             </label>
             <div className="flex flex-wrap gap-2">
               <button 
                  onClick={() => setCriteria('costBenefit')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${criteria === 'costBenefit' ? 'bg-[#72BF03] text-white border-[#72BF03] shadow-md shadow-green-100' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
               >
                  {criteria === 'costBenefit' && <CheckCircle2 size={14}/>} 💰 Custo/Benefício (R$/m)
               </button>
               <button 
                  onClick={() => setCriteria('pricePerKg')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${criteria === 'pricePerKg' ? 'bg-[#72BF03] text-white border-[#72BF03] shadow-md shadow-green-100' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
               >
                  {criteria === 'pricePerKg' && <CheckCircle2 size={14}/>} ⚖️ Menor Preço (R$/kg)
               </button>
               <button 
                  onClick={() => setCriteria('yield')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${criteria === 'yield' ? 'bg-[#72BF03] text-white border-[#72BF03] shadow-md shadow-green-100' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
               >
                  {criteria === 'yield' && <CheckCircle2 size={14}/>} 📏 Maior Rendimento
               </button>
               <button 
                  onClick={() => setCriteria('width')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${criteria === 'width' ? 'bg-[#72BF03] text-white border-[#72BF03] shadow-md shadow-green-100' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
               >
                  {criteria === 'width' && <CheckCircle2 size={14}/>} ↔️ Maior Largura
               </button>
             </div>
          </div>

          <div className="h-px bg-gray-100 w-full"></div>

          {/* Linha 2: Adicionar Produtos (AJUSTE NO SELECT) */}
          <div>
            <label className="block text-xs font-bold text-[#545454] uppercase tracking-widest mb-3">
              Adicionar Produto à Tabela
            </label>
            <div className="flex flex-col md:flex-row gap-4">
              <select 
                className="flex-1 bg-white border border-gray-200 text-[#545454] text-sm rounded-xl focus:ring-2 focus:ring-[#72BF03] focus:border-transparent block w-full p-3.5 outline-none transition-all cursor-pointer hover:border-gray-300"
                value={selectorValue}
                onChange={(e) => setSelectorValue(e.target.value)}
                style={{ appearance: 'auto', backgroundImage: 'none' }} // Remove estilo padrão em alguns browsers para evitar cortes
              >
                <option value="">Selecione um produto para comparar...</option>
                {availableMeshes.map(mesh => {
                  const supplier = suppliers.find(s => s.id === mesh.supplierId);
                  return (
                    <option key={mesh.id} value={mesh.id}>
                      {supplier?.name} | {mesh.name} ({mesh.code})
                    </option>
                  );
                })}
              </select>
              <button 
                onClick={() => handleAdd(selectorValue)}
                disabled={!selectorValue}
                className="bg-black hover:bg-[#333] text-white font-bold py-3.5 px-8 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                <Plus size={20} /> Adicionar
              </button>
            </div>
          </div>

          {/* Tags dos Selecionados */}
          {selectedMeshes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
              {selectedMeshes.map(mesh => (
                <span key={mesh.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#72BF03]/10 text-[#72BF03] border border-[#72BF03]/20 transition-all hover:bg-[#72BF03]/20">
                  {mesh.name}
                  <button onClick={() => handleRemove(mesh.id)} className="hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-white/50">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tabela de Comparação */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <ComparisonView meshes={selectedMeshes} criteria={criteria} />
        </div>

      </div>
    </div>
  );
}