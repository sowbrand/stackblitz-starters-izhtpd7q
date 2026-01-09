import { Supplier, Mesh, ColorCategory } from '@/types';

// --- 1. LISTA OFICIAL DE FORNECEDORES ---
export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: '1', name: 'Urbano Têxtil' },    // Foco: Fleece, Soft, Plush
  { id: '2', name: 'FN Malhas' },        // Foco: Moletom, Básicos
  { id: '3', name: 'Dalila Têxtil' },    // Foco: Suedine, Premium, Tricot
  { id: '4', name: 'Menegotti Têxtil' }, // Foco: Meia Malha, Sustentável
  { id: '5', name: 'Aradefe Malhas' },   // Foco: Performance, Dry
  { id: '6', name: 'Pemgir Malhas' },    // Foco: Algodão, Meia Malha
  { id: '7', name: 'LLS Malhas' },       // Foco: Ribanas, Golas
];

export const MESH_TYPES = [
  'Fleece/Soft', 'Performance/Dry', 'Meia Malha', 'Ribana/Canelado', 
  'Moletom', 'Suedine', 'Cotton', 'Piquet', 'Tricot', 'Outros'
];

// --- 2. BASE DE DADOS DE MALHAS (Sua Lista Real) ---
// Preços definidos como 0.00 para serem atualizados via Importação de Arquivo
export const INITIAL_MESHES: Mesh[] = [
  // --- URBANO TÊXTIL (Fleece, Soft, Plush) ---
  { id: 'urb-01', supplierId: '1', code: 'ACT-FLE', name: 'Action Fleece Thermo', composition: 'Poliester', width: 160, grammage: 220, yield: 0, prices: {} },
  { id: 'urb-02', supplierId: '1', code: 'COM-FLE', name: 'Compact Fleece', composition: 'Misto', width: 160, grammage: 0, yield: 0, prices: {} },
  { id: 'urb-03', supplierId: '1', code: 'FLE-3D', name: 'Compact Fleece 3D', composition: 'Poliester', width: 160, grammage: 0, yield: 0, prices: {} },
  { id: 'urb-04', supplierId: '1', code: 'MIC-THE', name: 'Microsoft Thermo', composition: '100% Poliester', width: 160, grammage: 0, yield: 0, prices: {} },
  { id: 'urb-05', supplierId: '1', code: 'PLU-JAC', name: 'Plush Jacquard', composition: 'Algodão/Poliester', width: 150, grammage: 0, yield: 0, prices: {} },
  { id: 'urb-06', supplierId: '1', code: 'SHE-JAC', name: 'Sherpa Jacquard', composition: 'Poliester', width: 160, grammage: 0, yield: 0, prices: {} },
  { id: 'urb-07', supplierId: '1', code: 'SOF-BRU', name: 'Soft Brush', composition: 'Poliester', width: 160, grammage: 0, yield: 0, prices: {} },
  { id: 'urb-08', supplierId: '1', code: 'SPO-FLE', name: 'Sport Fleece', composition: 'Poliester', width: 160, grammage: 0, yield: 0, prices: {} },
  { id: 'urb-09', supplierId: '1', code: 'UNI-SHE', name: 'Unifloc Sherpa', composition: 'Poliester', width: 160, grammage: 0, yield: 0, prices: {} },

  // --- ARADEFE MALHAS (Performance, Dry) ---
  { id: 'ara-01', supplierId: '5', code: 'ACT-FIT', name: 'Action Fit', composition: 'Poliamida', width: 160, grammage: 0, yield: 0, prices: {} },
  { id: 'ara-02', supplierId: '5', code: 'AQU-FIT', name: 'Aqua Fit 2.0', composition: 'Poliamida', width: 150, grammage: 0, yield: 0, prices: {} },
  { id: 'ara-03', supplierId: '5', code: 'BOD-3D', name: 'Body Fit 3D', composition: 'Poliamida', width: 140, grammage: 0, yield: 0, prices: {} },
  { id: 'ara-04', supplierId: '5', code: 'ENE-UP', name: 'Energy Up', composition: 'Poliester', width: 160, grammage: 0, yield: 0, prices: {} },
  { id: 'ara-05', supplierId: '5', code: 'POW-FIT', name: 'Power Fit', composition: 'Poliamida', width: 150, grammage: 0, yield: 0, prices: {} },
  { id: 'ara-06', supplierId: '5', code: 'SUP-POW', name: 'Supplex Power Stretch', composition: 'Poliamida', width: 150, grammage: 0, yield: 0, prices: {} },
  { id: 'ara-07', supplierId: '5', code: 'ULT-COO', name: 'Ultracool Dry', composition: 'Poliester', width: 160, grammage: 0, yield: 0, prices: {} },
  { id: 'ara-08', supplierId: '5', code: 'ULT-MIC', name: 'Ultramicro Dry', composition: 'Poliamida', width: 160, grammage: 0, yield: 0, prices: {} },

  // --- PEMGIR & MENEGOTTI (Meia Malha) ---
  { id: 'pem-01', supplierId: '6', code: 'MM-30-1', name: 'M/M 30/1 Penteada Originalle', composition: '100% Algodão', width: 120, grammage: 160, yield: 0, prices: {} },
  { id: 'pem-02', supplierId: '6', code: 'MM-30-OE', name: 'M/M 30/1 OE', composition: '100% Algodão', width: 120, grammage: 160, yield: 0, prices: {} },
  { id: 'pem-03', supplierId: '6', code: 'MM-PA', name: 'M/M 30/1 PA', composition: '50/50', width: 120, grammage: 160, yield: 0, prices: {} },
  { id: 'men-01', supplierId: '4', code: 'MM-NAT', name: 'Meia Malha Naturale', composition: 'Algodão Sustentável', width: 180, grammage: 155, yield: 0, prices: {} },
  { id: 'men-02', supplierId: '4', code: 'MM-LIN', name: 'Meia Malha Linho', composition: 'Misto Linho', width: 160, grammage: 0, yield: 0, prices: {} },
  { id: 'men-03', supplierId: '4', code: 'MM-PV', name: 'Meia Malha PV', composition: 'PV', width: 180, grammage: 0, yield: 0, prices: {} },

  // --- LLS MALHAS (Ribana, Canelado) ---
  { id: 'lls-01', supplierId: '7', code: 'RIB-1X1', name: 'Ribana 1x1 C/ Elastano', composition: 'Algodão/Elastano', width: 110, grammage: 0, yield: 0, prices: {} },
  { id: 'lls-02', supplierId: '7', code: 'RIB-2X1', name: 'Ribana 2x1 C/ Elastano', composition: 'Algodão/Elastano', width: 110, grammage: 0, yield: 0, prices: {} },
  { id: 'lls-03', supplierId: '7', code: 'RIB-CAN', name: 'Canelado Stretch', composition: 'Viscose/Elastano', width: 160, grammage: 0, yield: 0, prices: {} },
  { id: 'lls-04', supplierId: '7', code: 'SUE-CAN', name: 'Suedine Canelado', composition: 'Algodão', width: 100, grammage: 0, yield: 0, prices: {} },

  // --- FN MALHAS (Moletom) ---
  { id: 'fn-01', supplierId: '2', code: 'MOL-2CB', name: 'Moletom 2 Cabos PA', composition: '50/50', width: 120, grammage: 0, yield: 0, prices: {} },
  { id: 'fn-02', supplierId: '2', code: 'MOL-3CB', name: 'Moletom 3 Cabos Felpado', composition: '50/50', width: 120, grammage: 0, yield: 0, prices: {} },
  { id: 'fn-03', supplierId: '2', code: 'MOL-PEL', name: 'Moletom PA Peluciado Ramado', composition: '50/50', width: 184, grammage: 310, yield: 0, prices: {} },
  { id: 'fn-04', supplierId: '2', code: 'MTI-PA', name: 'Moletinho PA Komfort', composition: '50/50', width: 160, grammage: 0, yield: 0, prices: {} },

  // --- DALILA TÊXTIL (Suedine, Cotton, Piquet, Tricot) ---
  { id: 'dal-01', supplierId: '3', code: 'SUE-EGI', name: 'Suedine Egípcio', composition: '100% Algodão Egípcio', width: 180, grammage: 210, yield: 0, prices: {} },
  { id: 'dal-02', supplierId: '3', code: 'SUE-PIM', name: 'Suedine Pima', composition: 'Algodão Pima', width: 180, grammage: 0, yield: 0, prices: {} },
  { id: 'dal-03', supplierId: '3', code: 'COT-30', name: 'Cotton 30/1 Penteado', composition: 'Algodão/Elastano', width: 170, grammage: 0, yield: 0, prices: {} },
  { id: 'dal-04', supplierId: '3', code: 'COT-STR', name: 'Cotton Stretch Egípcio', composition: 'Algodão Egípcio', width: 170, grammage: 0, yield: 0, prices: {} },
  { id: 'dal-05', supplierId: '3', code: 'PIQ-PA', name: 'Piquet PA', composition: '50/50', width: 120, grammage: 0, yield: 0, prices: {} },
  { id: 'dal-06', supplierId: '3', code: 'TRI-3D', name: 'Tricot 3D', composition: 'Misto', width: 150, grammage: 0, yield: 0, prices: {} },
  { id: 'dal-07', supplierId: '3', code: 'TRI-VIS', name: 'Tricot Visco Linho', composition: 'Viscose/Linho', width: 160, grammage: 0, yield: 0, prices: {} },

  // --- OUTROS (Viscolycra e Diferenciados - Distribuídos) ---
  { id: 'men-05', supplierId: '4', code: 'VIS-LYC', name: 'Visco Lycra', composition: 'Viscose/Elastano', width: 180, grammage: 0, yield: 0, prices: {} },
  { id: 'dal-08', supplierId: '3', code: 'JAC-QUA', name: 'Jacquard', composition: 'Misto', width: 160, grammage: 0, yield: 0, prices: {} },
  { id: 'ara-09', supplierId: '5', code: 'ATO-FRE', name: 'Mini Atoalhado Fresh', composition: 'Poliamida', width: 150, grammage: 0, yield: 0, prices: {} }
];