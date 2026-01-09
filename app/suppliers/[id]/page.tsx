'use client';

import React, { useState, useMemo } from 'react';
import { Supplier, Mesh, ColorCategory } from '@/types';
import { SupplierDetail } from '@/components/SupplierDetail';
import { MeshForm } from '@/components/MeshForm';
import { ComparisonView } from '@/components/ComparisonView';
import { BatchImporter } from '@/components/BatchImporter';
import { PriceListImporter } from '@/components/PriceListImporter';
import { ConsolidatedPriceImporter } from '@/components/ConsolidatedPriceImporter';
import { PriceUpdateImporter } from '@/components/PriceUpdateImporter';

// --- MOCK DATA (Para simular o banco de dados) ---
const MOCK_SUPPLIERS: Supplier[] = [
  { id: '1', name: 'Urbano Têxtil', email: 'contato@urbano.com.br', phone: '(47) 3333-3333' },
  { id: '2', name: 'FN Malhas', email: 'vendas@fnmalhas.com.br', phone: '(47) 4444-4444' },
  { id: '3', name: 'Pengir Malhas', email: 'comercial@pengir.com.br', phone: '(47) 5555-5555' },
];

const MOCK_MESHES: Mesh[] = [
  {
    id: '101',
    supplierId: '2', // FN Malhas
    code: '66',
    name: 'MOLETOM PA PELUCIADO RAMADO',
    composition: '50% ALG 50% POL',
    width: 184,
    grammage: 310,
    yield: 1.75,
    prices: { 'Claras': 45.30, 'EscurasFortes': 50.90 },
    complement: ''
  },
  {
    id: '102',
    supplierId: '2', // FN Malhas
    code: '230',
    name: 'RIBANA 2X1 PENTEADA',
    composition: '97% ALG 3% ELAST',
    width: 128,
    grammage: 290,
    yield: 2.70,
    prices: { 'Claras': 52.80 },
    complement: 'Acessório'
  }
];

export default function SupplierPage({ params }: { params: { id: string } }) {
  // CORREÇÃO 1: O ID agora é tratado como string, sem converter para Number()
  const supplierId = params.id;

  // Estados locais para simular persistência
  const [suppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [meshes, setMeshes] = useState<Mesh[]>(MOCK_MESHES);

  // Estados de controle de UI (Modais)
  const [isEditingMesh, setIsEditingMesh] = useState<Mesh | null>(null);
  const [isAddingMesh, setIsAddingMesh] = useState(false);
  const [isComparing, setIsComparing] = useState<Mesh | null>(null);
  const [showPriceListImporter, setShowPriceListImporter] = useState(false);
  const [showConsolidatedImporter, setShowConsolidatedImporter] = useState(false);
  const [showPriceUpdateImporter, setShowPriceUpdateImporter] = useState(false);
  const [showBatchImporter, setShowBatchImporter] = useState(false);

  // CORREÇÃO 2: Comparação string === string (antes dava erro string === number)
  const supplier = useMemo(() => suppliers.find(s => s.id === supplierId), [suppliers, supplierId]);
  const supplierMeshes = useMemo(() => meshes.filter(m => m.supplierId === supplierId), [meshes, supplierId]);

  if (!supplier) {
    return <div className="p-8 text-center text-red-500 font-bold">Fornecedor não encontrado</div>;
  }

  // Handlers
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
      {/* VISTA PRINCIPAL */}
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

      {/* MODAIS E TELAS SECUNDÁRIAS */}
      
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