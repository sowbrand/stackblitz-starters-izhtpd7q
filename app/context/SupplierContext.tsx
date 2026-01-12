'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Supplier, Mesh } from '@/types';
import { INITIAL_SUPPLIERS, INITIAL_MESHES } from '@/lib/constants';

interface SupplierContextType {
  // Dados
  suppliers: Supplier[];
  meshes: Mesh[];
  
  // Ações de Produtos (Meshes)
  addMesh: (mesh: Mesh) => void;
  updateMesh: (mesh: Mesh) => void;
  deleteMesh: (id: string) => void;

  // Ações de Fornecedores (CORREÇÃO: Adicionadas aqui)
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;
}

const SupplierContext = createContext<SupplierContextType | undefined>(undefined);

export function SupplierProvider({ children }: { children: ReactNode }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [meshes, setMeshes] = useState<Mesh[]>(INITIAL_MESHES);

  // --- Lógica de Produtos ---
  const addMesh = (mesh: Mesh) => {
    setMeshes((prev) => [...prev, mesh]);
  };

  const updateMesh = (mesh: Mesh) => {
    setMeshes((prev) => prev.map((m) => (m.id === mesh.id ? mesh : m)));
  };

  const deleteMesh = (id: string) => {
    setMeshes((prev) => prev.filter((m) => m.id !== id));
  };

  // --- Lógica de Fornecedores (CORREÇÃO IMPLEMENTADA) ---
  const addSupplier = (supplier: Supplier) => {
    setSuppliers((prev) => [...prev, supplier]);
  };

  const updateSupplier = (supplier: Supplier) => {
    setSuppliers((prev) => prev.map((s) => (s.id === supplier.id ? supplier : s)));
  };

  const deleteSupplier = (id: string) => {
    // Opcional: Avisar se tiver produtos vinculados antes de deletar
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <SupplierContext.Provider value={{ 
      suppliers, 
      meshes, 
      addMesh, 
      updateMesh, 
      deleteMesh,
      addSupplier,     // Exportando
      updateSupplier,  // Exportando
      deleteSupplier   // Exportando
    }}>
      {children}
    </SupplierContext.Provider>
  );
}

export function useSupplierContext() {
  const context = useContext(SupplierContext);
  if (context === undefined) {
    throw new Error('useSupplierContext deve ser usado dentro de um SupplierProvider');
  }
  return context;
}