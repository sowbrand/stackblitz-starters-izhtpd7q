
import React from 'react';
import Link from 'next/link';
import { INITIAL_SUPPLIERS } from '@/lib/constants';
import { ChevronRight, Settings } from 'lucide-react';

export default function SuppliersPage() {
  const suppliers = INITIAL_SUPPLIERS;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">Fornecedores</h1>
        <Link 
          href="/manage"
          className="flex items-center bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-300 transition-colors duration-300"
        >
          <Settings size={20} className="mr-2" />
          Gerenciar Fornecedores
        </Link>
      </div>
      <div className="bg-white border rounded-lg shadow-sm">
        <ul className="divide-y divide-gray-200">
          {suppliers.map(supplier => (
            <li key={supplier.id}>
              <Link 
                href={`/suppliers/${supplier.id}`}
                className="p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition-colors duration-200"
              >
                <span className="text-lg font-semibold text-gray-800">{supplier.name}</span>
                <ChevronRight className="text-gray-400" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
