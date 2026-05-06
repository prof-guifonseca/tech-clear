import { WasteItem, WasteCategory } from '@/types/waste';
import { WASTE_ITEMS, getCategoryInfo } from '@/data/waste-categories';

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
  const item = WASTE_ITEMS.find((wasteItem) => wasteItem.id === itemId) ?? WASTE_ITEMS[0];
  const category = getCategoryInfo(item.category);

  return {
    item,
    category: item.category,
    categoryName: category.name,
    conamaColor: category.conamaColor,
    color: category.color,
    weight: item.weight + stableWeightOffset(item.id),
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

function stableWeightOffset(id: string): number {
  const hash = Array.from(id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (hash % 11) - 5;
}
