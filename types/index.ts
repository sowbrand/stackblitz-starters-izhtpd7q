
export enum ColorCategory {
  Branco = 'Branco',
  Claras = 'Claras',
  EscurasFortes = 'Escuras/Fortes',
  Especiais = 'Especiais',
  Extras = 'Extras',
  Mescla = 'Mescla'
}

export interface Color {
  code: string;
  name: string;
  pantone_ref?: string;
  category?: string;
}

export interface PriceInfo {
  colorCategory: ColorCategory;
  price: number;
}

export interface Complement {
    code: string;
    name: string;
}

export interface ColorPalette {
  palette_name: string;
  codes: string[];
}

export interface Mesh {
  id: number;
  name: string;
  code: string;
  description: string;
  width: number; // in cm
  grammage: number; // in g/m²
  yield: number; // in m/kg
  composition: string;
  shrinkage: string;
  torque?: string;
  rollWeight: number; // in kg
  minOrder: number; // in kg
  prices: PriceInfo[];
  supplierId: number;
  features?: string[];
  usageIndications?: string[];
  complement?: Complement | null;
  availableColors: Color[];
  colorPalettes?: ColorPalette[];
}

export interface Supplier {
  id: number;
  name: string;
}

export interface ExtractedData {
    supplier: string;
    name: string;
    code: string;
    technical_specs: {
        width_m: number;
        grammage_gsm: number;
        yield_m_kg: number;
        shrinkage_pct: string;
        torque_pct?: string;
    };
    composition: string;
    features: string[];
    usage_indications: string[];
    complement: Complement | null;
    color_palettes?: ColorPalette[];
    price_table: {
        category: string;
        price: number | null;
    }[];
}

export interface PriceListItem {
  category_normalized: ColorCategory;
  original_category_name: string;
  price_cash_kg: number;
  payment_terms_price?: number;
}

export interface ProductPriceInfo {
  product_code: string;
  product_name: string;
  composition: string;
  specs: {
    width_m: number;
    grammage_gsm: number;
  };
  price_list: PriceListItem[];
}

export interface PriceDatabaseEntry {
  supplier_name: string;
  products: ProductPriceInfo[];
}

export interface ConsolidatedPriceItem {
    category: ColorCategory;
    original_label: string;
    price_cash: number;
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
    price_list: ConsolidatedPriceItem[];
}

export interface PriceUpdatePriceItem {
    category_normalized: ColorCategory;
    price_cash_kg: number;
    payment_terms_price?: number;
}

export interface PriceUpdateData {
    supplier_name: string;
    product_code: string;
    product_name: string;
    price_list: PriceUpdatePriceItem[];
}

export interface BatchTechnicalSpecs {
    width_m: number;
    grammage_gsm: number;
    yield_m_kg: number;
    composition: string;
}

export interface BatchComplement {
    info: string;
}

export interface BatchPriceItem {
    category_normalized: ColorCategory;
    original_category_name: string;
    price_cash_kg: number;
}

export interface BatchProduct {
    supplier_name: string;
    product_code: string;
    product_name: string;
    technical_specs: BatchTechnicalSpecs;
    complement?: BatchComplement;
    price_list: BatchPriceItem[];
}
// Fix: Add missing Fabric type definition.
export interface Fabric {
  id: number;
  supplier: string;
  name: string;
  code: string;
  technical_specs: {
    width_cm: number;
    grammage_gsm: number;
    yield_m_kg: number;
    composition: string;
  };
  price_list: {
    category: ColorCategory;
    price_kg: number;
  }[];
}
