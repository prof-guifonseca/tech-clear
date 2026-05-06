import type { WasteCategory } from './waste';

export interface LevelConfig {
  level: number;
  title: string;
  xpRequired: number;
  perks: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  rarity: 'comum' | 'raro' | 'epico' | 'lendario';
}

export interface DailyQuest {
  id: string;
  description: string;
  target: number;
  current: number;
  xpReward: number;
  type: 'descarte' | 'categoria' | 'streak';
  category?: WasteCategory;
}
