
import React from 'react';
import { Mesh, Supplier, ColorCategory, PriceInfo, Color, ExtractedData } from '../types';
import { extractDataFromFile } from '../services/geminiService';
import { Upload, X, Plus, Info, Palette, Tag, CheckSquare } from 'lucide-react';

interface MeshFormProps {
  onSubmit: (mesh: Mesh) => void;
  suppliers: Supplier[];
  initialData?: Mesh | null;
  preselectedSupplierId?: number | null;
  onCancel: () => void;
}

const Spinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

const ExtractedInfo: React.FC<{mesh: Partial<Mesh>, initialData?: Mesh | null}> = ({ mesh, initialData }) => {
    const hasExtractedData = mesh.features || mesh.usageIndications || mesh.complement || (mesh.colorPalettes && mesh.colorPalettes.length > 0);

    if (!hasExtractedData) return null;

    return (
        <div className="bg-lime-50 border-l-4 border-lime-500 p-4 my-6 rounded-r-lg">
            <div className="flex items-center mb-3">
                <Info size={20} className="text-lime-700 mr-2" />
                <h3 className="text-xl font-bold text-lime-800">Detalhes Extraídos (IA)</h3>
            </div>
            
            {mesh.usageIndications && mesh.usageIndications.length > 0 && (
                 <div className="mb-2">
                    <div className="flex items-center text-sm font-semibold text-gray-700 mb-1"><CheckSquare size={16} className="mr-2"/>Indicações de Uso:</div>
                    <p className="text-sm text-gray-600">{mesh.usageIndications.join(', ')}</p>
                </div>
            )}
            {mesh.complement && (
                 <div className="mb-2">
                    <div className="flex items-center text-sm font-semibold text-gray-700 mb-1"><Plus size={16} className="mr-2"/>Complemento:</div>
                    <p className="text-sm text-gray-600">{mesh.complement.name} ({mesh.complement.code})</p>
                </div>
            )}
            {mesh.features && mesh.features.length > 0 && (
                <div className="mb-2">
                    <div className="flex items-center text-sm font-semibold text-gray-700 mb-1"><Tag size={16} className="mr-2"/>Características:</div>
                    <div className="flex flex-wrap gap-2">
                        {mesh.features.map(f => <span key={f} className="bg-lime-200 text-lime-800 text-xs font-semibold px-2 py-1 rounded-full">{f}</span>)}
                    </div>
                </div>
            )}
            {mesh.colorPalettes && mesh.colorPalettes.length > 0 && (
                 <div className="mb-2">
                    <div className="flex items-center text-sm font-semibold text-gray-700 mb-1"><Palette size={16} className="mr-2"/>Paletas de Cores Identificadas:</div>
                    {mesh.colorPalettes.map(palette => (
                        <div key={palette.palette_name} className="mt-1">
                            <p className="text-xs font-bold text-gray-600 uppercase">{palette.palette_name}:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {palette.codes.map(code => (
                                    <span key={code} className="bg-gray-200 text-gray-800 text-xs font-mono px-2 py-0.5 rounded">
                                        {code}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


export const MeshForm: React.FC<MeshFormProps> = ({ onSubmit, suppliers, initialData, preselectedSupplierId, onCancel }) => {
  const [mesh, setMesh] = React.useState<Omit<Mesh, 'id'>>({
    name: '', code: '', description: '', width: 0, grammage: 0, yield: 0, composition: '',
    shrinkage: '', torque: '', rollWeight: 0, minOrder: 0, prices: [], availableColors: [], colorPalettes: [], supplierId: preselectedSupplierId || 0
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);

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
    setMesh(prev => ({ ...prev, [name]: name === 'supplierId' ? parseInt(value) : value }));
  };

  const handlePriceChange = (category: ColorCategory, price: number) => {
    setMesh(prev => {
      const existing = prev.prices.find(p => p.colorCategory === category);
      if (existing) {
        return { ...prev, prices: prev.prices.map(p => p.colorCategory === category ? { ...p, price } : p) };
      }
      return { ...prev, prices: [...prev.prices, { colorCategory: category, price }] };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setError(null);
      setFileName(file.name);
      try {
        const data = await extractDataFromFile(file);
        populateFormWithExtractedData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const populateFormWithExtractedData = (data: ExtractedData) => {
    const supplier = suppliers.find(s => s.name.toLowerCase() === data.supplier?.toLowerCase());
    
    const mappedPrices: PriceInfo[] = (data.price_table || [])
        .map(p => {
            const categoryEnum = Object.values(ColorCategory).find(c => c === p.category);
            if (categoryEnum && p.price !== null) {
                return { colorCategory: categoryEnum, price: p.price };
            }
            return null;
        })
        .filter((p): p is PriceInfo => p !== null);

    setMesh(prev => ({
        ...prev,
        name: data.name || prev.name,
        code: data.code || prev.code,
        description: data.usage_indications?.join(', ') || prev.description,
        width: data.technical_specs?.width_m ? data.technical_specs.width_m * 100 : prev.width,
        grammage: data.technical_specs?.grammage_gsm || prev.grammage,
        yield: data.technical_specs?.yield_m_kg || prev.yield,
        composition: data.composition || prev.composition,
        shrinkage: data.technical_specs?.shrinkage_pct || prev.shrinkage,
        torque: data.technical_specs?.torque_pct || prev.torque,
        prices: mappedPrices.length > 0 ? mappedPrices : prev.prices,
        features: data.features || prev.features,
        usageIndications: data.usage_indications || prev.usageIndications,
        complement: data.complement || prev.complement,
        colorPalettes: data.color_palettes || prev.colorPalettes,
        supplierId: preselectedSupplierId || (supplier ? supplier.id : prev.supplierId),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(mesh.supplierId === 0) {
        alert("Por favor, selecione um fornecedor.");
        return;
    }
    onSubmit({ ...mesh, id: initialData?.id || Date.now() });
  };
  
  const formTitle = initialData ? 'Editar Malha' : 'Adicionar Nova Malha';

  return (
    <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-6">{formTitle}</h1>
      
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 mb-8 text-center">
            <h2 className="text-xl font-semibold text-black mb-2">Importar Dados com IA (OCR)</h2>
            <p className="text-gray-600 mb-4">Envie uma ficha técnica (PDF, JPG, PNG) para extrair os dados automaticamente.</p>
            <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center justify-center bg-[#72bf03] text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-lime-600 transition-colors duration-300">
                {isLoading ? <Spinner /> : <Upload size={20} className="mr-2" />}
                {isLoading ? 'Analisando...' : 'Enviar Arquivo'}
            </label>
            <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} disabled={isLoading} accept=".pdf,.png,.jpg,.jpeg,.xlsx" />
            {fileName && !isLoading && <p className="mt-3 text-sm text-gray-500">Arquivo: {fileName}</p>}
            {error && <p className="mt-3 text-sm text-red-500">Erro: {error}</p>}
        </div>

      <ExtractedInfo mesh={mesh} initialData={initialData} />

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
                        <option value={0} disabled>Selecione...</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
            )}
            <div><label className="block font-semibold">Nome da Malha</label><input type="text" name="name" value={mesh.name} onChange={handleChange} className="w-full p-2 border rounded bg-white text-gray-900" required /></div>
            <div className="md:col-span-2"><label className="block font-semibold">Código</label><input type="text" name="code" value={mesh.code} onChange={handleChange} className="w-full p-2 border rounded bg-white text-gray-900" /></div>
            <div className="md:col-span-2"><label className="block font-semibold">Descrição / Indicações</label><textarea name="description" value={mesh.description} onChange={handleChange} className="w-full p-2 border rounded bg-white text-gray-900" /></div>
            <div><label className="block font-semibold">Largura (cm)</label><input type="number" name="width" value={mesh.width} onChange={handleChange} className="w-full p-2 border rounded bg-white text-gray-900" /></div>
            <div><label className="block font-semibold">Gramatura (g/m²)</label><input type="number" name="grammage" value={mesh.grammage} onChange={handleChange} className="w-full p-2 border rounded bg-white text-gray-900" /></div>
            <div><label className="block font-semibold">Rendimento (m/kg)</label><input type="number" step="0.01" name="yield" value={mesh.yield} onChange={handleChange} className="w-full p-2 border rounded bg-white text-gray-900" /></div>
            <div><label className="block font-semibold">Composição</label><input type="text" name="composition" value={mesh.composition} onChange={handleChange} className="w-full p-2 border rounded bg-white text-gray-900" /></div>
            <div><label className="block font-semibold">Encolhimento</label><input type="text" name="shrinkage" value={mesh.shrinkage} onChange={handleChange} className="w-full p-2 border rounded bg-white text-gray-900" /></div>
            <div><label className="block font-semibold">Torção</label><input type="text" name="torque" value={mesh.torque} onChange={handleChange} className="w-full p-2 border rounded bg-white text-gray-900" /></div>
            <div><label className="block font-semibold">Peso por Rolo (kg)</label><input type="number" name="rollWeight" value={mesh.rollWeight} onChange={handleChange} className="w-full p-2 border rounded bg-white text-gray-900" /></div>
            <div><label className="block font-semibold">Pedido Mínimo (kg)</label><input type="number" name="minOrder" value={mesh.minOrder} onChange={handleChange} className="w-full p-2 border rounded bg-white text-gray-900" /></div>
        </div>

        <div>
            <h3 className="text-xl font-bold mb-2">Preços por Cor (Entrada Manual)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(ColorCategory).map(category => (
                <div key={category}><label className="block font-semibold">{category}</label><input type="number" step="0.01" value={mesh.prices.find(p => p.colorCategory === category)?.price || ''} onChange={e => handlePriceChange(category, parseFloat(e.target.value))} className="w-full p-2 border rounded bg-white text-gray-900" /></div>
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