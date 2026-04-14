'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useState } from 'react';
import { Student } from '@/types/student';
import { DisposalRecord } from '@/types/waste';
import { Redemption } from '@/types/reward';
import { DailyQuest } from '@/types/game';
import { getLevelForXp } from '@/data/levels';
import { generateDailyQuests, isNewDay, shouldIncrementStreak, shouldResetStreak } from '@/lib/game-engine';

interface GameState {
  student: Student;
  disposals: DisposalRecord[];
  redemptions: Redemption[];
  dailyQuests: DailyQuest[];
  lastDisposalDate: string | null;
  soundEnabled: boolean;
}

type GameAction =
  | { type: 'ADD_DISPOSAL'; disposal: DisposalRecord; xpGained: number }
  | { type: 'REDEEM_REWARD'; redemption: Redemption }
  | { type: 'UPDATE_QUEST'; questId: string; increment: number }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'SET_STUDENT'; student: Student }
  | { type: 'RESET' };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ADD_DISPOSAL': {
      const newTotalXp = state.student.totalXp + action.xpGained;
      const newLevel = getLevelForXp(newTotalXp);
      const today = new Date().toISOString();
      let newStreak = state.student.streak;

      if (isNewDay(state.lastDisposalDate)) {
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
          currentXp: newTotalXp,
          level: newLevel.level,
          title: newLevel.title,
          streak: newStreak,
        },
        disposals: [action.disposal, ...state.disposals].slice(0, 500),
        lastDisposalDate: today,
      };
    }
    case 'REDEEM_REWARD':
      return {
        ...state,
        student: {
          ...state.student,
          totalXp: state.student.totalXp - action.redemption.xpSpent,
          currentXp: state.student.currentXp - action.redemption.xpSpent,
        },
        redemptions: [action.redemption, ...state.redemptions],
      };
    case 'UPDATE_QUEST':
      return {
        ...state,
        dailyQuests: state.dailyQuests.map(q =>
          q.id === action.questId ? { ...q, current: Math.min(q.current + action.increment, q.target) } : q
        ),
      };
    case 'TOGGLE_SOUND':
      return { ...state, soundEnabled: !state.soundEnabled };
    case 'SET_STUDENT':
      return {
        ...state,
        student: action.student,
      };
    case 'RESET':
      return createInitialState(state.student);
    default:
      return state;
  }
}

function createInitialState(student: Student): GameState {
  return {
    student,
    disposals: [],
    redemptions: [],
    dailyQuests: generateDailyQuests(),
    lastDisposalDate: null,
    soundEnabled: true,
  };
}

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  spendableXp: number;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({ children, student }: { children: ReactNode; student: Student }) {
  const [hydrated, setHydrated] = useState(false);
  const storageKey = `tech-clear-game-${student.id}`;

  const [state, dispatch] = useReducer(gameReducer, student, (s) => {
    return createInitialState(s);
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'SET_STUDENT', student: parsed.student || student });
        if (parsed.disposals) {
          for (const d of parsed.disposals.reverse()) {
            dispatch({ type: 'ADD_DISPOSAL', disposal: d, xpGained: 0 });
          }
        }
      }
    } catch {}
    setHydrated(true);
  }, [storageKey, student]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(storageKey, JSON.stringify(state));
    }
  }, [state, storageKey, hydrated]);

  const totalRedeemed = state.redemptions.reduce((sum, r) => sum + r.xpSpent, 0);
  const spendableXp = state.student.totalXp - totalRedeemed;

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
