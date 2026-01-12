'use client';

import React, { useState } from 'react';
import { useSupplierContext } from '@/app/context/SupplierContext';
import { ComparisonView } from '@/components/ComparisonView';
import { ArrowLeft, Plus, X, BarChart2, CheckCircle2, Filter } from 'lucide-react';
import Link from 'next/link';
import { PRODUCT_CATEGORIES } from '@/lib/constants'; // Lista fixa de categorias

export default function ComparePage() {
  const { meshes, suppliers } = useSupplierContext();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Filtros
  const [filterCategory, setFilterCategory] = useState('');
  const [selectorValue, setSelectorValue] = useState('');
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

  // Lógica de Filtragem:
  // 1. Pega os produtos selecionados (para mostrar na tabela)
  const selectedMeshes = meshes.filter(m => selectedIds.includes(m.id));
  
  // 2. Define o que aparece no dropdown (Disponíveis - Selecionados) E (Filtro de Categoria)
  const availableMeshes = meshes.filter(m => 
    !selectedIds.includes(m.id) && 
    (filterCategory === '' || m.category === filterCategory) // Filtro aplicado aqui
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 font-sans">
      <div className="max-w-[95%] mx-auto"> {/* Tela mais larga para caber mais colunas */}
        
        {/* Cabeçalho */}
        <div className="flex items-center gap-6 mb-6">
          <Link href="/" className="p-2 bg-white rounded-full shadow-sm border border-gray-100 hover:border-[#72BF03] transition-all group">
            <ArrowLeft size={20} className="text-[#545454] group-hover:text-[#72BF03]" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-black font-heading tracking-tight">Comparador Inteligente</h1>
          </div>
        </div>

        {/* Controles de Seleção */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 space-y-5">
          
          {/* CRITÉRIO */}
          <div>
             <label className="block text-[10px] font-bold text-[#545454] uppercase tracking-widest mb-2 flex items-center gap-2">
               <BarChart2 size={14} className="text-[#72BF03]" /> Critério de Vitória
             </label>
             <div className="flex flex-wrap gap-2">
               <button onClick={() => setCriteria('costBenefit')} className={`px-3 py-2 rounded-lg text-[11px] font-bold border transition-all ${criteria === 'costBenefit' ? 'bg-[#72BF03] text-white border-[#72BF03]' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                  💰 Custo/Benefício (R$/m)
               </button>
               <button onClick={() => setCriteria('pricePerKg')} className={`px-3 py-2 rounded-lg text-[11px] font-bold border transition-all ${criteria === 'pricePerKg' ? 'bg-[#72BF03] text-white border-[#72BF03]' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                  ⚖️ Menor Preço (R$/kg)
               </button>
               <button onClick={() => setCriteria('yield')} className={`px-3 py-2 rounded-lg text-[11px] font-bold border transition-all ${criteria === 'yield' ? 'bg-[#72BF03] text-white border-[#72BF03]' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                  📏 Maior Rendimento
               </button>
             </div>
          </div>

          <div className="h-px bg-gray-100 w-full"></div>

          {/* ADICIONAR PRODUTOS (COM FILTRO DE CATEGORIA) */}
          <div>
            <label className="block text-[10px] font-bold text-[#545454] uppercase tracking-widest mb-2">
              Selecione os Produtos
            </label>
            <div className="flex flex-col md:flex-row gap-3">
              
              {/* Filtro de Categoria (Passo 1) */}
              <div className="md:w-1/4 relative">
                <Filter size={16} className="absolute left-3 top-3 text-gray-400" />
                <select 
                    className="w-full bg-gray-50 border border-gray-200 text-black text-sm rounded-xl pl-9 p-2.5 outline-none focus:border-[#72BF03]"
                    value={filterCategory}
                    onChange={(e) => { setFilterCategory(e.target.value); setSelectorValue(''); }}
                >
                    <option value="">Todas as Categorias</option>
                    {PRODUCT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              {/* Seletor de Malha (Passo 2) */}
              <select 
                className="flex-1 bg-white border border-gray-300 text-black text-sm rounded-xl p-2.5 outline-none focus:border-[#72BF03]"
                value={selectorValue}
                onChange={(e) => setSelectorValue(e.target.value)}
                disabled={availableMeshes.length === 0}
              >
                <option value="">
                    {filterCategory ? `Escolha um(a) ${filterCategory}...` : 'Selecione um produto...'}
                </option>
                {availableMeshes.map(mesh => {
                  const supplier = suppliers.find(s => s.id === mesh.supplierId);
                  return (
                    <option key={mesh.id} value={mesh.id}>
                      {supplier?.shortName} | {mesh.name} ({mesh.code})
                    </option>
                  );
                })}
              </select>
              
              <button 
                onClick={() => handleAdd(selectorValue)}
                disabled={!selectorValue}
                className="bg-black hover:bg-[#333] text-white font-bold py-2 px-6 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
              >
                <Plus size={16} /> Adicionar
              </button>
            </div>
            
            {/* Aviso se não houver produtos na categoria */}
            {filterCategory && availableMeshes.length === 0 && (
                <p className="text-[10px] text-red-500 mt-2 ml-1">
                    Nenhum produto disponível nesta categoria para adicionar.
                </p>
            )}
          </div>

          {/* Tags dos Selecionados */}
          {selectedMeshes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedMeshes.map(mesh => (
                <span key={mesh.id} className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-bold bg-[#72BF03]/10 text-[#72BF03] border border-[#72BF03]/20">
                  {mesh.name}
                  <button onClick={() => handleRemove(mesh.id)} className="hover:text-red-600"><X size={12} /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <ComparisonView meshes={selectedMeshes} criteria={criteria} />
        </div>
      </div>
    </div>
  );
}