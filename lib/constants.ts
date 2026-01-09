import { Supplier, Mesh, ColorCategory } from '@/types';

// IDs como strings para compatibilidade
export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: '1', name: 'Aradefe Malhas' },
  { id: '2', name: 'Urbano Têxtil' },
  { id: '3', name: 'FN Malhas' },
  { id: '4', name: 'Pettenati' },
  { id: '5', name: 'Diklatex' },
  { id: '6', name: 'Menegotti' },
  { id: '21', name: 'Pengir Malhas' },
];

export const MESH_TYPES = [
  'Meia Malha',
  'Cotton',
  'Viscolycra',
  'Piquet',
  'Moletom',
  'Ribana',
  'Suedine',
  'Plush',
  'Helanca',
  'Dry Fit',
  'Neoprene',
  'Soft',
  'Linho',
  'Jeans',
  'Tactel'
];

// Esta era a constante que faltava e causava o erro no app/compare/page.tsx
export const INITIAL_MESHES: Mesh[] = [
  {
    id: '101',
    supplierId: '2', 
    code: '555.19',
    name: 'MOLETOM PELUCIADO PA',
    composition: '50% Algodão 50% Poliéster',
    width: 110,
    grammage: 300,
    yield: 3.03,
    prices: { 
        [ColorCategory.Claras]: 38.00, 
        [ColorCategory.EscurasFortes]: 42.00 
    },
    complement: 'RIBANA PELUCIADA PA'
  },
  {
    id: '102',
    supplierId: '3', 
    code: '66',
    name: 'MOLETOM PA PELUCIADO RAMADO',
    composition: '50% ALG 50% POL',
    width: 184,
    grammage: 310,
    yield: 1.75,
    prices: { 
        [ColorCategory.Claras]: 45.30, 
        [ColorCategory.EscurasFortes]: 50.90, 
        [ColorCategory.Especiais]: 54.50 
    },
    complement: ''
  }
];