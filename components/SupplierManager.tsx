
import React, { useState } from 'react';
import { Supplier } from '../types';

interface SupplierManagerProps {
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
}

export const SupplierManager: React.FC<SupplierManagerProps> = ({ suppliers, setSuppliers }) => {
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId !== null) {
      setSuppliers(suppliers.map(s => s.id === editingId ? { ...s, name } : s));
      setEditingId(null);
    } else {
      const newSupplier: Supplier = {
        id: Date.now(),
        name,
      };
      setSuppliers([...suppliers, newSupplier]);
    }
    setName('');
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingId(supplier.id);
    setName(supplier.name);
  };

  const handleDelete = (id: number) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-black mb-6">Gerenciar Fornecedores</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8 border">
        <h2 className="text-xl font-semibold mb-4">{editingId ? 'Editando Fornecedor' : 'Adicionar Novo Fornecedor'}</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nome do Fornecedor"
            className="flex-grow p-2 border rounded bg-white text-gray-900"
            required
          />
          <div className="flex gap-2">
            {editingId && (
              <button type="button" onClick={handleCancelEdit} className="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 transition-colors">
                Cancelar
              </button>
            )}
            <button type="submit" className="bg-[#72bf03] text-white font-bold py-2 px-4 rounded hover:bg-lime-600 transition-colors w-full">
              {editingId ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </div>
      </form>

      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h2 className="text-xl font-semibold mb-4">Lista de Fornecedores</h2>
        <ul className="space-y-3">
          {suppliers.map(supplier => (
            <li key={supplier.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
              <span className="text-gray-800">{supplier.name}</span>
              <div className="space-x-2">
                <button onClick={() => handleEdit(supplier)} className="text-blue-600 hover:text-blue-800 font-semibold">Editar</button>
                <button onClick={() => handleDelete(supplier.id)} className="text-red-600 hover:text-red-800 font-semibold">Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
