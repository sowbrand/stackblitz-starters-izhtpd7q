import { Supplier, Mesh, ColorCategory } from '@/types';

// --- 1. LISTA OFICIAL DE FORNECEDORES ---
export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: '1', name: 'Urbano Têxtil' },    // Foco: Fleece, Soft, Plush, Moletom Diferenciado
  { id: '2', name: 'FN Malhas' },        // Foco: Moletom Básico, Meia Malha
  { id: '3', name: 'Dalila Têxtil' },    // Foco: Premium, Suedine Egípcio, Tricot
  { id: '4', name: 'Menegotti Têxtil' }, // Foco: Sustentável, Linho, Texturas
  { id: '5', name: 'Aradefe Malhas' },   // Foco: Performance, Dry, Sport
  { id: '6', name: 'Pemgir Malhas' },    // Foco: Algodão, Meia Malha, Básicos
  { id: '7', name: 'LLS Malhas' },       // Foco: Ribanas, Golas, Punhos
];

export const MESH_TYPES = [
  'Fleece/Soft', 'Performance/Dry', 'Meia Malha', 'Ribana/Canelado', 
  'Moletom', 'Suedine', 'Cotton', 'Piquet', 'Tricot', 'Outros'
];

// --- 2. BASE DE DADOS DE MALHAS (Sua Lista Completa) ---
export const INITIAL_MESHES: Mesh[] = [
  // --- URBANO TÊXTIL (Inverno/Soft/Plush) ---
  {
    id: 'urb-01', supplierId: '1', code: 'FLE-ACT', name: 'Action Fleece Thermo',
    composition: '100% Poliéster', width: 160, grammage: 220, yield: 2.84, prices: {}, features: ['Térmico']
  },
  {
    id: 'urb-02', supplierId: '1', code: 'COM-FLE', name: 'Compact Fleece',
    composition: 'Algodão/Poliéster', width: 180, grammage: 280, yield: 1.98, prices: {}, features: ['Anti-pilling']
  },
  {
    id: 'urb-03', supplierId: '1', code: 'MIC-THE', name: 'Microsoft Thermo',
    composition: '100% Poliéster', width: 160, grammage: 200, yield: 3.10, prices: {}, features: ['Alta Performance Térmica']
  },
  {
    id: 'urb-04', supplierId: '1', code: 'PLU-JAC', name: 'Plush Jacquard',
    composition: '80% Algodão 20% Poliéster', width: 150, grammage: 240, yield: 2.70, prices: {}
  },
  {
    id: 'urb-05', supplierId: '1', code: 'SHE-JAC', name: 'Sherpa Jacquard',
    composition: '100% Poliéster', width: 160, grammage: 300, yield: 2.08, prices: {}, features: ['Toque Pele de Carneiro']
  },
  {
    id: 'urb-06', supplierId: '1', code: 'SOF-BRU', name: 'Soft Brush',
    composition: '100% Poliéster', width: 160, grammage: 180, yield: 3.40, prices: {}
  },

  // --- ARADEFE MALHAS (Performance/Dry) ---
  {
    id: 'ara-01', supplierId: '5', code: 'ACT-FIT', name: 'Action Fit',
    composition: 'Poliamida/Elastano', width: 160, grammage: 140, yield: 4.46, prices: {}, features: ['Dry', 'UV Protection']
  },
  {
    id: 'ara-02', supplierId: '5', code: 'AQU-FIT', name: 'Aqua Fit 2.0',
    composition: 'Poliamida', width: 150, grammage: 130, yield: 5.10, prices: {}, usageIndications: ['Moda Praia', 'Fitness']
  },
  {
    id: 'ara-03', supplierId: '5', code: 'BOD-3D', name: 'Body Fit 3D',
    composition: 'Poliamida/Elastano', width: 140, grammage: 280, yield: 2.55, prices: {}, features: ['Textura 3D', 'Compressão']
  },
  {
    id: 'ara-04', supplierId: '5', code: 'ENE-UP', name: 'Energy Up Thermo Dry',
    composition: 'Poliéster/Elastano', width: 160, grammage: 220, yield: 2.80, prices: {}, features: ['Térmico', 'Secagem Rápida']
  },
  {
    id: 'ara-05', supplierId: '5', code: 'SUP-POW', name: 'Supplex Power Stretch',
    composition: 'Poliamida/Elastano', width: 150, grammage: 330, yield: 2.00, prices: {}, usageIndications: ['Leggings', 'Alta Compressão']
  },
  {
    id: 'ara-06', supplierId: '5', code: 'ULT-DRY', name: 'Ultracool Dry',
    composition: '100% Poliamida', width: 160, grammage: 110, yield: 5.60, prices: {}
  },

  // --- PEMGIR MALHAS (Algodão/Meia Malha) ---
  {
    id: 'pem-01', supplierId: '6', code: 'MM-30-1', name: 'M/M 30/1 Penteada Originalle',
    composition: '100% Algodão', width: 120, grammage: 160, yield: 2.60, prices: {}
  },
  {
    id: 'pem-02', supplierId: '6', code: 'MM-30-OE', name: 'M/M 30/1 OE',
    composition: '100% Algodão', width: 120, grammage: 150, yield: 2.77, prices: {}
  },
  {
    id: 'pem-03', supplierId: '6', code: 'MM-PA', name: 'M/M 30/1 PA',
    composition: '50% Algodão 50% Poliéster', width: 120, grammage: 160, yield: 2.60, prices: {}
  },
  {
    id: 'pem-04', supplierId: '6', code: 'MM-PV', name: 'Malha 28/1 P.V Vtx Anti Pilling',
    composition: '65% Poliéster 35% Viscose', width: 120, grammage: 170, yield: 2.45, prices: {}, features: ['Anti-pilling']
  },
  {
    id: 'pem-05', supplierId: '6', code: 'MM-PIMA', name: 'Malha Pima',
    composition: '100% Algodão Pima', width: 160, grammage: 150, yield: 4.10, prices: {}, features: ['Toque Premium']
  },

  // --- FN MALHAS (Moletons/Básicos) ---
  {
    id: 'fn-01', supplierId: '2', code: 'MOL-2CB', name: 'Moletom 2 Cabos PA',
    composition: '50% Algodão 50% Poliéster', width: 120, grammage: 280, yield: 1.48, prices: {}
  },
  {
    id: 'fn-02', supplierId: '2', code: 'MOL-3CB', name: 'Moletom 3 Cabos Felpado',
    composition: '50% Algodão 50% Poliéster', width: 120, grammage: 340, yield: 1.20, prices: {}
  },
  {
    id: 'fn-03', supplierId: '2', code: 'MOL-PEL', name: 'Moletom PA Peluciado Ramado',
    composition: '50% Algodão 50% Poliéster', width: 184, grammage: 310, yield: 1.75, prices: {}
  },
  {
    id: 'fn-04', supplierId: '2', code: 'MTI-PA', name: 'Moletinho PA Komfort',
    composition: '50% Algodão 50% Poliéster', width: 160, grammage: 220, yield: 2.80, prices: {}
  },

  // --- DALILA TÊXTIL (Suedine/Premium/Tricot) ---
  {
    id: 'dal-01', supplierId: '3', code: 'SUE-EGI', name: 'Suedine Egípcio',
    composition: '100% Algodão Egípcio', width: 180, grammage: 210, yield: 2.65, prices: {}, features: ['Algodão Nobre']
  },
  {
    id: 'dal-02', supplierId: '3', code: 'SUE-PIM', name: 'Suedine Pima',
    composition: '100% Algodão Pima', width: 180, grammage: 200, yield: 2.77, prices: {}
  },
  {
    id: 'dal-03', supplierId: '3', code: 'TRI-3D', name: 'Tricot 3D',
    composition: 'Viscose/Poliéster', width: 150, grammage: 240, yield: 2.50, prices: {}, features: ['Texturizado']
  },
  {
    id: 'dal-04', supplierId: '3', code: 'COT-EGI', name: 'Cotton Lycra Algodão Egípcio',
    composition: '93% Algodão Egípcio 7% Elastano', width: 170, grammage: 190, yield: 3.10, prices: {}
  },

  // --- MENEGOTTI (Moda/Viscose/Linho) ---
  {
    id: 'men-01', supplierId: '4', code: 'VIS-LYC', name: 'Visco Lycra',
    composition: '96% Viscose 4% Elastano', width: 180, grammage: 190, yield: 2.92, prices: {}
  },
  {
    id: 'men-02', supplierId: '4', code: 'LIN-MOD', name: 'Malha Modal Linho',
    composition: 'Modal/Linho', width: 160, grammage: 170, yield: 3.60, prices: {}, features: ['Natural']
  },
  {
    id: 'men-03', supplierId: '4', code: 'PIQ-USA', name: 'Piquet Ultrasoft',
    composition: '50% Algodão 50% Poliéster', width: 120, grammage: 200, yield: 2.40, prices: {}
  },
  {
    id: 'men-04', supplierId: '4', code: 'JAC-COM', name: 'Jacquard Compact',
    composition: 'Algodão/Poliéster', width: 160, grammage: 230, yield: 2.70, prices: {}
  },

  // --- LLS MALHAS (Ribanas/Golas) ---
  {
    id: 'lls-01', supplierId: '7', code: 'RIB-1X1', name: 'Ribana 1x1 C/ Elastano',
    composition: '97% Algodão 3% Elastano', width: 110, grammage: 230, yield: 3.00, prices: {}
  },
  {
    id: 'lls-02', supplierId: '7', code: 'RIB-2X1', name: 'Ribana 2x1 C/ Elastano',
    composition: '97% Algodão 3% Elastano', width: 110, grammage: 250, yield: 2.80, prices: {}
  },
  {
    id: 'lls-03', supplierId: '7', code: 'RIB-CAN', name: 'Canelado Stretch',
    composition: 'Viscose/Elastano', width: 160, grammage: 280, yield: 2.20, prices: {}
  },
  {
    id: 'lls-04', supplierId: '7', code: 'GOL-PUN', name: 'Jogo Gola/Punho',
    composition: 'Algodão/Poliéster', width: 0, grammage: 0, yield: 0, prices: {}, complement: 'Acessório'
  }
];