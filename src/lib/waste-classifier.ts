import { WasteItem, WasteCategory } from '@/types/waste';
import { WASTE_ITEMS, WASTE_CATEGORIES } from '@/data/waste-categories';

export interface ClassificationResult {
  item: WasteItem;
  category: WasteCategory;
  categoryName: string;
  conamaColor: string;
  color: string;
  weight: number;
  funFact: string;
  tip: string;
}

export function classifyWaste(itemId: string): ClassificationResult {
  const item = WASTE_ITEMS.find(i => i.id === itemId)!;
  const category = WASTE_CATEGORIES.find(c => c.id === item.category)!;

  return {
    item,
    category: item.category,
    categoryName: category.name,
    conamaColor: category.conamaColor,
    color: category.color,
    weight: item.weight + Math.floor(Math.random() * 10) - 5,
    funFact: item.funFact,
    tip: category.tip,
  };
}

export function getAnalysisSteps(): string[] {
  return [
    'Escaneando material...',
    'Analisando composicao...',
    'Verificando peso...',
    'Classificando residuo...',
    'Processando resultado...',
  ];
}
