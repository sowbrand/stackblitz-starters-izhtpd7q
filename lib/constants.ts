import { Supplier, Mesh } from '@/types';

// Categorias Padrão do Sistema
export const PRODUCT_CATEGORIES = [
  'Suedine',
  'Cotton',
  'Meia Malha',
  'Moletom',
  'Ribana',
  'Piquet',
  'Plush',
  'Termic',
  'Outros'
];

// ... (Mantenha o SUPPLIER_COLORS e INITIAL_SUPPLIERS igual ao anterior) ...

// Helper cores (Mantenha igual)
const SUPPLIER_COLORS = ['#333333', '#F4A261', '#2A9D8F', '#1D3557', '#E63946', '#7209B7', '#F72585', '#4361EE', '#4CC9F0', '#06D6A0'];
export const getNextColor = (index: number) => SUPPLIER_COLORS[index % SUPPLIER_COLORS.length];

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: '1', name: 'Urbano Têxtil', shortName: 'URBANO', color: SUPPLIER_COLORS[0] },
  { id: '2', name: 'FN Malhas', shortName: 'FN', color: SUPPLIER_COLORS[1] },
  { id: '3', name: 'Dalila Têxtil', shortName: 'DALILA', color: SUPPLIER_COLORS[2] },
  // ... outros fornecedores
];

// Atualize os produtos iniciais com a categoria
export const INITIAL_MESHES: Mesh[] = [
  {
    id: 'm1',
    supplierId: '1',
    code: '76040',
    name: 'SUEDINE 100% ALGODÃO',
    category: 'Suedine', // <--- Importante
    composition: '100% ALGODÃO',
    width: 1.85,
    grammage: 210,
    yield: 2.57,
    ncm: '60062100',
    complement: 'Usar com Ribana 050101',
    variations: [
      { id: 'v1', name: 'BRANCO', priceCash: 66.01, priceFactored: 0 },
      { id: 'v2', name: 'ESCURA', priceCash: 70.76, priceFactored: 0 }
    ],
    price: 66.01
  },
  {
    id: 'm2',
    supplierId: '2',
    code: '026105',
    name: 'COTTON 8%',
    category: 'Cotton', // <--- Importante
    composition: '92% CO 8% PUE',
    width: 1.80,
    grammage: 230,
    yield: 2.42,
    ncm: '60041012',
    complement: '',
    variations: [
      { id: 'v1', name: 'CLARA', priceCash: 61.16, priceFactored: 0 },
      { id: 'v2', name: 'EXTRA', priceCash: 65.28, priceFactored: 0 }
    ],
    price: 61.16
  }
];