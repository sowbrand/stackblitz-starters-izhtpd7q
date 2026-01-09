
import React from 'react';
import { View } from '../types';

interface HeaderProps {
  setView: (view: View) => void;
}

export const Header: React.FC<HeaderProps> = ({ setView }) => {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <div 
        className="font-helvetica text-2xl cursor-pointer"
        onClick={() => setView('suppliers_list')}
      >
        <span className="font-normal">Sow</span>
        <span className="font-bold">brand</span>
      </div>
      <nav>
        <button 
          onClick={() => setView('suppliers_list')} 
          className="text-[#545454] hover:text-black mx-2 sm:mx-4 font-semibold"
        >
          Fornecedores
        </button>
        <button 
          onClick={() => setView('comparison')} 
          className="text-[#545454] hover:text-black mx-2 sm:mx-4 font-semibold"
        >
          Comparador
        </button>
        <button 
          onClick={() => setView('suppliers')} 
          className="text-[#545454] hover:text-black mx-2 sm:mx-4 font-semibold"
        >
          Gerenciar
        </button>
      </nav>
    </header>
  );
};
