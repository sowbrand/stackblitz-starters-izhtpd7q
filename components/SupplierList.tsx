
import React from 'react';
import { Supplier, View } from '../types';
import { ChevronRight, Settings } from 'lucide-react';

interface SupplierListProps {
  suppliers: Supplier[];
  onSelectSupplier: (id: number) => void;
  setView: (view: View) => void;
}

export const SupplierList: React.FC<SupplierListProps> = ({ suppliers, onSelectSupplier, setView }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">Fornecedores</h1>
        <button 
          onClick={() => setView('suppliers')}
          className="flex items-center bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-300 transition-colors duration-300"
        >
          <Settings size={20} className="mr-2" />
          Gerenciar Fornecedores
        </button>
      </div>
      <div className="bg-white border rounded-lg shadow-sm">
        <ul className="divide-y divide-gray-200">
          {suppliers.map(supplier => (
            <li 
              key={supplier.id} 
              onClick={() => onSelectSupplier(supplier.id)}
              className="p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition-colors duration-200"
            >
              <span className="text-lg font-semibold text-gray-800">{supplier.name}</span>
              <ChevronRight className="text-gray-400" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
