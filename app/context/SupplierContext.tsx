'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Supplier, Mesh } from '@/types';
import { INITIAL_SUPPLIERS, INITIAL_MESHES, getNextColor } from '@/lib/constants';

interface SupplierContextType {
  suppliers: Supplier[];
  meshes: Mesh[];
  addMesh: (mesh: Mesh) => void;
  updateMesh: (mesh: Mesh) => void;
  deleteMesh: (id: string) => void;
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;
}

const SupplierContext = createContext<SupplierContextType | undefined>(undefined);

export function SupplierProvider({ children }: { children: ReactNode }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [meshes, setMeshes] = useState<Mesh[]>(INITIAL_MESHES);

  // --- Produtos ---
  const addMesh = (mesh: Mesh) => setMeshes((prev) => [...prev, mesh]);
  const updateMesh = (mesh: Mesh) => setMeshes((prev) => prev.map((m) => (m.id === mesh.id ? mesh : m)));
  const deleteMesh = (id: string) => setMeshes((prev) => prev.filter((m) => m.id !== id));

  // --- Fornecedores (COM LOGICA DE COR AUTOMÁTICA) ---
  const addSupplier = (supplierData: Supplier) => {
    const newIndex = suppliers.length;
    // Gera nome curto automático se não vier (Pega a primeira palavra)
    const shortName = supplierData.shortName || supplierData.name.split(' ')[0].toUpperCase().substring(0, 10);
    // Atribui a próxima cor da lista
    const color = getNextColor(newIndex);

    const newSupplier = { ...supplierData, shortName, color };
    setSuppliers((prev) => [...prev, newSupplier]);
  };

  const updateSupplier = (supplier: Supplier) => {
    setSuppliers((prev) => prev.map((s) => (s.id === supplier.id ? supplier : s)));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <SupplierContext.Provider value={{ suppliers, meshes, addMesh, updateMesh, deleteMesh, addSupplier, updateSupplier, deleteSupplier }}>
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