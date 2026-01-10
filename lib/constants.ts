import { Supplier, Mesh, ColorCategory } from '@/types';

// --- 1. LISTA OFICIAL DE FORNECEDORES ---
export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: '1', name: 'Urbano Têxtil' },
  { id: '2', name: 'FN Malhas' },
  { id: '3', name: 'Dalila Têxtil' },
  { id: '4', name: 'Menegotti Têxtil' },
  { id: '5', name: 'Aradefe Malhas' },
  { id: '6', name: 'Pemgir Malhas' },
  { id: '7', name: 'LLS Malhas' },
];

// --- 2. TIPOS DE MALHAS ---
export const MESH_TYPES = [
  'Meia Malha',
  'Moletom',
  'Moletinho',
  'Ribana',
  'Canelado',
  'Suedine',
  'Cotton',
  'Piquet',
  'Fleece',
  'Soft',
  'Plush',
  'Performance',
  'Dry',
  'Tricot',
  'Viscolycra',
  'Helanca',
  'Jacquard',
  'Atoalhado',
  'Matelasse',
  'Tweed',
  'Outros'
];

// --- 3. BASE DE DADOS DE MALHAS (AQUI ESTÁ A PARTE QUE O ERRO DIZIA FALTAR) ---
export const INITIAL_MESHES: Mesh[] = [
  // --- URBANO TÊXTIL ---
  { id: 'urb-01', supplierId: '1', code: 'ACT-FLE', name: 'Action Fleece Thermo', composition: 'Poliester', width: 160, grammage: 220, yield: 0, prices: {} },
  { id: 'urb-02', supplierId: '1', code: 'COM-FLE', name: 'Compact Fleece', composition: 'Misto', width: 160, grammage: 0, yield: 0, prices: {} },
  { id: 'urb-03', supplierId: '1', code: 'FLE-3D', name: 'Compact Fleece 3D', composition: 'Poliester', width: 160, grammage: 0, yield: 0, prices: {} },
  { id: 'urb-04', supplierId: '1', code: 'MIC-THE', name: 'Microsoft Thermo', composition: '100% Poliester', width: 160, grammage: 0, yield: 0, prices: {} },
  { id: 'urb-05', supplierId: '1', code: 'PLU-JAC', name: 'Plush Jacquard', composition: 'Algodão/Poliester', width: 150, grammage: 0, yield: 0, prices: {} },
  { id: 'urb-06', supplierId: '1', code: 'SHE-JAC', name: 'Sherpa Jacquard', composition: 'Poliester', width: 160, grammage: 0, yield: 0, prices: {} },
  { id: 'urb-07', supplierId: '1', code: 'SOF-BRU', name: 'Soft Brush', composition: 'Poliester', width: 160, grammage: 0, yield: 0, prices: {} },
  
  // --- ARADEFE MALHAS ---
  { id: 'ara-01', supplierId: '5', code: 'ACT-FIT', name: 'Action Fit', composition: 'Poliamida', width: 160, grammage: 0, yield: 0, prices: {} },
  { id: 'ara-02', supplierId: '5', code: 'AQU-FIT', name: 'Aqua Fit 2.0', composition: 'Poliamida', width: 150, grammage: 0, yield: 0, prices: {} },
  { id: 'ara-03', supplierId: '5', code: 'BOD-3D', name: 'Body Fit 3D', composition: 'Poliamida', width: 140, grammage: 0, yield: 0, prices: {} },
  { id: 'ara-04', supplierId: '5', code: 'ENE-UP', name: 'Energy Up', composition: 'Poliester', width: 160, grammage: 0, yield: 0, prices: {} },
  { id: 'ara-05', supplierId: '5', code: 'POW-FIT', name: 'Power Fit', composition: 'Poliamida', width: 150, grammage: 0, yield: 0, prices: {} },
  
  // --- PEMGIR ---
  { id: 'pem-01', supplierId: '6', code: 'MM-30-1', name: 'M/M 30/1 Penteada Originalle', composition: '100% Algodão', width: 120, grammage: 160, yield: 0, prices: {} },
  { id: 'pem-02', supplierId: '6', code: 'MM-30-OE', name: 'M/M 30/1 OE', composition: '100% Algodão', width: 120, grammage: 160, yield: 0, prices: {} },
  
  // --- MENEGOTTI ---
  { id: 'men-01', supplierId: '4', code: 'MM-NAT', name: 'Meia Malha Naturale', composition: 'Algodão Sustentável', width: 180, grammage: 155, yield: 0, prices: {} },
  { id: 'men-02', supplierId: '4', code: 'MM-LIN', name: 'Meia Malha Linho', composition: 'Misto Linho', width: 160, grammage: 0, yield: 0, prices: {} },
  
  // --- LLS MALHAS ---
  { id: 'lls-01', supplierId: '7', code: 'RIB-1X1', name: 'Ribana 1x1 C/ Elastano', composition: 'Algodão/Elastano', width: 110, grammage: 0, yield: 0, prices: {} },
  { id: 'lls-02', supplierId: '7', code: 'RIB-2X1', name: 'Ribana 2x1 C/ Elastano', composition: 'Algodão/Elastano', width: 110, grammage: 0, yield: 0, prices: {} },
  
  // --- FN MALHAS ---
  { id: 'fn-01', supplierId: '2', code: 'MOL-2CB', name: 'Moletom 2 Cabos PA', composition: '50/50', width: 120, grammage: 0, yield: 0, prices: {} },
  { id: 'fn-02', supplierId: '2', code: 'MOL-3CB', name: 'Moletom 3 Cabos Felpado', composition: '50/50', width: 120, grammage: 0, yield: 0, prices: {} },
  
  // --- DALILA TÊXTIL ---
  { id: 'dal-01', supplierId: '3', code: 'SUE-EGI', name: 'Suedine Egípcio', composition: '100% Algodão Egípcio', width: 180, grammage: 210, yield: 0, prices: {} },
  { id: 'dal-02', supplierId: '3', code: 'SUE-PIM', name: 'Suedine Pima', composition: 'Algodão Pima', width: 180, grammage: 0, yield: 0, prices: {} },
  { id: 'dal-03', supplierId: '3', code: 'COT-30', name: 'Cotton 30/1 Penteado', composition: 'Algodão/Elastano', width: 170, grammage: 0, yield: 0, prices: {} }
];