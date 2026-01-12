import { Supplier, Mesh } from '@/types';

// --- CORES E CATEGORIAS ---

const SUPPLIER_COLORS = [
  '#333333', // 1. Urbano
  '#F4A261', // 2. FN Malhas
  '#2A9D8F', // 3. Dalila
  '#1D3557', // 4. Menegotti
  '#E63946', // 5. Aradefe
  '#7209B7', // 6. Pemgir
  '#F72585', // 7. LLS
  // Cores extras
  '#4361EE', '#4CC9F0', '#06D6A0', '#FFD166', '#EF476F',
  '#118AB2', '#073B4C', '#FF9F1C', '#CB997E', '#DDBEA9',
  '#A5A58D', '#B7B7A4', '#6B705C', '#9D4EDD', '#5A189A',
  '#3C096C', '#9E2A2B', '#B5838D', '#E5989B', '#6D6875',
  '#355070', '#E56B6F', '#EAAC8B'
];

export const getNextColor = (index: number) => {
    return SUPPLIER_COLORS[index % SUPPLIER_COLORS.length];
};

export const PRODUCT_CATEGORIES = [
  'Suedine', 'Cotton', 'Meia Malha', 'Moletom', 'Ribana', 'Piquet', 'Plush', 'Termic', 'Outros'
];

// --- FORNECEDORES ---

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: '1', name: 'Urbano Têxtil', shortName: 'URBANO', color: SUPPLIER_COLORS[0], contact: 'Carlos', phone: '(47) 9999-9999', email: 'vendas@urbano.com.br' },
  { id: '2', name: 'FN Malhas', shortName: 'FN', color: SUPPLIER_COLORS[1], contact: 'Comercial', phone: '', email: '' },
  { id: '3', name: 'Dalila Têxtil', shortName: 'DALILA', color: SUPPLIER_COLORS[2], contact: '', phone: '', email: '' },
  { id: '4', name: 'Menegotti Têxtil', shortName: 'MENEGOTTI', color: SUPPLIER_COLORS[3], contact: '', phone: '', email: '' },
  { id: '5', name: 'Aradefe Malhas', shortName: 'ARADEFE', color: SUPPLIER_COLORS[4], contact: '', phone: '', email: '' },
  { id: '6', name: 'Pemgir Malhas', shortName: 'PEMGIR', color: SUPPLIER_COLORS[5], contact: 'Roberto', phone: '', email: '' },
  { id: '7', name: 'LLS Malhas', shortName: 'LLS', color: SUPPLIER_COLORS[6], contact: '', phone: '', email: '' }
];

// --- PRODUTOS ---

