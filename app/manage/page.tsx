'use client';

import React, { useState } from 'react';
// Caminho relativo para types (saindo de app/manage -> app -> raiz -> types)
import { Supplier } from '../../types'; 
import { Trash2, Edit2, Plus, Save, Building2 } from 'lucide-react';
// Caminho relativo para context (saindo de app/manage -> app -> context)
import { useSupplierContext } from '../context/SupplierContext';

export default function ManageSuppliers() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useSupplierContext();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '' 
  });

  const startAdd = () => {
    setFormData({ name: '', email: '', phone: '' });
    setIsAdding(true);
    setEditingId(null);
  };

  const startEdit = (supplier: Supplier) => {
    setFormData({ 
        name: supplier.name, 
        email: supplier.email || '', 
        phone: supplier.phone || '' 
    });
    setEditingId(supplier.id);
    setIsAdding(false);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
        alert("O nome é obrigatório");
        return;
    }

    if (editingId) {
      updateSupplier(editingId, formData);
      setEditingId(null);
    } else {
      const newSupplier: Supplier = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      };
      addSupplier(newSupplier);
      setIsAdding(false);
    }
    setFormData({ name: '', email: '', phone: '' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza? Isso pode afetar malhas vinculadas.')) {
      deleteSupplier(id);
    }
  };

  const handleCancel = () => {
      setIsAdding(false);
      setEditingId(null);
      setFormData({ name: '', email: '', phone: '' });
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
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
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

        {(isAdding || editingId) && (
          <div className="p-6 bg-blue-50 border-b border-blue-100">
            <h3 className="font-bold text-blue-800 mb-4">{isAdding ? 'Novo Cadastro' : 'Editando Fornecedor'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label className="block text-xs font-semibold text-blue-800 mb-1">Nome *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-blue-800 mb-1">Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-blue-800 mb-1">Telefone</label>
                    <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border rounded" />
                </div>
            </div>
            <div className="flex gap-2 justify-end">
                <button onClick={handleCancel} className="px-4 py-2 text-gray-600 hover:bg-white rounded-lg">Cancelar</button>
                <button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"><Save size={18} /> Salvar</button>
            </div>
          </div>
        )}

        <div className="divide-y divide-gray-100">
          {suppliers.length > 0 ? (
              suppliers.map(supplier => (
                <div key={supplier.id} className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${editingId === supplier.id ? 'bg-blue-50' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-sm">
                        {supplier.name.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">{supplier.name}</p>
                        <div className="flex gap-3 text-xs text-gray-500">
                            <span>ID: {supplier.id}</span>
                            {supplier.email && <span>• {supplier.email}</span>}
                        </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEdit(supplier)} disabled={!!editingId} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(supplier.id)} disabled={!!editingId} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))
          ) : (
              <div className="p-12 text-center text-gray-500">Nenhum fornecedor cadastrado.</div>
          )}
        </div>
      </div>
    </div>
  );
}