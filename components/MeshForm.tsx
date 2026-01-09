'use client';

import React from 'react';
import { Mesh, Supplier, ColorCategory, ExtractedData } from '@/types';
import { extractDataFromFile } from '@/services/geminiService';
import { Upload, X, Plus, Info, Palette, Tag, CheckSquare, Loader2 } from 'lucide-react';

interface MeshFormProps {
  onSubmit: (mesh: Mesh) => void;
  suppliers: Supplier[];
  initialData?: Mesh | null;
  preselectedSupplierId?: string | null;
  onCancel: () => void;
}

const ExtractedInfo: React.FC<{mesh: Partial<Mesh>, extracted?: ExtractedData}> = ({ mesh, extracted }) => {
    if (!extracted) return null;
    
    const hasData = extracted.features || extracted.usage_indications || extracted.complement || extracted.color_palettes;

    if (!hasData) return null;

    return (
        <div className="bg-lime-50 border-l-4 border-lime-500 p-4 my-6 rounded-r-lg">
            <div className="flex items-center mb-3">
                <Info size={20} className="text-lime-700 mr-2" />
                <h3 className="text-xl font-bold text-lime-800">Detalhes Extraídos (IA)</h3>
            </div>
            
            {extracted.usage_indications && extracted.usage_indications.length > 0 && (
                 <div className="mb-2">
                    <div className="flex items-center text-sm font-semibold text-gray-700 mb-1"><CheckSquare size={16} className="mr-2"/>Indicações de Uso:</div>
                    <p className="text-sm text-gray-600">{extracted.usage_indications.join(', ')}</p>
                </div>
            )}
            {extracted.complement && (
                 <div className="mb-2">
                    <div className="flex items-center text-sm font-semibold text-gray-700 mb-1"><Plus size={16} className="mr-2"/>Complemento:</div>
                    <p className="text-sm text-gray-600">{extracted.complement.name} ({extracted.complement.code})</p>
                </div>
            )}
            {extracted.features && extracted.features.length > 0 && (
                <div className="mb-2">
                    <div className="flex items-center text-sm font-semibold text-gray-700 mb-1"><Tag size={16} className="mr-2"/>Características:</div>
                    <div className="flex flex-wrap gap-2">
                        {extracted.features.map(f => <span key={f} className="bg-lime-200 text-lime-800 text-xs font-semibold px-2 py-1 rounded-full">{f}</span>)}
                    </div>
                </div>
            )}
        </div>
    );
}


