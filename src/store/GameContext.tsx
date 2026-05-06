'use client';

import { createContext, useContext, useEffect, useReducer, useState, type Dispatch, type ReactNode } from 'react';

import { getLevelForXp } from '@/data/levels';
import { readJson, writeJson } from '@/lib/storage';
import { generateDailyQuests, isNewDay, shouldIncrementStreak, shouldResetStreak } from '@/lib/game-engine';
import type { DailyQuest } from '@/types/game';
import type { Redemption } from '@/types/reward';
import type { Student } from '@/types/student';
import type { DisposalRecord } from '@/types/waste';

interface GameState {
  initialStudent: Student;
  student: Student;
  disposals: DisposalRecord[];
  redemptions: Redemption[];
  dailyQuests: DailyQuest[];
  lastDisposalDate: string | null;
}

type GameAction =
  | { type: 'ADD_DISPOSAL'; disposal: DisposalRecord; xpGained: number }
  | { type: 'REDEEM_REWARD'; redemption: Redemption }
  | { type: 'ADD_XP'; amount: number }
  | { type: 'HYDRATE'; saved: unknown }
  | { type: 'RESET' };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ADD_DISPOSAL': {
      const newTotalXp = state.student.totalXp + action.xpGained;
      const newCurrentXp = state.student.currentXp + action.xpGained;
      const newLevel = getLevelForXp(newTotalXp);
      const today = new Date().toISOString();
      let newStreak = state.student.streak;
      const isFirstToday = isNewDay(state.lastDisposalDate);

      if (isFirstToday) {
        if (shouldResetStreak(state.lastDisposalDate)) {
          newStreak = 1;
        } else if (shouldIncrementStreak(state.lastDisposalDate)) {
          newStreak += 1;
        }
      }

      return {
        ...state,
        student: {
          ...state.student,
          totalXp: newTotalXp,
          currentXp: newCurrentXp,
          level: newLevel.level,
          title: newLevel.title,
          streak: newStreak,
        },
        disposals: [action.disposal, ...state.disposals].slice(0, 500),
        dailyQuests: advanceDailyQuests(state.dailyQuests, action.disposal, isFirstToday),
        lastDisposalDate: today,
      };
    }
    case 'REDEEM_REWARD':
      return {
        ...state,
        student: {
          ...state.student,
          currentXp: Math.max(0, state.student.currentXp - action.redemption.xpSpent),
        },
        redemptions: [action.redemption, ...state.redemptions],
      };
    case 'ADD_XP': {
      if (!action.amount) return state;
      const newTotalXp = Math.max(0, state.student.totalXp + action.amount);
      const newCurrentXp = Math.max(0, state.student.currentXp + action.amount);
      const newLevel = getLevelForXp(newTotalXp);
      return {
        ...state,
        student: {
          ...state.student,
          totalXp: newTotalXp,
          currentXp: newCurrentXp,
          level: newLevel.level,
          title: newLevel.title,
        },
      };
    }
    case 'HYDRATE':
      return restoreState(action.saved, state.initialStudent);
    case 'RESET':
      return createInitialState(state.initialStudent);
    default:
      return state;
  }
}

function createInitialState(student: Student): GameState {
  const normalizedStudent = normalizeStudent(student, student);

  return {
    initialStudent: student,
    student: normalizedStudent,
    disposals: [],
    redemptions: [],
    dailyQuests: generateDailyQuests(),
    lastDisposalDate: null,
  };
}

function restoreState(saved: unknown, student: Student): GameState {
  if (!isRecord(saved)) return createInitialState(student);

  const fallback = createInitialState(student);
  const restoredStudent = normalizeStudent(saved.student, student);
  if (restoredStudent.id !== student.id) return fallback;

  return {
    ...fallback,
    student: restoredStudent,
    disposals: Array.isArray(saved.disposals) ? saved.disposals as DisposalRecord[] : fallback.disposals,
    redemptions: Array.isArray(saved.redemptions) ? saved.redemptions as Redemption[] : fallback.redemptions,
    dailyQuests: Array.isArray(saved.dailyQuests) ? saved.dailyQuests as DailyQuest[] : fallback.dailyQuests,
    lastDisposalDate:
      typeof saved.lastDisposalDate === 'string' || saved.lastDisposalDate === null
        ? saved.lastDisposalDate
        : fallback.lastDisposalDate,
  };
}

function normalizeStudent(value: unknown, fallback: Student): Student {
  if (!isRecord(value)) return fallback;

  const totalXp = numberOr(value.totalXp, fallback.totalXp);
  const currentXp = numberOr(value.currentXp, totalXp);
  const level = getLevelForXp(totalXp);

  return {
    ...fallback,
    ...value,
    id: typeof value.id === 'string' ? value.id : fallback.id,
    name: typeof value.name === 'string' ? value.name : fallback.name,
    avatar: typeof value.avatar === 'string' ? value.avatar : fallback.avatar,
    className: typeof value.className === 'string' ? value.className : fallback.className,
    joinedAt: typeof value.joinedAt === 'string' ? value.joinedAt : fallback.joinedAt,
    achievements: Array.isArray(value.achievements) ? value.achievements as string[] : fallback.achievements,
    totalXp,
    currentXp,
    level: level.level,
    title: level.title,
    streak: numberOr(value.streak, fallback.streak),
  };
}

function advanceDailyQuests(
  quests: DailyQuest[],
  disposal: DisposalRecord,
  isFirstDisposalToday: boolean,
): DailyQuest[] {
  return quests.map((quest) => {
    if (quest.current >= quest.target) return quest;

    const increment =
      quest.type === 'descarte'
        ? 1
        : quest.type === 'categoria' && quest.category === disposal.category
          ? 1
          : quest.type === 'streak' && isFirstDisposalToday
            ? 1
            : 0;

    return increment ? { ...quest, current: Math.min(quest.current + increment, quest.target) } : quest;
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

interface GameContextValue {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  spendableXp: number;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({ children, student }: { children: ReactNode; student: Student }) {
  const [hydrated, setHydrated] = useState(false);
  const storageKey = `tech-clear-game-v2-${student.id}`;

  const [state, dispatch] = useReducer(gameReducer, student, (s) => {
    return createInitialState(s);
  });

  useEffect(() => {
    dispatch({ type: 'HYDRATE', saved: readJson<unknown>(storageKey, null) });
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (hydrated) {
      writeJson(storageKey, state);
    }
  }, [state, storageKey, hydrated]);

  const spendableXp = Math.max(0, state.student.currentXp);

  return (
    <GameContext.Provider value={{ state, dispatch, spendableXp }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}
