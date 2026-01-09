'use client';

import React, { useState, useMemo } from 'react';
import { Supplier, Mesh } from '@/types';
import { SupplierDetail } from '@/components/SupplierDetail';
import { MeshForm } from '@/components/MeshForm';
import { ComparisonView } from '@/components/ComparisonView';
import { BatchImporter } from '@/components/BatchImporter';
import { PriceListImporter } from '@/components/PriceListImporter';
import { ConsolidatedPriceImporter } from '@/components/ConsolidatedPriceImporter';
import { PriceUpdateImporter } from '@/components/PriceUpdateImporter';
import { INITIAL_SUPPLIERS, INITIAL_MESHES } from '@/lib/constants';

export default function SupplierPage({ params }: { params: { id: string } }) {
  // Garante que o ID da URL é string
  const supplierId = String(params.id);

  // Usa as constantes globais como estado inicial
  const [suppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [meshes, setMeshes] = useState<Mesh[]>(INITIAL_MESHES);

  // Modais
  const [isEditingMesh, setIsEditingMesh] = useState<Mesh | null>(null);
  const [isAddingMesh, setIsAddingMesh] = useState(false);
  const [isComparing, setIsComparing] = useState<Mesh | null>(null);
  const [showPriceListImporter, setShowPriceListImporter] = useState(false);
  const [showConsolidatedImporter, setShowConsolidatedImporter] = useState(false);
  const [showPriceUpdateImporter, setShowPriceUpdateImporter] = useState(false);
  const [showBatchImporter, setShowBatchImporter] = useState(false);

  // Busca o fornecedor na lista oficial
  const supplier = useMemo(() => {
    return suppliers.find(s => String(s.id) === supplierId);
  }, [suppliers, supplierId]);

  const supplierMeshes = useMemo(() => {
    return meshes.filter(m => String(m.supplierId) === supplierId);
  }, [meshes, supplierId]);

  if (!supplier) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
            <h1 className="text-2xl font-bold mb-2">Fornecedor não encontrado</h1>
            <p>ID Procurado: {supplierId}</p>
            <div className="mt-4 p-4 bg-gray-100 rounded text-left text-sm">
                <p className="font-bold">IDs disponíveis:</p>
                <ul>
                    {suppliers.map(s => <li key={s.id}>{s.id} - {s.name}</li>)}
                </ul>
            </div>
            <a href="/" className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Voltar para o início</a>
        </div>
    );
  }

  const handleSaveMesh = (mesh: Mesh) => {
    if (isEditingMesh) {
      setMeshes(prev => prev.map(m => m.id === mesh.id ? mesh : m));
    } else {
      setMeshes(prev => [...prev, mesh]);
    }
    setIsEditingMesh(null);
    setIsAddingMesh(false);
  };

  const handleImportMeshes = (newMeshes: Mesh[]) => {
    setMeshes(prev => [...prev, ...newMeshes]);
    setShowPriceListImporter(false);
    setShowBatchImporter(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {!isComparing && !isEditingMesh && !isAddingMesh && 
       !showPriceListImporter && !showConsolidatedImporter && 
       !showPriceUpdateImporter && !showBatchImporter && (
        <SupplierDetail 
          supplier={supplier}
          meshes={supplierMeshes}
          onEditMesh={setIsEditingMesh}
          onStartComparison={setIsComparing}
          onAddNewMesh={() => setIsAddingMesh(true)}
          onImportPriceList={() => setShowPriceListImporter(true)}
          onImportConsolidatedPriceList={() => setShowConsolidatedImporter(true)}
          onPriceUpdateImport={() => setShowPriceUpdateImporter(true)}
          onBatchImport={() => setShowBatchImporter(true)}
        />
      )}

      {(isAddingMesh || isEditingMesh) && (
        <MeshForm 
          onSubmit={handleSaveMesh}
          suppliers={suppliers}
          initialData={isEditingMesh}
          preselectedSupplierId={supplier.id}
          onCancel={() => { setIsAddingMesh(false); setIsEditingMesh(null); }}
        />
      )}

      {isComparing && (
        <div className="relative">
            <button onClick={() => setIsComparing(null)} className="mb-4 text-blue-600 hover:underline">← Voltar</button>
            <ComparisonView 
                allMeshes={meshes}
                initialMeshes={[isComparing]}
                suppliers={suppliers}
            />
        </div>
      )}

      {showBatchImporter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-4xl">
                <BatchImporter 
                    supplier={supplier}
                    existingMeshes={meshes}
                    onImport={handleImportMeshes}
                    onCancel={() => setShowBatchImporter(false)}
                />
            </div>
        </div>
      )}

      {showConsolidatedImporter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="w-full max-w-6xl my-8">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    <ConsolidatedPriceImporter 
                        supplier={supplier}
                        allMeshes={meshes}
                        setMeshes={setMeshes}
                        onClose={() => setShowConsolidatedImporter(false)}
                    />
                </div>
            </div>
        </div>
      )}

      {showPriceUpdateImporter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="w-full max-w-6xl my-8">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    <PriceUpdateImporter 
                        supplier={supplier}
                        allMeshes={meshes}
                        setMeshes={setMeshes}
                        onClose={() => setShowPriceUpdateImporter(false)}
                    />
                </div>
            </div>
        </div>
      )}

      {showPriceListImporter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-2xl">
                <PriceListImporter 
                    supplier={supplier}
                    existingMeshes={meshes}
                    onImport={handleImportMeshes}
                    onCancel={() => setShowPriceListImporter(false)}
                />
            </div>
        </div>
      )}
    </div>
  );
}