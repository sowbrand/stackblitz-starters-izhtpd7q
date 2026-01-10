'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
// Caminhos relativos (saindo de app/context -> app -> raiz -> types/lib)
import { Supplier, Mesh } from '../../types';
import { INITIAL_SUPPLIERS, INITIAL_MESHES } from '../../lib/constants';

interface SupplierContextType {
  suppliers: Supplier[];
  meshes: Mesh[];
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (id: string, data: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  addMesh: (mesh: Mesh) => void;
  updateMesh: (mesh: Mesh) => void;
  setMeshes: React.Dispatch<React.SetStateAction<Mesh[]>>;
}

const SupplierContext = createContext<SupplierContextType | undefined>(undefined);

export function SupplierProvider({ children }: { children: ReactNode }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [meshes, setMeshes] = useState<Mesh[]>(INITIAL_MESHES);

  const addSupplier = (supplier: Supplier) => {
    setSuppliers(prev => [...prev, supplier]);
  };

  const updateSupplier = (id: string, data: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  const addMesh = (mesh: Mesh) => {
    setMeshes(prev => [...prev, mesh]);
  };

  const updateMesh = (updatedMesh: Mesh) => {
    setMeshes(prev => prev.map(m => m.id === updatedMesh.id ? updatedMesh : m));
  };

  return (
    <SupplierContext.Provider value={{ 
        suppliers, meshes, 
        addSupplier, updateSupplier, deleteSupplier, 
        addMesh, updateMesh, setMeshes 
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