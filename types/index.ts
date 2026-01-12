export interface Supplier {
  id: string;
  name: string;
  shortName: string;
  color: string;
  contact?: string;
  phone?: string;
  email?: string;
}

export interface PriceVariation {
  id: string;
  name: string;
  priceCash: number;
  priceFactored: number;
}

export interface Mesh {
  id: string;
  supplierId: string;
  code: string;
  name: string;
  category: string; // NOVO CAMPO
  composition: string;
  width: number;
  grammage: number;
  yield: number;
  ncm?: string;
  complement?: string;
  variations: PriceVariation[];
  price?: number; // Mantido para compatibilidade
  type?: string;
  imageUrl?: string;
}