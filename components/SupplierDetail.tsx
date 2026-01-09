
import React from 'react';
import { Mesh, Supplier } from '../types';
import { PlusCircle, UploadCloud, FileJson, RefreshCcw, Layers } from 'lucide-react';

interface SupplierDetailProps {
  supplier: Supplier;
  meshes: Mesh[];
  onEditMesh: (mesh: Mesh) => void;
  onStartComparison: (mesh: Mesh) => void;
  onAddNewMesh: () => void;
  onImportPriceList: () => void;
  onImportConsolidatedPriceList: () => void;
  onPriceUpdateImport: () => void;
  onBatchImport: () => void;
}

const MeshCard: React.FC<{ mesh: Mesh; onEdit: () => void; onCompare: () => void }> = ({ mesh, onEdit, onCompare }) => {
  const priceClaras = mesh.prices.find(p => p.colorCategory === 'Claras')?.price || 0;
  const indications = mesh.usageIndications?.join(', ') || mesh.description;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 p-4 flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-bold text-black">{mesh.name}</h3>
        <p className="text-sm text-gray-500 mb-2">{mesh.code}</p>
        <p className="text-sm mb-4">{indications}</p>
        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div><span className="font-semibold">Largura:</span> {mesh.width} cm</div>
          <div><span className="font-semibold">Gramatura:</span> {mesh.grammage} g/m²</div>
          <div><span className="font-semibold">Rendimento:</span> {mesh.yield} m/kg</div>
          <div><span className="font-semibold">Composição:</span> {mesh.composition}</div>
        </div>
      </div>
      <div className="border-t pt-3 mt-auto">
        <p className="text-lg font-bold text-black mb-3">
          R$ {priceClaras.toFixed(2)}
          <span className="text-sm font-normal text-gray-500"> /kg (Cores Claras)</span>
        </p>
        <div className="flex space-x-2">
          <button onClick={onEdit} className="w-full bg-gray-200 text-gray-800 hover:bg-gray-300 font-bold py-2 px-4 rounded transition-colors duration-200">Editar</button>
          <button onClick={onCompare} className="w-full bg-[#72bf03] text-white hover:bg-lime-600 font-bold py-2 px-4 rounded transition-colors duration-200">Comparar</button>
        </div>
      </div>
    </div>
  );
};

export const SupplierDetail: React.FC<SupplierDetailProps> = ({ supplier, meshes, onEditMesh, onStartComparison, onAddNewMesh, onImportPriceList, onImportConsolidatedPriceList, onPriceUpdateImport, onBatchImport }) => {
  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-black">
            Malhas de: <span className="text-[#72bf03]">{supplier.name}</span>
        </h1>
        <div className="flex gap-2 flex-wrap">
             <button
              onClick={onBatchImport}
              className="flex items-center bg-orange-500 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-orange-600 transition-colors duration-300"
            >
              <Layers size={20} className="mr-2" />
              Importar em Lote (IA)
            </button>
             <button
              onClick={onPriceUpdateImport}
              className="flex items-center bg-teal-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-teal-700 transition-colors duration-300"
            >
              <RefreshCcw size={20} className="mr-2" />
              Atualizar Preços
            </button>
             <button 
              onClick={onImportConsolidatedPriceList}
              className="flex items-center bg-purple-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-300"
            >
              <FileJson size={20} className="mr-2" />
              Importar Tabela Consolidada
            </button>
            <button 
              onClick={onImportPriceList}
              className="flex items-center bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300"
            >
              <UploadCloud size={20} className="mr-2" />
              Importar Tabela Simples
            </button>
            <button 
              onClick={onAddNewMesh}
              className="flex items-center bg-[#72bf03] text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-lime-600 transition-colors duration-300"
            >
              <PlusCircle size={20} className="mr-2" />
              Adicionar Malha
            </button>
        </div>
      </div>
      
      {meshes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meshes.map(mesh => (
            <MeshCard 
              key={mesh.id} 
              mesh={mesh} 
              onEdit={() => onEditMesh(mesh)}
              onCompare={() => onStartComparison(mesh)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700">Nenhuma malha cadastrada para este fornecedor</h2>
            <p className="text-gray-500 mt-2">Clique em "Adicionar Malha" ou "Importar Tabela" para começar.</p>
        </div>
      )}
    </div>
  );
};
