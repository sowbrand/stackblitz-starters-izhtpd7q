
import React, { useState } from 'react';
import { Supplier, Mesh, BatchProduct, PriceInfo } from '../types';
import { extractBatchDataFromFiles } from '../services/geminiService';
import { Upload, X, Layers } from 'lucide-react';

interface BatchImporterProps {
  supplier: Supplier;
  allMeshes: Mesh[];
  setMeshes: React.Dispatch<React.SetStateAction<Mesh[]>>;
  onClose: () => void;
}

const Spinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

export const BatchImporter: React.FC<BatchImporterProps> = ({ supplier, allMeshes, setMeshes, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [extractedData, setExtractedData] = useState<BatchProduct[] | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsLoading(true);
      setError(null);
      // Fix: Explicitly type `f` as `File` to prevent it from being inferred as `unknown`.
      setFileNames(Array.from(files).map((f: File) => f.name));
      setExtractedData(null);
      setSelectedProducts(new Set());
      try {
        const data = await extractBatchDataFromFiles(Array.from(files));
        setExtractedData(data);
        const allProductCodes = new Set(data.map(p => p.product_code));
        setSelectedProducts(allProductCodes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleToggleProduct = (productCode: string) => {
    setSelectedProducts(prev => {
        const newSet = new Set(prev);
        if (newSet.has(productCode)) newSet.delete(productCode);
        else newSet.add(productCode);
        return newSet;
    });
  };

  const handleToggleAll = () => {
    if (!extractedData) return;
    if (selectedProducts.size === extractedData.length) {
        setSelectedProducts(new Set());
    } else {
        setSelectedProducts(new Set(extractedData.map(p => p.product_code)));
    }
  };

  const handleImport = () => {
    if (!extractedData) return;

    const productsToImport = extractedData.filter(p => selectedProducts.has(p.product_code));
    let updatedMeshes = [...allMeshes];

    productsToImport.forEach(product => {
      const existingMeshIndex = updatedMeshes.findIndex(m => m.code === product.product_code && m.supplierId === supplier.id);
      
      const newPrices: PriceInfo[] = product.price_list.map(p => ({
          colorCategory: p.category_normalized,
          price: p.price_cash_kg,
      }));

      const newComplement = product.complement ? { code: '', name: product.complement.info } : null;

      if (existingMeshIndex > -1) {
        // UPDATE
        const existingMesh = updatedMeshes[existingMeshIndex];
        updatedMeshes[existingMeshIndex] = {
            ...existingMesh,
            name: product.product_name || existingMesh.name,
            composition: product.technical_specs.composition || existingMesh.composition,
            width: product.technical_specs?.width_m ? product.technical_specs.width_m * 100 : existingMesh.width,
            grammage: product.technical_specs?.grammage_gsm || existingMesh.grammage,
            yield: product.technical_specs?.yield_m_kg || existingMesh.yield,
            prices: newPrices,
            complement: newComplement || existingMesh.complement,
        };
      } else {
        // CREATE
        const newMesh: Mesh = {
          id: Date.now() + Math.random(),
          name: product.product_name,
          code: product.product_code,
          supplierId: supplier.id,
          prices: newPrices,
          width: product.technical_specs?.width_m ? product.technical_specs.width_m * 100 : 0,
          grammage: product.technical_specs?.grammage_gsm || 0,
          yield: product.technical_specs?.yield_m_kg || 0,
          composition: product.technical_specs.composition || '',
          complement: newComplement,
          description: '', shrinkage: '', rollWeight: 0, minOrder: 0, availableColors: [],
        };
        updatedMeshes.push(newMesh);
      }
    });

    setMeshes(updatedMeshes);
    alert(`${productsToImport.length} produtos importados/atualizados com sucesso!`);
    onClose();
  };

  return (
    <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-black">Importador em Lote: <span className="text-orange-500">{supplier.name}</span></h1>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
        </div>
      
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 mb-8 text-center">
            <h2 className="text-xl font-semibold text-black mb-2">Importar Múltiplas Fichas (IA)</h2>
            <p className="text-gray-600 mb-4">Envie várias imagens de fichas técnicas (e.g., Urbano Têxtil) de uma vez.</p>
            <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center justify-center bg-orange-500 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-orange-600 transition-colors duration-300">
                {isLoading ? <Spinner /> : <Layers size={20} className="mr-2" />}
                {isLoading ? 'Analisando Fichas...' : 'Enviar Arquivos'}
            </label>
            <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} disabled={isLoading} accept=".pdf,.png,.jpg,.jpeg" multiple />
            {fileNames.length > 0 && !isLoading && <p className="mt-3 text-sm text-gray-500">{fileNames.length} arquivo(s) selecionado(s).</p>}
            {error && <p className="mt-3 text-sm text-red-500">Erro: {error}</p>}
        </div>

        {extractedData && (
             <div className="bg-white p-6 rounded-lg shadow-md border">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Produtos Extraídos</h2>
                     <div className="flex items-center">
                        <input type="checkbox" id="select-all" className="h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            checked={selectedProducts.size === extractedData.length}
                            onChange={handleToggleAll} />
                        <label htmlFor="select-all" className="ml-2 font-semibold">Selecionar Todos</label>
                    </div>
                </div>

                <div className="space-y-4">
                    {extractedData.map(product => (
                        <div key={product.product_code} className="border rounded-lg p-4 bg-gray-50">
                             <div className="flex items-start">
                                <input type="checkbox" id={`product-${product.product_code}`} className="h-5 w-5 rounded border-gray-400 text-orange-600 focus:ring-orange-500 mt-1"
                                    checked={selectedProducts.has(product.product_code)}
                                    onChange={() => handleToggleProduct(product.product_code)} />
                                <div className="ml-4 flex-grow">
                                    <h3 className="text-lg font-bold text-black">{product.product_name} <span className="font-normal text-gray-500">({product.product_code})</span></h3>
                                    <p className="text-sm text-gray-600">{product.technical_specs.composition}</p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm mt-2 text-gray-800">
                                        <span>Largura: <span className="font-semibold">{product.technical_specs.width_m} m</span></span>
                                        <span>Gramatura: <span className="font-semibold">{product.technical_specs.grammage_gsm} g/m²</span></span>
                                        <span>Rendimento: <span className="font-semibold">{product.technical_specs.yield_m_kg} m/kg</span></span>
                                    </div>
                                    {product.complement && <p className="text-sm text-gray-600 mt-1">Complemento: {product.complement.info}</p>}

                                    <div className="mt-3">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-200">
                                                <tr>
                                                    <th className="p-2 font-semibold text-gray-800">Categoria Original</th>
                                                    <th className="p-2 font-semibold text-gray-800">Categoria Normalizada</th>
                                                    <th className="p-2 font-semibold text-gray-800 text-right">Preço (R$/kg)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            {product.price_list.map((price, index) => (
                                                <tr key={index} className="border-b">
                                                    <td className="p-2 text-gray-900">{price.original_category_name}</td>
                                                    <td className="p-2"><span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-medium">{price.category_normalized}</span></td>
                                                    <td className="p-2 text-right font-mono text-gray-900">R$ {price.price_cash_kg.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                             </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-end">
                    <button onClick={handleImport} disabled={selectedProducts.size === 0}
                        className="bg-orange-500 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-orange-600 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">
                        Importar {selectedProducts.size} {selectedProducts.size === 1 ? 'produto' : 'produtos'}
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};