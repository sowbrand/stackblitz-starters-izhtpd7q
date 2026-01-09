// types/index.ts

export enum ColorCategory {
  Branco = "Branco",
  Claras = "Claras",
  EscurasFortes = "Escuras/Fortes",
  Mescla = "Mescla",
  Especiais = "Especiais",
  Neon = "Neon",
  Preto = "Preto"
}

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

// Interface antiga para compatibilidade, caso algum arquivo ainda use
export interface PriceInfo {
  price: number;
  date: Date;
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
  // O sistema agora usa um mapa de preços (ex: { "Clara": 45.90 })
  prices: Record<string, number>; 
  imageUrl?: string;
  complement?: string; // Adicionado para suportar a lógica do BatchImporter
}

// --- TIPOS DA IA ---

export interface ExtractedData {
  supplier: string;
  name: string;
  code: string;
  technical_specs: {
      width_m: number;
      grammage_gsm: number;
      yield_m_kg: number;
      shrinkage_pct: string;
      torque_pct: string;
  };
  composition: string;
  features: string[];
  usage_indications: string[];
  complement?: { code: string; name: string };
  color_palettes: Array<{ palette_name: string; codes: string[] }>;
  price_table: Array<{ category: string; price: number }>; 
}

export interface BatchProduct {
  supplier_name: string;
  product_code: string;
  product_name: string;
  composition: string;
  specs: {
      width_m: number;
      grammage_gsm: number;
      yield_m_kg?: number; // Opcional, pois a IA as vezes não acha no lote
  };
  // Adicionado para evitar erro no BatchImporter
  complement?: { info: string }; 
  price_list: Array<{
      category_normalized: ColorCategory | string;
      original_category_name: string;
      price_cash_kg: number; 
  }>;
}

export interface ConsolidatedProduct {
  supplier: string;
  code: string;
  name: string;
  is_complement: boolean;
  specs: {
      width_m: number;
      grammage_gsm: number;
      yield_m_kg: number;
      composition: string;
  };
  price_list: Array<{
      category: ColorCategory | string;
      original_label: string;
      price_cash: number; 
  }>;
}

export interface PriceUpdateData {
  supplier_name: string;
  product_code: string;
  product_name: string;
  price_list: Array<{
      category_normalized: ColorCategory | string;
      price_cash_kg: number;
  }>;
}

export interface PriceDatabaseEntry {
  supplier_name: string;
  products: BatchProduct[];
}