import { LevelConfig } from '@/types/game';

export const LEVELS: LevelConfig[] = [
  { level: 1, title: 'Aprendiz de Reciclagem', xpRequired: 0, perks: ['Acesso ao descarte'] },
  { level: 2, title: 'Coletor Iniciante', xpRequired: 100, perks: ['Quests diarias'] },
  { level: 3, title: 'Separador Atento', xpRequired: 250, perks: ['Taverna de Trocas'] },
  { level: 4, title: 'Guardiao do Lixo', xpRequired: 500, perks: ['Badge especial'] },
  { level: 5, title: 'Eco-Escudeiro', xpRequired: 800, perks: ['Bonus de XP +10%'] },
  { level: 6, title: 'Cavaleiro Verde', xpRequired: 1200, perks: ['Recompensas exclusivas'] },
  { level: 7, title: 'Protetor da Natureza', xpRequired: 1700, perks: ['Titulo dourado'] },
  { level: 8, title: 'Mestre Reciclador', xpRequired: 2300, perks: ['Ranking VIP'] },
  { level: 9, title: 'Sabio Ambiental', xpRequired: 3000, perks: ['Aura lendaria'] },
  { level: 10, title: 'Lenda da Reciclagem', xpRequired: 4000, perks: ['Titulo maximo'] },
];

export function getLevelForXp(totalXp: number): LevelConfig {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVELS[i].xpRequired) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getXpForNextLevel(totalXp: number): { current: number; needed: number; progress: number } {
  const currentLevel = getLevelForXp(totalXp);
  const nextLevelIndex = LEVELS.findIndex(l => l.level === currentLevel.level) + 1;
  if (nextLevelIndex >= LEVELS.length) {
    return { current: totalXp, needed: totalXp, progress: 100 };
  }
  const nextLevel = LEVELS[nextLevelIndex];
  const current = totalXp - currentLevel.xpRequired;
  const needed = nextLevel.xpRequired - currentLevel.xpRequired;
  const progress = Math.round((current / needed) * 100);
  return { current, needed, progress };
}
