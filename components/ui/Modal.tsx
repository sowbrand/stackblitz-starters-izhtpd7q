'use client';

import React from 'react';
import { X, Info } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
        
        {/* Cabeçalho */}
        <div className="bg-sow-black p-4 flex justify-between items-center">
          <h3 className="text-white font-bold font-heading flex items-center gap-2">
            <Info size={18} className="text-[#72BF03]" />
            {title}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 text-[#545454]">
          {children}
        </div>

        {/* Rodapé */}
        <div className="p-4 bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-[#72BF03] text-white rounded-xl font-bold hover:bg-[#5da102] transition-colors shadow-lg shadow-green-100/50"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}