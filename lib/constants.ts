
import { Supplier, Mesh, ColorCategory } from '@/types';

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 1, name: 'Aradefe Malhas' },
  { id: 2, name: 'Urbano Têxtil' },
  { id: 3, name: 'FN Malhas' },
  { id: 4, name: 'Pettenati' },
  { id: 5, name: 'Dalila Têxtil' },
  { id: 6, name: 'Menegotti Têxtil' },
  { id: 7, name: 'Pengir Malhas' },
];

export const INITIAL_MESHES: Mesh[] = [
  {
    id: 1,
    name: 'Suedine Premium',
    code: 'SUE-001',
    description: 'Suedine 100% algodão com toque aveludado, ideal para linha bebê.',
    width: 90,
    grammage: 180,
    yield: 3.08,
    composition: '100% Algodão',
    shrinkage: '5% x 5%',
    rollWeight: 15,
    minOrder: 150,
    prices: [
      { colorCategory: ColorCategory.Claras, price: 45.50 },
      { colorCategory: ColorCategory.EscurasFortes, price: 48.90 },
      { colorCategory: ColorCategory.Especiais, price: 52.00 },
      { colorCategory: ColorCategory.Extras, price: 55.00 },
    ],
    availableColors: [
        { code: '001', name: 'Branco', category: ColorCategory.Claras },
        { code: '205', name: 'Preto', category: ColorCategory.EscurasFortes }
    ],
    supplierId: 1,
  },
  {
    id: 2,
    name: 'Ribana Canelada',
    code: 'RIB-C21',
    description: 'Ribana canelada com elastano, ótima para punhos e golas.',
    width: 120,
    grammage: 220,
    yield: 1.89,
    composition: '97% Algodão, 3% Elastano',
    shrinkage: '7% x 4%',
    rollWeight: 20,
    minOrder: 200,
    prices: [
      { colorCategory: ColorCategory.Claras, price: 38.00 },
      { colorCategory: ColorCategory.EscurasFortes, price: 41.50 },
      { colorCategory: ColorCategory.Especiais, price: 44.00 },
      { colorCategory: ColorCategory.Extras, price: 47.00 },
    ],
    availableColors: [
        { code: 'BR', name: 'Branco', category: ColorCategory.Claras },
        { code: 'VM', name: 'Vermelho', category: ColorCategory.EscurasFortes }
    ],
    supplierId: 2,
  },
   {
    id: 3,
    name: 'Suedine Light',
    code: 'SUE-LGT-30',
    description: 'Suedine de algodão penteado fio 30.1, mais leve.',
    width: 92,
    grammage: 160,
    yield: 3.4,
    composition: '100% Algodão',
    shrinkage: '5% x 5%',
    rollWeight: 18,
    minOrder: 100,
    prices: [
      { colorCategory: ColorCategory.Claras, price: 42.00 },
      { colorCategory: ColorCategory.EscurasFortes, price: 44.50 },
      { colorCategory: ColorCategory.Especiais, price: 49.00 },
      { colorCategory: ColorCategory.Extras, price: 53.00 },
    ],
    availableColors: [
        { code: 'AZ-BB', name: 'Azul Bebê', category: ColorCategory.Claras },
        { code: 'MAR', name: 'Marinho', category: ColorCategory.EscurasFortes }
    ],
    supplierId: 5,
  }
];

export const MESH_TYPES = ['Suedine', 'Ribana', 'Meia Malha', 'Moletom', 'Piquet'];
