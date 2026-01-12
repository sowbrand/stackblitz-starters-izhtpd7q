import { Supplier, Mesh } from '@/types';

// Paleta de 30 cores distintas para fornecedores
const SUPPLIER_COLORS = [
  '#333333', // 1. Urbano (Cinza Escuro/Preto - Profissional)
  '#F4A261', // 2. FN Malhas (Laranja suave - Identidade visual)
  '#2A9D8F', // 3. Dalila (Verde Teal - Elegância)
  '#1D3557', // 4. Menegotti (Azul Marinho Profundo)
  '#E63946', // 5. Aradefe (Vermelho Intenso)
  '#7209B7', // 6. Pemgir (Roxo/Vinho)
  '#F72585', // 7. LLS Malhas (Magenta Vibrante - Extraído do logo)
  
  // 23 Cores Extras para futuros fornecedores
  '#4361EE', '#4CC9F0', '#06D6A0', '#FFD166', '#EF476F',
  '#118AB2', '#073B4C', '#FF9F1C', '#CB997E', '#DDBEA9',
  '#A5A58D', '#B7B7A4', '#6B705C', '#9D4EDD', '#5A189A',
  '#3C096C', '#9E2A2B', '#B5838D', '#E5989B', '#6D6875',
  '#355070', '#E56B6F', '#EAAC8B'
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: '1', name: 'Urbano Têxtil', shortName: 'URBANO', color: SUPPLIER_COLORS[0], contact: '', phone: '', email: '' },
  { id: '2', name: 'FN Malhas', shortName: 'FN', color: SUPPLIER_COLORS[1], contact: '', phone: '', email: '' },
  { id: '3', name: 'Dalila Têxtil', shortName: 'DALILA', color: SUPPLIER_COLORS[2], contact: '', phone: '', email: '' },
  { id: '4', name: 'Menegotti Têxtil', shortName: 'MENEGOTTI', color: SUPPLIER_COLORS[3], contact: '', phone: '', email: '' },
  { id: '5', name: 'Aradefe Malhas', shortName: 'ARADEFE', color: SUPPLIER_COLORS[4], contact: '', phone: '', email: '' },
  { id: '6', name: 'Pemgir Malhas', shortName: 'PEMGIR', color: SUPPLIER_COLORS[5], contact: '', phone: '', email: '' },
  { id: '7', name: 'LLS Malhas', shortName: 'LLS', color: SUPPLIER_COLORS[6], contact: '', phone: '', email: '' }
];

export const INITIAL_MESHES: Mesh[] = [
  {
    id: 'm1',
    supplierId: '1', // Urbano
    code: '76040',
    name: 'SUEDINE 100% ALGODÃO',
    composition: '100% ALGODÃO',
    width: 1.85,
    grammage: 210,
    yield: 2.57,
    ncm: '60062100',
    complement: 'Usar com Ribana 050101',
    price: 66.01, 
    variations: [
      { id: 'v1', name: 'BRANCO', priceCash: 66.01, priceFactored: 0 },
      { id: 'v2', name: 'ESCURA', priceCash: 70.76, priceFactored: 0 }
    ]
  },
  {
    id: 'm2',
    supplierId: '2', // FN
    code: '026105',
    name: 'COTTON 8%',
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

// Helper para pegar a próxima cor disponível
export const getNextColor = (index: number) => {
    return SUPPLIER_COLORS[index % SUPPLIER_COLORS.length];
};