// types/index.ts

export interface Supplier {
  id: string;
  name: string;
  shortName: string; // Ex: "URBANO"
  color: string;     // Ex: "#FF0000"
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
  composition: string;
  width: number;
  grammage: number;
  yield: number;
  ncm?: string;
  complement?: string;
  variations: PriceVariation[];
  price?: number;
  type?: string;
  imageUrl?: string;
}