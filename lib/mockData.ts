import { Mesh, ColorCategory } from "@/types/index";

export const MOCK_FABRICS: Mesh[] = [
  {
    id: '1',
    supplierId: '1',
    code: 'MM30.1',
    name: 'Meia Malha 30.1 Penteada',
    composition: '100% Algodão',
    width: 120,
    grammage: 160,
    yield: 2.60,
    prices: {
        [ColorCategory.Branco]: 45.90,
        [ColorCategory.Claras]: 49.90,
        [ColorCategory.EscurasFortes]: 55.90,
        [ColorCategory.Preto]: 52.90
    },
    complement: 'Ribana 1x1',
    imageUrl: 'https://placehold.co/600x400/png'
  },
  {
    id: '2',
    supplierId: '2',
    code: 'PV28.1',
    name: 'Malha PV Anti-pilling',
    composition: '65% Poliéster 35% Viscose',
    width: 120,
    grammage: 175,
    yield: 2.40,
    prices: {
        [ColorCategory.Branco]: 32.50,
        [ColorCategory.Claras]: 34.50,
        [ColorCategory.EscurasFortes]: 38.90,
        [ColorCategory.Mescla]: 36.50
    },
    complement: 'Ribana PV',
    imageUrl: 'https://placehold.co/600x400/png'
  }
];