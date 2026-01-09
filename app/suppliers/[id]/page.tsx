
'use client';

import React, { useState, useMemo } from 'react';
import { notFound } from 'next/navigation';
import { INITIAL_SUPPLIERS, INITIAL_MESHES } from '@/lib/constants';
import { Mesh, Supplier } from '@/types';

// Importando os componentes que serão renderizados condicionalmente
import { SupplierDetail } from '@/components/SupplierDetail';
import { MeshForm } from '@/components/MeshForm';
import { PriceListImporter } from '@/components/PriceListImporter';
import { ConsolidatedPriceImporter } from '@/components/ConsolidatedPriceImporter';
import { PriceUpdateImporter } from '@/components/PriceUpdateImporter';
import { BatchImporter } from '@/components/BatchImporter';
import { ComparisonView } from '@/components/ComparisonView';

type SupplierAction = 'detail' | 'add_mesh' | 'edit_mesh' | 'compare_mesh' | 'import_price_list' | 'import_consolidated' | 'import_price_update' | 'import_batch';

export default function SupplierPage({ params }: { params: { id: string } }) {
  const supplierId = parseInt(params.id, 10);
  
  // Em um app real, o estado seria global (Zustand, Redux) ou gerenciado via Server Actions.
  // Para a migração, usamos useState para simular o banco de dados.
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [meshes, setMeshes] = useState<Mesh[]>(INITIAL_MESHES);

  const [action, setAction] = useState<SupplierAction>('detail');
  const [activeMesh, setActiveMesh] = useState<Mesh | null>(null);

  const supplier = useMemo(() => suppliers.find(s => s.id === supplierId), [suppliers, supplierId]);
  const supplierMeshes = useMemo(() => meshes.filter(m => m.supplierId === supplierId), [meshes, supplierId]);

  if (!supplier) {
    notFound();
  }

  // Funções de manipulação de estado
  const handleAddMesh = (newMesh: Mesh) => {
    setMeshes(prev => [...prev, { ...newMesh, id: Date.now() }]);
    setAction('detail');
  };

  const handleUpdateMesh = (updatedMesh: Mesh) => {
    setMeshes(prev => prev.map(m => m.id === updatedMesh.id ? updatedMesh : m));
    setActiveMesh(null);
    setAction('detail');
  };

  // Funções de navegação de ação
  const handleEdit = (mesh: Mesh) => {
    setActiveMesh(mesh);
    setAction('edit_mesh');
  };
  
  const handleCompare = (mesh: Mesh) => {
    setActiveMesh(mesh);
    setAction('compare_mesh');
  };

  const renderActionView = () => {
    switch (action) {
      case 'add_mesh':
      case 'edit_mesh':
        return <MeshForm 
                  onSubmit={action === 'edit_mesh' ? handleUpdateMesh : handleAddMesh} 
                  suppliers={suppliers} 
                  initialData={activeMesh}
                  preselectedSupplierId={supplierId}
                  onCancel={() => setAction('detail')}
                />;
      
      case 'import_price_list':
        return <PriceListImporter supplier={supplier} allMeshes={meshes} setMeshes={setMeshes} onClose={() => setAction('detail')} />;

      case 'import_consolidated':
        return <ConsolidatedPriceImporter supplier={supplier} allMeshes={meshes} setMeshes={setMeshes} onClose={() => setAction('detail')} />;
      
      case 'import_price_update':
        return <PriceUpdateImporter supplier={supplier} allMeshes={meshes} setMeshes={setMeshes} onClose={() => setAction('detail')} />;

      case 'import_batch':
        return <BatchImporter supplier={supplier} allMeshes={meshes} setMeshes={setMeshes} onClose={() => setAction('detail')} />;

      case 'compare_mesh':
        return <ComparisonView allMeshes={meshes} initialMeshes={activeMesh ? [activeMesh] : []} suppliers={suppliers} />;

      case 'detail':
      default:
        return <SupplierDetail 
                  supplier={supplier}
                  meshes={supplierMeshes}
                  onEditMesh={handleEdit}
                  onStartComparison={handleCompare}
                  onAddNewMesh={() => { setActiveMesh(null); setAction('add_mesh'); }}
                  onImportPriceList={() => setAction('import_price_list')}
                  onImportConsolidatedPriceList={() => setAction('import_consolidated')}
                  onPriceUpdateImport={() => setAction('import_price_update')}
                  onBatchImport={() => setAction('import_batch')}
                />;
    }
  };

  return <div>{renderActionView()}</div>;
}
