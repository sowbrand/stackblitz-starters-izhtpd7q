'use client';

import React, { useState } from 'react';
import { Supplier } from '@/types';
// IMPORTANTE: Importando a lista oficial
import { INITIAL_SUPPLIERS } from '@/lib/constants'; 
import { Trash2, Edit2, Plus, Save, X } from 'lucide-react';

export default function ManageSuppliers() {
  // Inicializa o estado com a lista GLOBAL, não uma lista vazia ou mockada localmente
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAdd = () => {
    if (!newSupplierName.trim()) return;
    
    const newSupplier: Supplier = {
      id: Date.now().toString(), 
      name: newSupplierName,
      email: '',
      phone: ''
    };
    
    setSuppliers([...suppliers, newSupplier]);
    setNewSupplierName('');
    setIsAdding(false);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingId(supplier.id);
    setEditingName(supplier.name);
  };

  const handleSaveEdit = () => {
    if (!editingName.trim()) return;
    
    setSuppliers(prev => prev.map(s => 
      s.id === editingId ? { ...s, name: editingName } : s
    ));
    setEditingId(null);
    setEditingName('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
      setSuppliers(prev => prev.filter(s => s.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Gerenciar Fornecedores</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Lista de Fornecedores ({suppliers.length})</h2>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} /> Novo Fornecedor
          </button>
        </div>

        {isAdding && (
          <div className="mb-6 p-4 bg-blue-50 rounded flex gap-2 items-center">
            <input 
              type="text" 
              placeholder="Nome do fornecedor" 
              value={newSupplierName}
              onChange={(e) => setNewSupplierName(e.target.value)}
              className="flex-grow p-2 border rounded"
            />
            <button onClick={handleAdd} className="bg-green-600 text-white p-2 rounded hover:bg-green-700"><Save size={20} /></button>
            <button onClick={() => setIsAdding(false)} className="bg-gray-400 text-white p-2 rounded hover:bg-gray-500"><X size={20} /></button>
          </div>
        )}

        <ul className="space-y-2">
          {suppliers.map(supplier => (
            <li key={supplier.id} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
              {editingId === supplier.id ? (
                <div className="flex-grow flex gap-2 mr-2">
                   <input 
                      type="text" 
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-grow p-1 border rounded"
                    />
                </div>
              ) : (
                <span className="font-medium text-lg">{supplier.name}</span>
              )}

              <div className="flex gap-2">
                {editingId === supplier.id ? (
                   <>
                    <button onClick={handleSaveEdit} className="text-green-600 hover:bg-green-100 p-1 rounded"><Save size={18} /></button>
                    <button onClick={() => setEditingId(null)} className="text-gray-500 hover:bg-gray-200 p-1 rounded"><X size={18} /></button>
                   </>
                ) : (
                   <button onClick={() => handleEdit(supplier)} className="text-blue-600 hover:bg-blue-100 p-1 rounded"><Edit2 size={18} /></button>
                )}
                <button onClick={() => handleDelete(supplier.id)} className="text-red-500 hover:bg-red-100 p-1 rounded"><Trash2 size={18} /></button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}