
import { Fabric, ColorCategory } from "@/types/index";

export const MOCK_FABRICS: Fabric[] = [
  {
    id: 1,
    supplier: "Urbano Têxtil",
    name: "Meia Malha Penteada",
    code: "013001",
    technical_specs: {
      width_cm: 120,
      grammage_gsm: 160,
      yield_m_kg: 2.60,
      composition: "100% Algodão"
    },
    price_list: [
      { category: ColorCategory.Branco, price_kg: 50.22 },
      { category: ColorCategory.Claras, price_kg: 53.53 },
      { category: ColorCategory.EscurasFortes, price_kg: 55.68 },
    ]
  },
  {
    id: 2,
    supplier: "Urbano Têxtil",
    name: "Suedine 100% Algodão",
    code: "76040",
    technical_specs: {
      width_cm: 185,
      grammage_gsm: 210,
      yield_m_kg: 2.57,
      composition: "100% Algodão"
    },
    price_list: [
      { category: ColorCategory.Branco, price_kg: 66.01 },
      { category: ColorCategory.Claras, price_kg: 67.71 },
      { category: ColorCategory.EscurasFortes, price_kg: 70.76 },
      { category: ColorCategory.Extras, price_kg: 73.56 }
    ]
  },
  {
    id: 3,
    supplier: "FN Malhas",
    name: "Moletom PA Peluciado",
    code: "66",
    technical_specs: {
      width_cm: 184,
      grammage_gsm: 310,
      yield_m_kg: 1.75,
      composition: "50% Algodão 50% Poliéster"
    },
    price_list: [
      { category: ColorCategory.Claras, price_kg: 45.30 },
      { category: ColorCategory.EscurasFortes, price_kg: 50.90 },
      { category: ColorCategory.Especiais, price_kg: 54.50 },
      { category: ColorCategory.Mescla, price_kg: 47.30 }
    ]
  },
  {
    id: 4,
    supplier: "FN Malhas",
    name: "Ribana 2x1 Penteada",
    code: "230",
    technical_specs: {
      width_cm: 128,
      grammage_gsm: 290,
      yield_m_kg: 2.70,
      composition: "97% Algodão 3% Elastano"
    },
    price_list: [
      { category: ColorCategory.Claras, price_kg: 52.80 },
      { category: ColorCategory.EscurasFortes, price_kg: 58.70 },
      { category: ColorCategory.Especiais, price_kg: 62.10 },
      { category: ColorCategory.Extras, price_kg: 65.00 }
    ]
  }
];
