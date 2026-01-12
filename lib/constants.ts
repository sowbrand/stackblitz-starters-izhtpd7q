import { Supplier, Mesh } from '@/types';

export const INITIAL_SUPPLIERS: Supplier[] = [
  { 
    id: '1', 
    name: 'Urbano Têxtil', 
    contact: 'Carlos Vendas', 
    phone: '(47) 99999-9999', 
    email: 'vendas@urbano.com.br' 
  },
  { 
    id: '2', 
    name: 'FN Malhas', 
    contact: 'Fernanda', 
    phone: '(47) 98888-8888', 
    email: 'comercial@fnmalhas.com.br' 
  },
  { 
    id: '3', 
    name: 'Malhas Pemgir', 
    contact: 'Roberto', 
    phone: '(47) 97777-7777', 
    email: 'pedidos@pemgir.com.br' 
  }
];

export const INITIAL_MESHES: Mesh[] = [
  {
    id: 'm1',
    supplierId: '1',
    code: '76040',
    name: 'SUEDINE',
    composition: '100% ALGODÃO',
    width: 1.85,
    grammage: 210,
    yield: 2.57,
    ncm: '60062100',
    complement: 'Usar com Ribana 050101',
    price: 66.01, // Preço base para compatibilidade
    variations: [
      { id: 'v1', name: 'BRANCO', priceCash: 66.01, priceFactored: 0 },
      { id: 'v2', name: 'CLARA', priceCash: 67.71, priceFactored: 0 },
      { id: 'v3', name: 'MÉDIA', priceCash: 69.21, priceFactored: 0 },
      { id: 'v4', name: 'ESCURA', priceCash: 70.76, priceFactored: 0 },
      { id: 'v5', name: 'EXTRA', priceCash: 73.56, priceFactored: 0 }
    ]
  },
  {
    id: 'm2',
    supplierId: '2',
    code: '66',
    name: 'MOLETOM PA PELUCIADO',
    composition: '50% ALG 50% POL',
    width: 1.84,
    grammage: 310,
    yield: 1.75,
    ncm: '',
    complement: '',
    price: 36.50,
    variations: [
      { id: 'v1', name: 'MESCLA/BRANCO', priceCash: 36.50, priceFactored: 39.50 },
      { id: 'v2', name: 'FORTE', priceCash: 40.70, priceFactored: 42.56 },
      { id: 'v3', name: 'EXTRA', priceCash: 43.30, priceFactored: 45.28 }
    ]
  },
  {
    id: 'm3',
    supplierId: '3',
    code: '0055',
    name: 'MALHA 30.1 PENTEADA',
    composition: '100% ALGODÃO',
    width: 1.20,
    grammage: 160,
    yield: 2.60,
    ncm: '',
    complement: '',
    price: 48.74,
    variations: [
      { id: 'v1', name: 'CLARAS', priceCash: 48.74, priceFactored: 0 },
      { id: 'v2', name: 'ESCURAS', priceCash: 54.53, priceFactored: 0 },
      { id: 'v3', name: 'FORTES', priceCash: 55.96, priceFactored: 0 },
      { id: 'v4', name: 'EXTRA', priceCash: 57.52, priceFactored: 0 }
    ]
  }
];