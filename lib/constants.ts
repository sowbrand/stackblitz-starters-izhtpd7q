import { Supplier, Mesh } from '@/types';

// ============================================================================
// CONFIGURAÇÕES GERAIS (CORES E CATEGORIAS)
// ============================================================================

const SUPPLIER_COLORS = [
  '#333333', // 1. Urbano (Preto/Cinza)
  '#F4A261', // 2. FN Malhas (Laranja)
  '#2A9D8F', // 3. Dalila (Verde Teal)
  '#1D3557', // 4. Menegotti (Azul Marinho)
  '#E63946', // 5. Aradefe (Vermelho)
  '#7209B7', // 6. Pemgir (Roxo)
  '#F72585', // 7. LLS Malhas (Magenta)
  // Cores extras para novos fornecedores
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

// ============================================================================
// LISTA DE FORNECEDORES
// ============================================================================

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: '1', name: 'Urbano Têxtil', shortName: 'URBANO', color: SUPPLIER_COLORS[0], contact: 'Carlos', phone: '(47) 9999-9999', email: 'vendas@urbano.com.br' },
  { id: '2', name: 'FN Malhas', shortName: 'FN', color: SUPPLIER_COLORS[1], contact: 'Comercial', phone: '', email: '' },
  { id: '3', name: 'Dalila Têxtil', shortName: 'DALILA', color: SUPPLIER_COLORS[2], contact: '', phone: '', email: '' },
  { id: '4', name: 'Menegotti Têxtil', shortName: 'MENEGOTTI', color: SUPPLIER_COLORS[3], contact: '', phone: '', email: '' },
  { id: '5', name: 'Aradefe Malhas', shortName: 'ARADEFE', color: SUPPLIER_COLORS[4], contact: '', phone: '', email: '' },
  { id: '6', name: 'Pemgir Malhas', shortName: 'PEMGIR', color: SUPPLIER_COLORS[5], contact: 'Roberto', phone: '', email: '' },
  { id: '7', name: 'LLS Malhas', shortName: 'LLS', color: SUPPLIER_COLORS[6], contact: '', phone: '', email: '' }
];

// ============================================================================
// CATÁLOGO DE PRODUTOS COMPLETO
// ============================================================================

