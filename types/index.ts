// types/index.ts

export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
}

export interface PriceVariation {
  id: string;
  name: string;          // Ex: "BRANCO", "ESCURA", "MESCLA"
  priceCash: number;     // Preço à Vista (sem impostos/juros)
  priceFactored: number; // Preço Faturado / Cartão (com taxas)
}

export interface Mesh {
  id: string;
  supplierId: string;
  code: string;          // Referência (Ex: 76040)
  name: string;          // Nome do Artigo (Ex: SUEDINE)
  composition: string;   // Ex: 100% Algodão
  width: number;         // Largura em metros
  grammage: number;      // Gramatura g/m²
  yield: number;         // Rendimento m/kg
  ncm?: string;          // Código Fiscal (Opcional)
  complement?: string;   // Obs / Gola sugerida (Opcional)
  
  // Lista de cores e seus respectivos preços
  variations: PriceVariation[]; 
  
  // Campos calculados/legados para compatibilidade visual
  price?: number;        // Geralmente o menor preço à vista
  type?: string;
  imageUrl?: string;
}