export const INITIAL_MESHES: Mesh[] = [
  // URBANO
  {
    id: 'u1', supplierId: '1', code: '76040', name: 'SUEDINE 100% ALGODÃO', category: 'Suedine', composition: '100% ALGODÃO', width: 1.85, grammage: 210, yield: 2.57, ncm: '60062100', complement: 'Ribana: 050101', price: 66.01,
    variations: [
      { id: 'v1', name: 'BRANCO', priceCash: 66.01, priceFactored: 0 },
      { id: 'v2', name: 'ESCURA', priceCash: 70.76, priceFactored: 0 }
    ]
  },
  {
    id: 'u2', supplierId: '1', code: '13030', name: 'MALHA MAGLIA EXTRA', category: 'Meia Malha', composition: '100% ALGODÃO', width: 1.20, grammage: 225, yield: 1.85, ncm: '60062100', complement: 'Ribana: 050101', price: 53.07,
    variations: [
      { id: 'v1', name: 'BRANCO', priceCash: 53.07, priceFactored: 0 },
      { id: 'v2', name: 'ESCURA', priceCash: 58.10, priceFactored: 0 }
    ]
  },
  {
    id: 'u3', supplierId: '1', code: '013002', name: 'MALHA PREMIUM 100% CO', category: 'Meia Malha', composition: '100% ALGODÃO', width: 1.20, grammage: 180, yield: 2.31, ncm: '60062100', complement: 'Ribana: 050101', price: 51.83,
    variations: [
      { id: 'v1', name: 'BRANCO', priceCash: 51.83, priceFactored: 0 },
      { id: 'v2', name: 'ESCURA', priceCash: 56.31, priceFactored: 0 }
    ]
  },
  {
    id: 'u4', supplierId: '1', code: '50001', name: 'RIBANA 1X1 98/2', category: 'Ribana', composition: '98% ALG 2% ELAST', width: 0.86, grammage: 250, yield: 2.33, ncm: '60062100', complement: '', price: 66.56,
    variations: [
      { id: 'v1', name: 'BRANCO', priceCash: 66.56, priceFactored: 0 },
      { id: 'v2', name: 'ESCURA', priceCash: 75.49, priceFactored: 0 }
    ]
  },
  {
    id: 'u6', supplierId: '1', code: '026105', name: 'COTTON 92% CO 8% PUE', category: 'Cotton', composition: '92% ALG 8% ELAST', width: 1.80, grammage: 230, yield: 2.42, ncm: '60041012', complement: '', price: 61.16,
    variations: [
      { id: 'v1', name: 'CLARA', priceCash: 61.16, priceFactored: 0 },
      { id: 'v2', name: 'ESCURA', priceCash: 63.76, priceFactored: 0 }
    ]
  },
  
  // FN MALHAS
  {
    id: 'fn1', supplierId: '2', code: '66', name: 'MOLETOM PA PELUCIADO', category: 'Moletom', composition: '50% ALG 50% POL', width: 1.84, grammage: 310, yield: 1.75, ncm: '', complement: '', price: 36.50,
    variations: [
      { id: 'v1', name: 'MESCLA', priceCash: 36.50, priceFactored: 0 },
      { id: 'v2', name: 'FORTE', priceCash: 39.50, priceFactored: 0 },
      { id: 'v3', name: 'ESPECIAL', priceCash: 40.70, priceFactored: 0 }
    ]
  },
  {
    id: 'fn12', supplierId: '2', code: '67', name: 'RIBANA 2X1 C/ ELASTANO', category: 'Ribana', composition: '49% POL 49% ALG 2% ELAST', width: 0.62, grammage: 280, yield: 2.88, ncm: '', complement: '', price: 46.30,
    variations: [
      { id: 'v1', name: 'BRANCO', priceCash: 46.30, priceFactored: 0 },
      { id: 'v2', name: 'MESCLA', priceCash: 47.30, priceFactored: 0 },
      { id: 'v3', name: 'FORTE', priceCash: 50.90, priceFactored: 0 }
    ]
  },
  {
    id: 'fn7', supplierId: '2', code: '196', name: 'COTTON 30/1 PENTEADO', category: 'Cotton', composition: '94% ALG 6% ELAST', width: 1.80, grammage: 180, yield: 3.08, ncm: '', complement: '', price: 54.30,
    variations: [
      { id: 'v1', name: 'BRANCO', priceCash: 54.30, priceFactored: 0 },
      { id: 'v2', name: 'CLARA', priceCash: 56.60, priceFactored: 0 },
      { id: 'v3', name: 'FORTE', priceCash: 57.90, priceFactored: 0 }
    ]
  },
  {
    id: 'fn8', supplierId: '2', code: '7', name: 'M/M 30/1 PENTEADA', category: 'Meia Malha', composition: '100% ALGODÃO', width: 1.20, grammage: 155, yield: 2.68, ncm: '', complement: '', price: 44.50,
    variations: [
      { id: 'v1', name: 'CLARA', priceCash: 44.50, priceFactored: 0 },
      { id: 'v2', name: 'FORTE', priceCash: 47.70, priceFactored: 0 }
    ]
  },

  // PEMGIR (ADICIONADOS E CORRIGIDOS)
  {
    id: 'p1', supplierId: '6', code: '0055', name: 'MALHA 30/1 PENTEADA 100% ALG', category: 'Meia Malha', composition: '100% ALGODÃO', width: 1.20, grammage: 160, yield: 2.60, ncm: '', complement: '', price: 48.74,
    variations: [
      { id: 'v1', name: 'CLARAS', priceCash: 48.74, priceFactored: 0 },
      { id: 'v2', name: 'ESCURAS', priceCash: 54.53, priceFactored: 0 },
      { id: 'v3', name: 'FORTES', priceCash: 55.96, priceFactored: 0 },
      { id: 'v4', name: 'EXTRA', priceCash: 57.52, priceFactored: 0 }
    ]
  },
  {
    id: 'p2', supplierId: '6', code: '0200', name: 'MALHA 24/1 OE 100% ALG', category: 'Meia Malha', composition: '100% ALGODÃO', width: 0.90, grammage: 150, yield: 3.70, ncm: '', complement: '', price: 36.86,
    variations: [
      { id: 'v1', name: 'CLARAS', priceCash: 36.86, priceFactored: 0 },
      { id: 'v2', name: 'ESC/FORTES', priceCash: 42.70, priceFactored: 0 }
    ]
  },
  {
    id: 'p3', supplierId: '6', code: '4550', name: 'MALHÃO PLUS PENT. COLOR', category: 'Meia Malha', composition: '100% ALGODÃO', width: 0.98, grammage: 270, yield: 1.89, ncm: '', complement: 'Malhão pesado', price: 56.53,
    variations: [
      { id: 'v1', name: 'CLARAS', priceCash: 56.53, priceFactored: 0 },
      { id: 'v2', name: 'ESCURAS', priceCash: 62.51, priceFactored: 0 },
      { id: 'v3', name: 'FORTES', priceCash: 63.98, priceFactored: 0 },
      { id: 'v4', name: 'EXTRA', priceCash: 65.31, priceFactored: 0 }
    ]
  },
  {
    id: 'p4', supplierId: '6', code: '0077', name: 'MALHA 30/1 PA TUBULAR', category: 'Meia Malha', composition: '50% ALG 50% POL', width: 1.20, grammage: 160, yield: 2.60, ncm: '', complement: '', price: 39.81,
    variations: [
      { id: 'v1', name: 'CLARAS', priceCash: 39.81, priceFactored: 0 },
      { id: 'v2', name: 'ESC/FORTE', priceCash: 45.51, priceFactored: 0 },
      { id: 'v3', name: 'EXTRAS', priceCash: 48.36, priceFactored: 0 }
    ]
  },
  {
    id: 'p5', supplierId: '6', code: '0780', name: 'MALHA 28/1 PV ANTI PILLING', category: 'Meia Malha', composition: '65% POL 35% VIS', width: 1.20, grammage: 175, yield: 2.40, ncm: '', complement: '', price: 27.46,
    variations: [
      { id: 'v1', name: 'CLARAS', priceCash: 27.46, priceFactored: 0 },
      { id: 'v2', name: 'ESC/FORTE', priceCash: 34.34, priceFactored: 0 },
      { id: 'v3', name: 'EXTRAS', priceCash: 38.48, priceFactored: 0 }
    ]
  },
  {
    id: 'p6', supplierId: '6', code: '0630', name: 'MALHA 30/1 FIADO 100% POL', category: 'Meia Malha', composition: '100% POLIESTER', width: 1.20, grammage: 150, yield: 2.80, ncm: '', complement: '', price: 25.46,
    variations: [
      { id: 'v1', name: 'CLARAS', priceCash: 25.46, priceFactored: 0 },
      { id: 'v2', name: 'ESC/FORTE', priceCash: 29.26, priceFactored: 0 },
      { id: 'v3', name: 'MESCLA', priceCash: 33.20, priceFactored: 0 }
    ]
  },
  {
    id: 'p7', supplierId: '6', code: '0922', name: 'MALHA 30/1 MESCLA PA PENT.', category: 'Meia Malha', composition: '52% POL 48% ALG', width: 1.20, grammage: 160, yield: 2.60, ncm: '', complement: '', price: 41.94,
    variations: [
      { id: 'v1', name: 'MESCLA PA 2%', priceCash: 41.94, priceFactored: 0 },
      { id: 'v2', name: 'MESCLA PA 12%', priceCash: 41.94, priceFactored: 0 },
      { id: 'v3', name: 'MESCLA PA 50% BLACK', priceCash: 43.65, priceFactored: 0 }
    ]
  }
];