export const INITIAL_MESHES: Mesh[] = [
  
  // --- 1. URBANO TÊXTIL -----------------------------------------------------
  {
    id: 'u1', supplierId: '1', code: '76040', name: 'SUEDINE 100% ALGODÃO', category: 'Suedine', composition: '100% ALGODÃO', width: 1.85, grammage: 210, yield: 2.57, ncm: '60062100', complement: 'Ribana: 050101', price: 66.01,
    variations: [
      { id: 'v1', name: 'BRANCO', priceCash: 66.01, priceFactored: 0 },
      { id: 'v2', name: 'CLARA', priceCash: 67.71, priceFactored: 0 },
      { id: 'v3', name: 'MÉDIA', priceCash: 69.21, priceFactored: 0 },
      { id: 'v4', name: 'ESCURA', priceCash: 70.76, priceFactored: 0 },
      { id: 'v5', name: 'EXTRA', priceCash: 73.56, priceFactored: 0 }
    ]
  },
  {
    id: 'u2', supplierId: '1', code: '13030', name: 'MALHA MAGLIA EXTRA', category: 'Meia Malha', composition: '100% ALGODÃO', width: 1.20, grammage: 225, yield: 1.85, ncm: '60062100', complement: 'Ribana: 050101', price: 53.07,
    variations: [
      { id: 'v1', name: 'BRANCO', priceCash: 53.07, priceFactored: 0 },
      { id: 'v2', name: 'CLARA', priceCash: 55.39, priceFactored: 0 },
      { id: 'v3', name: 'MÉDIA', priceCash: 56.89, priceFactored: 0 },
      { id: 'v4', name: 'ESCURA', priceCash: 58.10, priceFactored: 0 },
      { id: 'v5', name: 'EXTRA', priceCash: 59.88, priceFactored: 0 }
    ]
  },
  {
    id: 'u3', supplierId: '1', code: '013002', name: 'MALHA PREMIUM 100% CO', category: 'Meia Malha', composition: '100% ALGODÃO', width: 1.20, grammage: 180, yield: 2.31, ncm: '60062100', complement: 'Ribana: 050101', price: 51.83,
    variations: [
      { id: 'v1', name: 'BRANCO', priceCash: 51.83, priceFactored: 0 },
      { id: 'v2', name: 'CLARA', priceCash: 54.11, priceFactored: 0 },
      { id: 'v3', name: 'MÉDIA', priceCash: 55.61, priceFactored: 0 },
      { id: 'v4', name: 'ESCURA', priceCash: 56.31, priceFactored: 0 },
      { id: 'v5', name: 'EXTRA', priceCash: 57.89, priceFactored: 0 }
    ]
  },
  {
    id: 'u4', supplierId: '1', code: '50001', name: 'RIBANA 1X1 98/2', category: 'Ribana', composition: '98% ALG 2% ELAST', width: 0.86, grammage: 250, yield: 2.33, ncm: '60062100', complement: '', price: 66.56,
    variations: [
      { id: 'v1', name: 'BRANCO', priceCash: 66.56, priceFactored: 0 },
      { id: 'v2', name: 'CLARA', priceCash: 71.86, priceFactored: 0 },
      { id: 'v3', name: 'MÉDIA', priceCash: 73.36, priceFactored: 0 },
      { id: 'v4', name: 'ESCURA', priceCash: 75.49, priceFactored: 0 },
      { id: 'v5', name: 'EXTRA', priceCash: 78.36, priceFactored: 0 }
    ]
  },
  {
    id: 'u5', supplierId: '1', code: '99026', name: 'KIT G/P 100% CO', category: 'Ribana', composition: '100% ALGODÃO', width: 0.42, grammage: 850, yield: 2.80, ncm: '61179000', complement: '', price: 79.84,
    variations: [
      { id: 'v1', name: 'BRANCO', priceCash: 79.84, priceFactored: 0 },
      { id: 'v2', name: 'CLARA', priceCash: 85.43, priceFactored: 0 },
      { id: 'v3', name: 'MÉDIA', priceCash: 86.93, priceFactored: 0 },
      { id: 'v4', name: 'ESCURA', priceCash: 89.12, priceFactored: 0 },
      { id: 'v5', name: 'EXTRA', priceCash: 91.68, priceFactored: 0 }
    ]
  },
  {
    id: 'u6', supplierId: '1', code: '026105', name: 'COTTON 92% CO 8% PUE', category: 'Cotton', composition: '92% ALG 8% ELAST', width: 1.80, grammage: 230, yield: 2.42, ncm: '60041012', complement: '', price: 61.16,
    variations: [
      { id: 'v1', name: 'CLARA', priceCash: 61.16, priceFactored: 0 },
      { id: 'v2', name: 'MÉDIA', priceCash: 62.66, priceFactored: 0 },
      { id: 'v3', name: 'ESCURA', priceCash: 63.76, priceFactored: 0 },
      { id: 'v4', name: 'EXTRA', priceCash: 65.28, priceFactored: 0 }
    ]
  },
  {
    id: 'u7', supplierId: '1', code: '013001', name: 'MALHA 100% CO (160G)', category: 'Meia Malha', composition: '100% ALGODÃO', width: 1.20, grammage: 160, yield: 2.60, ncm: '60062100', complement: 'Ribana: 050001', price: 50.22,
    variations: [
      { id: 'v1', name: 'BRANCO', priceCash: 50.22, priceFactored: 0 },
      { id: 'v2', name: 'CLARA', priceCash: 53.53, priceFactored: 0 },
      { id: 'v3', name: 'MÉDIA', priceCash: 55.03, priceFactored: 0 },
      { id: 'v4', name: 'ESCURA', priceCash: 55.68, priceFactored: 0 },
      { id: 'v5', name: 'EXTRA', priceCash: 57.88, priceFactored: 0 }
    ]
  },
  {
    id: 'u8', supplierId: '1', code: '026102', name: 'COTTON 96% CO 4% PUE', category: 'Cotton', composition: '96% ALG 4% ELAST', width: 1.80, grammage: 190, yield: 2.92, ncm: '60062100', complement: 'Ribana: 050101', price: 57.22,
    variations: [
      { id: 'v1', name: 'BRANCO', priceCash: 57.22, priceFactored: 0 },
      { id: 'v2', name: 'CLARA', priceCash: 60.29, priceFactored: 0 },
      { id: 'v3', name: 'MÉDIA', priceCash: 61.79, priceFactored: 0 },
      { id: 'v4', name: 'ESCURA', priceCash: 62.53, priceFactored: 0 },
      { id: 'v5', name: 'EXTRA', priceCash: 64.59, priceFactored: 0 }
    ]
  },
  {
    id: 'u9', supplierId: '1', code: '050101', name: 'RIBANA 2X1 97/3', category: 'Ribana', composition: '97% ALG 3% ELAST', width: 0.55, grammage: 210, yield: 4.33, ncm: '60062100', complement: '', price: 70.80,
    variations: [
      { id: 'v1', name: 'BRANCO', priceCash: 70.80, priceFactored: 0 },
      { id: 'v2', name: 'CLARA', priceCash: 74.31, priceFactored: 0 },
      { id: 'v3', name: 'MÉDIA', priceCash: 75.87, priceFactored: 0 },
      { id: 'v4', name: 'ESCURA', priceCash: 77.87, priceFactored: 0 },
      { id: 'v5', name: 'EXTRA', priceCash: 80.84, priceFactored: 0 }
    ]
  },

  // --- 2. FN MALHAS ---------------------------------------------------------
  {
    id: 'fn1', supplierId: '2', code: '66', name: 'MOLETOM PA PELUCIADO', category: 'Moletom', composition: '50% ALG 50% POL', width: 1.84, grammage: 310, yield: 1.75, ncm: '', complement: '', price: 36.50,
    variations: [
      { id: 'v1', name: 'MESCLA', priceCash: 36.50, priceFactored: 0 },
      { id: 'v2', name: 'FORTE', priceCash: 39.50, priceFactored: 0 },
      { id: 'v3', name: 'ESPECIAL', priceCash: 40.70, priceFactored: 0 },
      { id: 'v4', name: 'EXTRA', priceCash: 43.30, priceFactored: 0 }
    ]
  },
  {
    id: 'fn2', supplierId: '2', code: '338', name: 'MOLETOM PA PELUCIADO BASIC', category: 'Moletom', composition: '50% ALG 50% POL', width: 1.02, grammage: 270, yield: 1.81, ncm: '', complement: '', price: 31.70,
    variations: [
      { id: 'v1', name: 'MESCLA', priceCash: 31.70, priceFactored: 0 },
      { id: 'v2', name: 'ESPECIAL', priceCash: 35.30, priceFactored: 0 }
    ]
  },
  {
    id: 'fn3', supplierId: '2', code: '307', name: 'MOLETOM PELUCIADO RAJ', category: 'Moletom', composition: '60% POL 40% ALG', width: 1.05, grammage: 320, yield: 1.48, ncm: '', complement: '', price: 28.90,
    variations: [ { id: 'v1', name: 'CLARA', priceCash: 28.90, priceFactored: 0 } ]
  },
  {
    id: 'fn4', supplierId: '2', code: '130', name: 'MOLETOM PELUCIADO LIST', category: 'Moletom', composition: '60% POL 40% ALG', width: 1.05, grammage: 300, yield: 1.59, ncm: '', complement: '', price: 28.90,
    variations: [ { id: 'v1', name: 'CLARA', priceCash: 28.90, priceFactored: 0 } ]
  },
  {
    id: 'fn5', supplierId: '2', code: '105', name: 'MOLETINHO PA BASIC', category: 'Moletom', composition: '50% ALG 50% POL', width: 1.05, grammage: 260, yield: 1.83, ncm: '', complement: '', price: 28.40,
    variations: [
      { id: 'v1', name: 'MESCLA', priceCash: 28.40, priceFactored: 0 },
      { id: 'v2', name: 'ESPECIAL', priceCash: 32.90, priceFactored: 0 }
    ]
  },
  {
    id: 'fn6', supplierId: '2', code: '107', name: 'MOLETINHO CONCEPT PA', category: 'Moletom', composition: '50% ALG 50% POL', width: 1.05, grammage: 220, yield: 2.16, ncm: '', complement: '', price: 36.30,
    variations: [ { id: 'v1', name: 'MESCLA', priceCash: 36.30, priceFactored: 0 } ]
  },
  {
    id: 'fn7', supplierId: '2', code: '106', name: 'MOLETINHO CONCEPT PA', category: 'Moletom', composition: '50% ALG 50% POL', width: 1.05, grammage: 220, yield: 2.16, ncm: '', complement: '', price: 39.90,
    variations: [
      { id: 'v1', name: 'ESPECIAL', priceCash: 39.90, priceFactored: 0 },
      { id: 'v2', name: 'EXTRA', priceCash: 41.90, priceFactored: 0 }
    ]
  },
  {
    id: 'fn8', supplierId: '2', code: '603', name: 'MOLETINHO LINHO', category: 'Moletom', composition: '60% ALG 34% POL 6% LINHO', width: 1.05, grammage: 260, yield: 1.83, ncm: '', complement: '', price: 41.50,
    variations: [ { id: 'v1', name: 'MARFIM', priceCash: 41.50, priceFactored: 0 } ]
  },
  {
    id: 'fn9', supplierId: '2', code: '119', name: 'MOLETINHO KOMFORT RAJ', category: 'Moletom', composition: '60% POL 40% ALG', width: 1.05, grammage: 300, yield: 1.59, ncm: '', complement: '', price: 26.50,
    variations: [ { id: 'v1', name: 'CLARA', priceCash: 26.50, priceFactored: 0 } ]
  },
  {
    id: 'fn10', supplierId: '2', code: '127', name: 'MOLETINHO KOMFORT LIST', category: 'Moletom', composition: '60% POL 40% ALG', width: 1.05, grammage: 290, yield: 1.64, ncm: '', complement: '', price: 26.50,
    variations: [ { id: 'v1', name: 'CLARA', priceCash: 26.50, priceFactored: 0 } ]
  },
  {
    id: 'fn11', supplierId: '2', code: '104', name: 'MOLETINHO PA KOMFORT', category: 'Moletom', composition: '50% ALG 50% POL', width: 1.05, grammage: 260, yield: 1.83, ncm: '', complement: '', price: 29.40,
    variations: [
      { id: 'v1', name: 'MESCLA/BRANCO', priceCash: 29.40, priceFactored: 0 },
      { id: 'v2', name: 'FORTE', priceCash: 32.20, priceFactored: 0 },
      { id: 'v3', name: 'ESPECIAL', priceCash: 33.90, priceFactored: 0 },
      { id: 'v4', name: 'EXTRA', priceCash: 37.40, priceFactored: 0 }
    ]
  },
  {
    id: 'fn12', supplierId: '2', code: '67', name: 'RIBANA 2X1 C/ ELASTANO', category: 'Ribana', composition: '49% POL 49% ALG 2% ELAST', width: 0.62, grammage: 280, yield: 2.88, ncm: '', complement: '', price: 46.30,
    variations: [
      { id: 'v1', name: 'BRANCO', priceCash: 46.30, priceFactored: 0 },
      { id: 'v2', name: 'MESCLA', priceCash: 47.30, priceFactored: 0 },
      { id: 'v3', name: 'FORTE', priceCash: 50.90, priceFactored: 0 },
      { id: 'v4', name: 'ESPECIAL', priceCash: 53.30, priceFactored: 0 },
      { id: 'v5', name: 'EXTRA', priceCash: 56.40, priceFactored: 0 }
    ]
  },
  {
    id: 'fn13', supplierId: '2', code: '390', name: 'MOLETINHO QUADRICULADO', category: 'Moletom', composition: '60% POL 40% ALG', width: 1.05, grammage: 260, yield: 1.83, ncm: '', complement: '', price: 35.50,
    variations: [ { id: 'v1', name: 'QUADRICULADO', priceCash: 35.50, priceFactored: 0 } ]
  },
  {
    id: 'fn14', supplierId: '2', code: '203', name: 'MOLETINHO KOMFORT LISTRADO', category: 'Moletom', composition: '50% ALG 50% POL', width: 1.05, grammage: 260, yield: 1.83, ncm: '', complement: '', price: 35.90,
    variations: [ { id: 'v1', name: 'LISTRADOS', priceCash: 35.90, priceFactored: 0 } ]
  },
  {
    id: 'fn15', supplierId: '2', code: '173', name: 'M/M 30/1 PENTEADA', category: 'Meia Malha', composition: '100% ALGODÃO', width: 1.20, grammage: 180, yield: 2.31, ncm: '', complement: '', price: 44.50,
    variations: [
      { id: 'v1', name: 'PT', priceCash: 44.50, priceFactored: 0 },
      { id: 'v2', name: 'ESTONADAS', priceCash: 64.60, priceFactored: 0 }
    ]
  },
  {
    id: 'fn16', supplierId: '2', code: '3', name: 'RIBANA 1X1 C/ ELAST. P/ MM', category: 'Ribana', composition: '98% ALG 2% ELAST', width: 0.85, grammage: 260, yield: 2.26, ncm: '', complement: '', price: 49.80,
    variations: [
      { id: 'v1', name: 'PT', priceCash: 49.80, priceFactored: 0 },
      { id: 'v2', name: 'ESTONADAS', priceCash: 66.90, priceFactored: 0 }
    ]
  },
  {
    id: 'fn17', supplierId: '2', code: '121', name: 'RIBANA 2X1 C/ELASTANO P/ MM', category: 'Ribana', composition: '98% ALG 2% ELAST', width: 0.62, grammage: 280, yield: 2.88, ncm: '', complement: '', price: 49.80,
    variations: [ { id: 'v1', name: 'PT', priceCash: 49.80, priceFactored: 0 } ]
  },
  {
    id: 'fn18', supplierId: '2', code: '230', name: 'MALHA PIMA - USA', category: 'Meia Malha', composition: '100% ALGODÃO', width: 1.20, grammage: 155, yield: 2.68, ncm: '', complement: '', price: 81.90,
    variations: [
      { id: 'v1', name: 'CLARA', priceCash: 81.90, priceFactored: 0 },
      { id: 'v2', name: 'FORTE', priceCash: 84.90, priceFactored: 0 },
      { id: 'v3', name: 'ESPECIAL', priceCash: 86.90, priceFactored: 0 },
      { id: 'v4', name: 'EXTRA', priceCash: 88.80, priceFactored: 0 }
    ]
  },
  {
    id: 'fn19', supplierId: '2', code: '235', name: 'SUEDINE PIMA - USA', category: 'Suedine', composition: '100% ALGODÃO', width: 0.92, grammage: 210, yield: 2.59, ncm: '', complement: '', price: 83.90,
    variations: [
      { id: 'v1', name: 'CLARA', priceCash: 83.90, priceFactored: 0 },
      { id: 'v2', name: 'FORTE', priceCash: 86.90, priceFactored: 0 },
      { id: 'v3', name: 'ESPECIAL', priceCash: 88.90, priceFactored: 0 },
      { id: 'v4', name: 'EXTRA', priceCash: 90.80, priceFactored: 0 }
    ]
  },
  {
    id: 'fn20', supplierId: '2', code: '277', name: 'RIBANA 1X1 C/ELASTANO P/PIMA', category: 'Ribana', composition: '98% ALG 2% ELAST', width: 0.85, grammage: 260, yield: 2.26, ncm: '', complement: '', price: 52.80,
    variations: [
      { id: 'v1', name: 'CLARA', priceCash: 52.80, priceFactored: 0 },
      { id: 'v2', name: 'FORTE', priceCash: 54.90, priceFactored: 0 },
      { id: 'v3', name: 'ESPECIAL', priceCash: 58.70, priceFactored: 0 },
      { id: 'v4', name: 'EXTRA', priceCash: 59.90, priceFactored: 0 }
    ]
  },
  {
    id: 'fn21', supplierId: '2', code: '237', name: 'RIBANA 2X1 C/ ELASTANO P/PIMA', category: 'Ribana', composition: '98% ALG 2% ELAST', width: 0.62, grammage: 280, yield: 2.88, ncm: '', complement: '', price: 50.30,
    variations: [
      { id: 'v1', name: 'CLARA', priceCash: 50.30, priceFactored: 0 },
      { id: 'v2', name: 'FORTE', priceCash: 54.90, priceFactored: 0 },
      { id: 'v3', name: 'ESPECIAL', priceCash: 57.30, priceFactored: 0 },
      { id: 'v4', name: 'EXTRA', priceCash: 60.40, priceFactored: 0 }
    ]
  },
  {
    id: 'fn22', supplierId: '2', code: '197', name: 'COTTON 30/1 INTIMATE MESCLA', category: 'Cotton', composition: '48% ALG 48% POL 4% ELAST', width: 1.80, grammage: 180, yield: 3.08, ncm: '', complement: '', price: 49.20,
    variations: [ { id: 'v1', name: 'MESCLA', priceCash: 49.20, priceFactored: 0 } ]
  },
  {
    id: 'fn23', supplierId: '2', code: '196', name: 'COTTON 30/1 PENTEADO', category: 'Cotton', composition: '94% ALG 6% ELAST', width: 1.80, grammage: 180, yield: 3.08, ncm: '', complement: '', price: 54.30,
    variations: [
      { id: 'v1', name: 'BRANCO', priceCash: 54.30, priceFactored: 0 },
      { id: 'v2', name: 'CLARA', priceCash: 56.60, priceFactored: 0 },
      { id: 'v3', name: 'FORTE', priceCash: 57.90, priceFactored: 0 },
      { id: 'v4', name: 'ESPECIAL', priceCash: 59.80, priceFactored: 0 },
      { id: 'v5', name: 'EXTRA', priceCash: 63.90, priceFactored: 0 }
    ]
  },
  {
    id: 'fn24', supplierId: '2', code: '121b', name: 'RIBANA 2X1 C/ ELAST. P/ COTTON', category: 'Ribana', composition: '98% ALG 2% ELAST', width: 0.62, grammage: 280, yield: 2.88, ncm: '', complement: '', price: 48.80,
    variations: [
      { id: 'v1', name: 'CLARA', priceCash: 48.80, priceFactored: 0 },
      { id: 'v2', name: 'MESCLA', priceCash: 47.30, priceFactored: 0 },
      { id: 'v3', name: 'FORTE', priceCash: 50.90, priceFactored: 0 },
      { id: 'v4', name: 'ESPECIAL', priceCash: 54.70, priceFactored: 0 },
      { id: 'v5', name: 'EXTRA', priceCash: 55.90, priceFactored: 0 }
    ]
  },
  {
    id: 'fn25', supplierId: '2', code: '7', name: 'M/M 30/1 PENTEADA ORIGINALLE', category: 'Meia Malha', composition: '100% ALGODÃO', width: 1.20, grammage: 155, yield: 2.68, ncm: '', complement: '', price: 44.50,
    variations: [
      { id: 'v1', name: 'CLARA', priceCash: 44.50, priceFactored: 0 },
      { id: 'v2', name: 'FORTE', priceCash: 47.70, priceFactored: 0 },
      { id: 'v3', name: 'ESPECIAL', priceCash: 49.60, priceFactored: 0 },
      { id: 'v4', name: 'EXTRA', priceCash: 51.40, priceFactored: 0 }
    ]
  },
  {
    id: 'fn26', supplierId: '2', code: '3b', name: 'RIBANA 1X1 P/ M/M', category: 'Ribana', composition: '98% ALG 2% ELAST', width: 0.85, grammage: 260, yield: 2.26, ncm: '', complement: '', price: 48.80,
    variations: [
      { id: 'v1', name: 'CLARA', priceCash: 48.80, priceFactored: 0 },
      { id: 'v2', name: 'FORTE', priceCash: 50.90, priceFactored: 0 },
      { id: 'v3', name: 'ESPECIAL', priceCash: 54.70, priceFactored: 0 },
      { id: 'v4', name: 'EXTRA', priceCash: 55.90, priceFactored: 0 }
    ]
  },
  {
    id: 'fn27', supplierId: '2', code: '220', name: 'M/M 30/1 PA', category: 'Meia Malha', composition: '50% ALG 50% POL', width: 1.20, grammage: 155, yield: 2.68, ncm: '', complement: '', price: 33.90,
    variations: [
      { id: 'v1', name: 'BRANCO', priceCash: 33.90, priceFactored: 0 },
      { id: 'v2', name: 'ESPECIAL/NEON', priceCash: 39.30, priceFactored: 0 }
    ]
  },
  {
    id: 'fn28', supplierId: '2', code: '30', name: 'RIBANA 1X1 PA C/ ELASTANO', category: 'Ribana', composition: '49% POL 49% ALG 2% ELAST', width: 0.85, grammage: 260, yield: 2.26, ncm: '', complement: '', price: 50.30,
    variations: [
      { id: 'v1', name: 'BRANCO', priceCash: 50.30, priceFactored: 0 },
      { id: 'v2', name: 'ESPECIAL/NEON', priceCash: 55.90, priceFactored: 0 }
    ]
  },
  {
    id: 'fn29', supplierId: '2', code: '19', name: 'M/M 30/1 MESCLA ORIGINALLE', category: 'Meia Malha', composition: '50% ALG 50% POL', width: 1.20, grammage: 155, yield: 2.68, ncm: '', complement: '', price: 37.90,
    variations: [ { id: 'v1', name: 'MESCLA', priceCash: 37.90, priceFactored: 0 } ]
  },
  {
    id: 'fn30', supplierId: '2', code: '3c', name: 'RIBANA 1X1 MESCLA', category: 'Ribana', composition: '98% ALG 2% ELAST', width: 0.85, grammage: 260, yield: 2.26, ncm: '', complement: '', price: 44.90,
    variations: [ { id: 'v1', name: 'MESCLA', priceCash: 44.90, priceFactored: 0 } ]
  },
  {
    id: 'fn31', supplierId: '2', code: '8', name: 'M/M 30/1 OE', category: 'Meia Malha', composition: '100% ALGODÃO', width: 1.20, grammage: 155, yield: 2.68, ncm: '', complement: '', price: 35.80,
    variations: [
      { id: 'v1', name: 'BRANCA', priceCash: 35.80, priceFactored: 0 },
      { id: 'v2', name: 'ESPECIAL', priceCash: 41.30, priceFactored: 0 }
    ]
  },
  {
    id: 'fn32', supplierId: '2', code: '340', name: 'SUEDINE KOMFORT MESCLA', category: 'Suedine', composition: '50% ALG 50% POL', width: 0.92, grammage: 210, yield: 2.59, ncm: '', complement: '', price: 45.90,
    variations: [ { id: 'v1', name: 'MESCLA', priceCash: 45.90, priceFactored: 0 } ]
  },
  {
    id: 'fn33', supplierId: '2', code: '339', name: 'SUEDINE KOMFORT LISO', category: 'Suedine', composition: '100% ALGODÃO', width: 0.92, grammage: 210, yield: 2.59, ncm: '', complement: '', price: 46.60,
    variations: [
      { id: 'v1', name: 'CLARA', priceCash: 46.60, priceFactored: 0 },
      { id: 'v2', name: 'ESPECIAL', priceCash: 51.90, priceFactored: 0 },
      { id: 'v3', name: 'EXTRA', priceCash: 54.50, priceFactored: 0 }
    ]
  },
  {
    id: 'fn34', supplierId: '2', code: '5', name: 'SUEDINE CANELADO', category: 'Suedine', composition: '100% ALGODÃO', width: 1.03, grammage: 160, yield: 3.00, ncm: '', complement: '', price: 37.90,
    variations: [
      { id: 'v1', name: 'CLARA', priceCash: 37.90, priceFactored: 0 },
      { id: 'v2', name: 'ESPECIAL', priceCash: 42.30, priceFactored: 0 }
    ]
  },
  {
    id: 'fn35', supplierId: '2', code: '117', name: 'SUEDINE PA LISTRADO', category: 'Suedine', composition: '50% ALG 50% POL', width: 0.92, grammage: 210, yield: 2.59, ncm: '', complement: '', price: 37.90,
    variations: [ { id: 'v1', name: 'LISTRADOS', priceCash: 37.90, priceFactored: 0 } ]
  },
  {
    id: 'fn36', supplierId: '2', code: '22', name: 'PIQUET PA', category: 'Piquet', composition: '50% ALG 50% POL', width: 1.20, grammage: 200, yield: 2.40, ncm: '', complement: '', price: 41.60,
    variations: [
      { id: 'v1', name: 'CLARA', priceCash: 41.60, priceFactored: 0 },
      { id: 'v2', name: 'FORTE', priceCash: 44.90, priceFactored: 0 },
      { id: 'v3', name: 'ESPECIAL', priceCash: 46.20, priceFactored: 0 },
      { id: 'v4', name: 'EXTRA', priceCash: 48.90, priceFactored: 0 }
    ]
  },
  {
    id: 'fn37', supplierId: '2', code: '2023', name: 'GOLA/PUNHO', category: 'Ribana', composition: '50% ALG 50% POL', width: 0.43, grammage: 0, yield: 0, ncm: '', complement: '', price: 53.60,
    variations: [
      { id: 'v1', name: 'CLARA', priceCash: 53.60, priceFactored: 0 },
      { id: 'v2', name: 'FORTE', priceCash: 56.90, priceFactored: 0 },
      { id: 'v3', name: 'ESPECIAL', priceCash: 58.20, priceFactored: 0 },
      { id: 'v4', name: 'EXTRA', priceCash: 60.90, priceFactored: 0 }
    ]
  },
  {
    id: 'fn38', supplierId: '2', code: '114', name: 'MALHA CANELADA 2X1', category: 'Outros', composition: '98% ALGODÃO 2% ELASTANO', width: 1.60, grammage: 220, yield: 2.84, ncm: '', complement: '', price: 48.50,
    variations: [
      { id: 'v1', name: 'CLARA', priceCash: 48.50, priceFactored: 0 },
      { id: 'v2', name: 'ESPECIAL', priceCash: 53.60, priceFactored: 0 },
      { id: 'v3', name: 'EXTRA', priceCash: 55.40, priceFactored: 0 }
    ]
  },
  {
    id: 'fn39', supplierId: '2', code: '178', name: 'MALHA CANELADA 1X1', category: 'Outros', composition: '98% ALGODÃO 2% ELASTANO', width: 1.15, grammage: 220, yield: 3.95, ncm: '', complement: '', price: 48.50,
    variations: [
      { id: 'v1', name: 'CLARA', priceCash: 48.50, priceFactored: 0 },
      { id: 'v2', name: 'ESPECIAL', priceCash: 53.60, priceFactored: 0 },
      { id: 'v3', name: 'EXTRA', priceCash: 55.40, priceFactored: 0 }
    ]
  },

  // --- 3. PEMGIR MALHAS -----------------------------------------------------
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
  },
  {
    id: 'p8', supplierId: '6', code: '0783', name: 'MALHA 28/1 PV STONE', category: 'Meia Malha', composition: '65% POL 35% VIS', width: 1.20, grammage: 175, yield: 2.40, ncm: '', complement: '', price: 36.05,
    variations: [ { id: 'v1', name: 'STONE', priceCash: 36.05, priceFactored: 0 } ]
  },
  {
    id: 'p9', supplierId: '6', code: '4429', name: 'MALHA 30/1 PV MESCLA MVS', category: 'Meia Malha', composition: '65% POL 35% VIS', width: 1.20, grammage: 165, yield: 2.52, ncm: '', complement: '', price: 34.44,
    variations: [ { id: 'v1', name: 'MESCLA', priceCash: 34.44, priceFactored: 0 } ]
  }
];