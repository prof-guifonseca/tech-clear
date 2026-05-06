import { getLevelForXp, LEVELS } from '@/data/levels';
import { WasteItem } from '@/types/waste';
import { getCategoryInfo } from '@/data/waste-categories';

export function calculateXpGain(item: WasteItem, streak: number, isFirstToday: boolean): number {
  const categoryInfo = getCategoryInfo(item.category);
  let xp = categoryInfo.xpBase;

  if (item.difficulty === 'medio') xp += 3;
  if (item.difficulty === 'dificil') xp += 5;

  const streakBonus = Math.min(streak * 2, 20);
  xp += streakBonus;

  if (isFirstToday) xp += 15;

  return xp;
}

export function checkLevelUp(previousXp: number, newXp: number): { leveled: boolean; newLevel: number; newTitle: string } {
  const prevLevel = getLevelForXp(previousXp);
  const newLevel = getLevelForXp(newXp);

  if (newLevel.level > prevLevel.level) {
    return { leveled: true, newLevel: newLevel.level, newTitle: newLevel.title };
  }
  return { leveled: false, newLevel: prevLevel.level, newTitle: prevLevel.title };
}

export function getMaxLevel(): number {
  return LEVELS[LEVELS.length - 1].level;
}

export function isNewDay(lastDate: string | null): boolean {
  if (!lastDate) return true;
  return daysSince(lastDate) !== 0;
}

export function shouldIncrementStreak(lastDate: string | null): boolean {
  if (!lastDate) return true;
  return daysSince(lastDate) === 1;
}

export function shouldResetStreak(lastDate: string | null): boolean {
  if (!lastDate) return false;
  return daysSince(lastDate) > 1;
}

export function generateDailyQuests() {
  const categories = ['papel', 'plastico', 'vidro', 'metal', 'organico'] as const;
  const dayIndex = Math.floor(startOfLocalDay(new Date()).getTime() / 86_400_000);
  const category = categories[dayIndex % categories.length];
  const catNames: Record<string, string> = {
    papel: 'papel', plastico: 'plastico', vidro: 'vidro', metal: 'metal', organico: 'organico',
  };

  return [
    {
      id: 'quest-cat',
      description: `Recicle 3 itens de ${catNames[category]} hoje`,
      target: 3,
      current: 0,
      xpReward: 15,
      type: 'categoria' as const,
      category,
    },
    {
      id: 'quest-volume',
      description: 'Faca 5 descartes hoje',
      target: 5,
      current: 0,
      xpReward: 20,
      type: 'descarte' as const,
    },
    {
      id: 'quest-streak',
      description: 'Mantenha sua sequencia de dias ativa',
      target: 1,
      current: 0,
      xpReward: 10,
      type: 'streak' as const,
    },
  ];
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysSince(iso: string): number {
  const last = startOfLocalDay(new Date(iso));
  const today = startOfLocalDay(new Date());
  return Math.round((today.getTime() - last.getTime()) / 86_400_000);
}
