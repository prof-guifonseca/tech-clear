export type WasteCategory = 'papel' | 'plastico' | 'vidro' | 'metal' | 'organico' | 'rejeito';

export interface WasteCategoryInfo {
  id: WasteCategory;
  name: string;
  color: string;
  conamaColor: string;
  icon: string;
  xpBase: number;
  tip: string;
}

export interface WasteItem {
  id: string;
  name: string;
  icon: string;
  category: WasteCategory;
  weight: number;
  difficulty: 'facil' | 'medio' | 'dificil';
  funFact: string;
}

export interface DisposalRecord {
  id: string;
  studentId: string;
  itemId: string;
  itemName: string;
  category: WasteCategory;
  xpEarned: number;
  timestamp: string;
  wasCorrect: boolean;
}