export const MeshForm: React.FC<MeshFormProps> = ({ onSubmit, suppliers, initialData, preselectedSupplierId, onCancel }) => {
  const [mesh, setMesh] = React.useState<Omit<Mesh, 'id'>>({
    name: '', code: '', composition: '', width: 0, grammage: 0, yield: 0,
    prices: {}, // CORREÇÃO: Inicializado como Objeto vazio
    supplierId: preselectedSupplierId || '',
    complement: '' // CORREÇÃO: Inicializado como string vazia
  });
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [extractedRaw, setExtractedRaw] = React.useState<ExtractedData | undefined>(undefined);

  React.useEffect(() => {
    if (initialData) {
      setMesh(initialData);
    } else if (preselectedSupplierId) {
        setMesh(prev => ({ ...prev, supplierId: preselectedSupplierId }));
    }
  }, [initialData, preselectedSupplierId]);

  const supplierId = initialData?.supplierId || preselectedSupplierId;
  const supplierName = React.useMemo(() => {
      if (!supplierId) return null;
      return suppliers.find(s => s.id === supplierId)?.name || 'Fornecedor não encontrado';
  }, [suppliers, supplierId]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMesh(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (category: string, price: number) => {
    setMesh(prev => ({
        ...prev,
        prices: {
            ...prev.prices,
            [category]: price
        }
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setError(null);
      setFileName(file.name);
      try {
        const data = await extractDataFromFile(file);
        setExtractedRaw(data);
        populateFormWithExtractedData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const populateFormWithExtractedData = (data: ExtractedData) => {
    // CORREÇÃO: Converte array de preços do OCR para objeto Record<string, number>
    const newPrices: Record<string, number> = {};
    if (data.price_table) {
        data.price_table.forEach(p => {
            if (p.price) newPrices[p.category] = p.price;
        });
    }

    setMesh(prev => ({
        ...prev,
        name: data.name || prev.name,
        code: data.code || prev.code,
        width: data.technical_specs?.width_m ? data.technical_specs.width_m * 100 : prev.width,
        grammage: data.technical_specs?.grammage_gsm || prev.grammage,
        yield: data.technical_specs?.yield_m_kg || prev.yield,
        composition: data.composition || prev.composition,
        prices: Object.keys(newPrices).length > 0 ? newPrices : prev.prices,
        complement: data.complement?.name || prev.complement,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!mesh.supplierId) {
        alert("Por favor, selecione um fornecedor.");
        return;
    }
    onSubmit({ ...mesh, id: initialData?.id || Date.now().toString() });
  };
  
  const formTitle = initialData ? 'Editar Malha' : 'Adicionar Nova Malha';

  return (
    <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-6">{formTitle}</h1>
      
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 mb-8 text-center">
            <h2 className="text-xl font-semibold text-black mb-2">Importar Dados com IA (OCR)</h2>
            <p className="text-gray-600 mb-4">Envie uma ficha técnica (PDF, JPG, PNG) para extrair os dados automaticamente.</p>
            <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center justify-center bg-[#72bf03] text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-lime-600 transition-colors duration-300">
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Upload size={20} className="mr-2" />}
                {isLoading ? 'Analisando...' : 'Enviar Arquivo'}
            </label>
            <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} disabled={isLoading} accept=".pdf,.png,.jpg,.jpeg,.xlsx" />
            {fileName && !isLoading && <p className="mt-3 text-sm text-gray-500">Arquivo: {fileName}</p>}
            {error && <p className="mt-3 text-sm text-red-500">Erro: {error}</p>}
        </div>

      <ExtractedInfo mesh={mesh} extracted={extractedRaw} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {supplierName ? (
                <div>
                    <label className="block font-semibold">Fornecedor</label>
                    <input 
                        type="text" 
                        value={supplierName} 
                        readOnly 
                        className="w-full p-2 border rounded bg-gray-100 text-gray-700 cursor-not-allowed" 
                    />
                </div>
            ) : (
                <div>
                    <label className="block font-semibold">Fornecedor</label>
                    <select name="supplierId" value={mesh.supplierId} onChange={handleChange} className="w-full p-2 border rounded bg-white text-gray-900" required>
                        <option value="" disabled>Selecione...</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
            )}
            <div><label className="block font-semibold">Nome da Malha</label><input type="text" name="name" value={mesh.name} onChange={handleChange} className="w-full p-2 border rounded bg-white text-gray-900" required /></div>
            <div className="md:col-span-2"><label className="block font-semibold">Código</label><input type="text" name="code" value={mesh.code} onChange={handleChange} className="w-full p-2 border rounded bg-white text-gray-900" /></div>
            <div><label className="block font-semibold">Largura (cm)</label><input type="number" name="width" value={mesh.width} onChange={handleChange} className="w-full p-2 border rounded bg-white text-gray-900" /></div>
            <div><label className="block font-semibold">Gramatura (g/m²)</label><input type="number" name="grammage" value={mesh.grammage} onChange={handleChange} className="w-full p-2 border rounded bg-white text-gray-900" /></div>
            <div><label className="block font-semibold">Rendimento (m/kg)</label><input type="number" step="0.01" name="yield" value={mesh.yield} onChange={handleChange} className="w-full p-2 border rounded bg-white text-gray-900" /></div>
            <div><label className="block font-semibold">Composição</label><input type="text" name="composition" value={mesh.composition} onChange={handleChange} className="w-full p-2 border rounded bg-white text-gray-900" /></div>
            <div className="md:col-span-2"><label className="block font-semibold">Complemento / Info Extra</label><input type="text" name="complement" value={mesh.complement || ''} onChange={handleChange} className="w-full p-2 border rounded bg-white text-gray-900" /></div>
        </div>

        <div>
            <h3 className="text-xl font-bold mb-2">Preços por Cor (Entrada Manual)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(ColorCategory).map(category => (
                <div key={category}><label className="block font-semibold">{category}</label>
                <input 
                    type="number" 
                    step="0.01" 
                    value={mesh.prices[category] || ''} 
                    onChange={e => handlePriceChange(category, parseFloat(e.target.value))} 
                    className="w-full p-2 border rounded bg-white text-gray-900" 
                /></div>
            ))}
            </div>
        </div>

        <div className="flex justify-end mt-8 space-x-4">
            <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-3 px-8 rounded-lg hover:bg-gray-300 transition-colors duration-300">
                Cancelar
            </button>
            <button type="submit" className="bg-[#72bf03] text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-lime-600 transition-colors duration-300">
                {initialData ? 'Atualizar Malha' : 'Salvar Malha'}
            </button>
        </div>
      </form>
    </div>
  );
};