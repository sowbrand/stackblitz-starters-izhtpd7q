'use client';

import React, { useState } from 'react';
import { useSupplierContext } from '@/app/context/SupplierContext';
import { ComparisonView } from '@/components/ComparisonView';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';

export default function ComparePage() {
  const { meshes, suppliers } = useSupplierContext();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectorValue, setSelectorValue] = useState('');

  // Adicionar produto à comparação
  const handleAdd = (id: string) => {
    if (id && !selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
      setSelectorValue(''); // Limpa o seletor
    }
  };

  // Remover produto da comparação
  const handleRemove = (id: string) => {
    setSelectedIds(selectedIds.filter(itemId => itemId !== id));
  };

  // Filtra os objetos completos baseados nos IDs selecionados
  const selectedMeshes = meshes.filter(m => selectedIds.includes(m.id));

  // Produtos disponíveis para selecionar (que ainda não estão na lista)
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

        {/* Área de Seleção */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <label className="block text-xs font-bold text-[#545454] uppercase tracking-widest mb-3">
            Adicionar Produto à Tabela
          </label>
          <div className="flex gap-4">
            <select 
              className="flex-1 bg-gray-50 border border-gray-200 text-[#545454] text-sm rounded-xl focus:ring-[#72BF03] focus:border-[#72BF03] block w-full p-3 outline-none transition-all"
              value={selectorValue}
              onChange={(e) => setSelectorValue(e.target.value)}
            >
              <option value="">Selecione um produto...</option>
              {availableMeshes.map(mesh => {
                const supplier = suppliers.find(s => s.id === mesh.supplierId);
                return (
                  <option key={mesh.id} value={mesh.id}>
                    {mesh.name} ({supplier?.name}) - {mesh.code}
                  </option>
                );
              })}
            </select>
            <button 
              onClick={() => handleAdd(selectorValue)}
              disabled={!selectorValue}
              className="bg-[#72BF03] hover:bg-[#5da102] text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-100"
            >
              <Plus size={20} /> Adicionar
            </button>
          </div>

          {/* Tags dos Selecionados */}
          <div className="flex flex-wrap gap-2 mt-4">
            {selectedMeshes.map(mesh => (
              <span key={mesh.id} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-[#545454]">
                {mesh.name}
                <button onClick={() => handleRemove(mesh.id)} className="hover:text-red-500 ml-1">
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Tabela de Comparação */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
             {/* AQUI ESTAVA O ERRO: Agora passamos apenas 'meshes' */}
            <ComparisonView meshes={selectedMeshes} />
        </div>

      </div>
    </div>
  );
}