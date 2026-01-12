import { Supplier, Mesh } from '@/types';

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: '1', name: 'Urbano Têxtil', contact: '', phone: '', email: '' },
  { id: '2', name: 'FN Malhas', contact: '', phone: '', email: '' },
  { id: '3', name: 'Dalila Têxtil', contact: '', phone: '', email: '' },
  { id: '4', name: 'Menegotti Têxtil', contact: '', phone: '', email: '' },
  { id: '5', name: 'Aradefe Malhas', contact: '', phone: '', email: '' },
  { id: '6', name: 'Pemgir Malhas', contact: '', phone: '', email: '' },
  { id: '7', name: 'LLS Malhas', contact: '', phone: '', email: '' }
];

// Mantendo alguns dados de exemplo para você não começar com o sistema vazio visualmente
export const INITIAL_MESHES: Mesh[] = [
  {
    id: 'm1',
    supplierId: '1',
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
    supplierId: '2', 
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