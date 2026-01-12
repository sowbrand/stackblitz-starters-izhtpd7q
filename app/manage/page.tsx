'use client';

import React, { useState } from 'react';
import { useSupplierContext } from '@/app/context/SupplierContext';
import { ArrowLeft, Plus, Edit2, Trash2, User, Phone, Mail, Save, X } from 'lucide-react';
import Link from 'next/link';
import { Supplier } from '@/types';

export default function ManageSuppliers() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useSupplierContext();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Supplier>({ id: '', name: '', contact: '', phone: '', email: '' });

  const handleEdit = (supplier: Supplier) => {
    setFormData(supplier);
    setIsEditing(true);
  };

  const handleNew = () => {
    setFormData({ id: Math.random().toString(36).substr(2, 9), name: '', contact: '', phone: '', email: '' });
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    // Verifica se é edição (já existe na lista) ou novo
    const exists = suppliers.find(s => s.id === formData.id);
    
    if (exists) {
        updateSupplier(formData);
    } else {
        addSupplier(formData);
    }
    
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
        deleteSupplier(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Cabeçalho */}
        <div className="flex items-center gap-6 mb-10">
          <Link href="/" className="p-3 bg-white rounded-full shadow-sm border border-gray-100 hover:border-[#72BF03] transition-all group">
            <ArrowLeft size={20} className="text-[#545454] group-hover:text-[#72BF03]" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-black font-heading tracking-tight">Fornecedores</h1>
            <p className="text-[#545454] opacity-60 font-medium text-sm">Gerencie sua base de parceiros</p>
          </div>
        </div>

        {/* Lista ou Formulário */}
        {isEditing ? (
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-black flex items-center gap-2">
                        {suppliers.find(s => s.id === formData.id) ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                    </h2>
                    <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-red-500">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-[#545454] uppercase mb-1">Nome da Empresa *</label>
                        <input 
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#72BF03] outline-none text-black"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            required
                            placeholder="Ex: Urbano Têxtil"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#545454] uppercase mb-1">Nome do Contato</label>
                        <input 
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#72BF03] outline-none text-black"
                            value={formData.contact}
                            onChange={e => setFormData({...formData, contact: e.target.value})}
                            placeholder="Ex: Carlos Vendas"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-[#545454] uppercase mb-1">Telefone / WhatsApp</label>
                            <input 
                                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#72BF03] outline-none text-black"
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                placeholder="(00) 00000-0000"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#545454] uppercase mb-1">E-mail</label>
                            <input 
                                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#72BF03] outline-none text-black"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                placeholder="contato@empresa.com"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6">
                        <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-3 text-sm font-bold text-[#545454] hover:bg-gray-50 rounded-lg">
                            Cancelar
                        </button>
                        <button type="submit" className="px-8 py-3 bg-[#72BF03] text-white rounded-lg hover:bg-[#5da102] font-bold shadow-lg shadow-green-100 flex items-center gap-2">
                            <Save size={18} /> Salvar
                        </button>
                    </div>
                </form>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-4">
                <button 
                    onClick={handleNew}
                    className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-4 flex items-center justify-center gap-2 text-[#545454] hover:border-[#72BF03] hover:text-[#72BF03] transition-all mb-4 group"
                >
                    <Plus size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="font-bold">Cadastrar Novo Fornecedor</span>
                </button>

                {suppliers.map(supplier => (
                    <div key={supplier.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                        <div>
                            <h3 className="text-xl font-bold text-black mb-2">{supplier.name}</h3>
                            <div className="flex flex-wrap gap-4 text-sm text-[#545454]">
                                {supplier.contact && (
                                    <div className="flex items-center gap-1.5 opacity-80">
                                        <User size={14} /> {supplier.contact}
                                    </div>
                                )}
                                {supplier.phone && (
                                    <div className="flex items-center gap-1.5 opacity-80">
                                        <Phone size={14} /> {supplier.phone}
                                    </div>
                                )}
                                {supplier.email && (
                                    <div className="flex items-center gap-1.5 opacity-80">
                                        <Mail size={14} /> {supplier.email}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleEdit(supplier)}
                                className="p-2 text-[#545454] hover:text-[#72BF03] hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <Edit2 size={18} />
                            </button>
                            <button 
                                onClick={() => handleDelete(supplier.id)}
                                className="p-2 text-[#545454] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}

      </div>
    </div>
  );
}