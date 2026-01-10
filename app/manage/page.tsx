'use client';

import React, { useState } from 'react';
import { Supplier } from '@/types';
import { INITIAL_SUPPLIERS } from '@/lib/constants'; 
import { Trash2, Edit2, Plus, Save, X, Building2 } from 'lucide-react';

export default function ManageSuppliers() {
  // Estado local dos fornecedores (inicia com a lista oficial)
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  
  // Controles de Edição/Criação
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Campos do formulário
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  // Iniciar criação
  const startAdd = () => {
    setFormData({ name: '', email: '', phone: '' });
    setIsAdding(true);
    setEditingId(null);
  };

  // Iniciar edição
  const startEdit = (supplier: Supplier) => {
    setFormData({ 
        name: supplier.name, 
        email: supplier.email || '', 
        phone: supplier.phone || '' 
    });
    setEditingId(supplier.id);
    setIsAdding(false);
  };

  // Salvar (Criar ou Atualizar)
  const handleSave = () => {
    if (!formData.name.trim()) return alert("O nome é obrigatório");

    if (editingId) {
      // Atualizar existente
      setSuppliers(prev => prev.map(s => 
        s.id === editingId ? { ...s, ...formData } : s
      ));
      setEditingId(null);
    } else {
      // Criar novo
      const newSupplier: Supplier = {
        id: Date.now().toString(),
        ...formData
      };
      setSuppliers(prev => [...prev, newSupplier]);
      setIsAdding(false);
    }
    // Limpa form
    setFormData({ name: '', email: '', phone: '' });
  };

  // Deletar
  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
      setSuppliers(prev => prev.filter(s => s.id !== id));
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Fornecedores</h1>
            <p className="text-gray-500">Adicione, edite ou remova parceiros comerciais.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Cabeçalho da Lista */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Building2 size={20} className="text-gray-400"/>
            Lista de Fornecedores <span className="text-sm font-normal text-gray-500">({suppliers.length})</span>
          </h2>
          {!isAdding && !editingId && (
              <button 
                onClick={startAdd}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                <Plus size={18} /> Novo Fornecedor
              </button>
          )}
        </div>

        {/* Formulário de Edição/Criação (Aparece condicionalmente) */}
        {(isAdding || editingId) && (
          <div className="p-6 bg-blue-50 border-b border-blue-100">
            <h3 className="font-bold text-blue-800 mb-4">{isAdding ? 'Novo Cadastro' : 'Editando Fornecedor'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input 
                  type="text" 
                  placeholder="Nome do Fornecedor *" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input 
                  type="email" 
                  placeholder="Email (Opcional)" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input 
                  type="text" 
                  placeholder="Telefone (Opcional)" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
            <div className="flex gap-2 justify-end">
                <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-4 py-2 text-gray-600 hover:bg-white rounded-lg transition-colors">Cancelar</button>
                <button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">
                    <Save size={18} /> Salvar
                </button>
            </div>
          </div>
        )}

        {/* Lista */}
        <div className="divide-y divide-gray-100">
          {suppliers.map(supplier => (
            <div key={supplier.id} className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${editingId === supplier.id ? 'bg-blue-50' : ''}`}>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-sm">
                    {supplier.name.substring(0,2).toUpperCase()}
                </div>
                <div>
                    <p className="font-semibold text-gray-900">{supplier.name}</p>
                    <p className="text-xs text-gray-500">ID: {supplier.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                    onClick={() => startEdit(supplier)} 
                    disabled={!!editingId}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-full disabled:opacity-30 transition-colors"
                    title="Editar"
                >
                    <Edit2 size={18} />
                </button>
                <button 
                    onClick={() => handleDelete(supplier.id)} 
                    disabled={!!editingId}
                    className="p-2 text-red-500 hover:bg-red-100 rounded-full disabled:opacity-30 transition-colors"
                    title="Excluir"
                >
                    <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          
          {suppliers.length === 0 && (
              <div className="p-8 text-center text-gray-500">Nenhum fornecedor cadastrado.</div>
          )}
        </div>
      </div>
    </div>
  );
}