'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Supplier, Mesh } from '@/types';
import { INITIAL_SUPPLIERS, INITIAL_MESHES } from '@/lib/constants';

// Definição do que o contexto carrega
interface SupplierContextType {
  suppliers: Supplier[];
  meshes: Mesh[];
  addMesh: (mesh: Mesh) => void;
  updateMesh: (mesh: Mesh) => void;
  deleteMesh: (id: string) => void;
}

const SupplierContext = createContext<SupplierContextType | undefined>(undefined);

export function SupplierProvider({ children }: { children: ReactNode }) {
  // Dados iniciais
  const [suppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [meshes, setMeshes] = useState<Mesh[]>(INITIAL_MESHES);

  // Adicionar
  const addMesh = (mesh: Mesh) => {
    setMeshes((prev) => [...prev, mesh]);
  };

  // Atualizar
  const updateMesh = (mesh: Mesh) => {
    setMeshes((prev) => prev.map((m) => (m.id === mesh.id ? mesh : m)));
  };

  // Deletar
  const deleteMesh = (id: string) => {
    setMeshes((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <SupplierContext.Provider value={{ suppliers, meshes, addMesh, updateMesh, deleteMesh }}>
      {children}
    </SupplierContext.Provider>
  );
}

// Hook para usar os dados
export function useSupplierContext() {
  const context = useContext(SupplierContext);
  if (context === undefined) {
    throw new Error('useSupplierContext deve ser usado dentro de um SupplierProvider');
  }
  return context;
}