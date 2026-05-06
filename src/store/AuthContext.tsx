'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { readJson, removeStorageKey, writeJson } from '@/lib/storage';
import type { Student } from '@/types/student';

type UserRole = 'aluno' | 'professor' | null;

interface AuthState {
  role: UserRole;
  student: Student | null;
  login: (role: UserRole, student?: Student) => void;
  logout: () => void;
}

const STORAGE_KEY = 'tech-clear-auth-v2';
const EMPTY_AUTH = { role: null, student: null } satisfies Pick<AuthState, 'role' | 'student'>;

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<Pick<AuthState, 'role' | 'student'>>(EMPTY_AUTH);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setAuth(restoreAuth(readJson<unknown>(STORAGE_KEY, null)));
    setHydrated(true);
  }, []);

  const login = useCallback((newRole: UserRole, newStudent?: Student) => {
    const nextAuth = { role: newRole, student: newRole === 'aluno' ? newStudent ?? null : null };
    setAuth(nextAuth);
    writeJson(STORAGE_KEY, nextAuth);
  }, []);

  const logout = useCallback(() => {
    setAuth(EMPTY_AUTH);
    removeStorageKey(STORAGE_KEY);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ ...auth, login, logout }),
    [auth, login, logout],
  );

  if (!hydrated) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

function restoreAuth(value: unknown): Pick<AuthState, 'role' | 'student'> {
  if (!isRecord(value)) return EMPTY_AUTH;

  if (value.role === 'professor') return { role: 'professor', student: null };
  if (value.role === 'aluno' && isStudent(value.student)) {
    return { role: 'aluno', student: value.student };
  }

  return EMPTY_AUTH;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStudent(value: unknown): value is Student {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.avatar === 'string' &&
    typeof value.className === 'string' &&
    typeof value.totalXp === 'number'
  );
}
