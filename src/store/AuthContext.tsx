'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Student } from '@/types/student';

type UserRole = 'aluno' | 'professor' | null;

interface AuthState {
  role: UserRole;
  student: Student | null;
  login: (role: UserRole, student?: Student) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tech-clear-auth');
      if (saved) {
        const data = JSON.parse(saved);
        setRole(data.role);
        setStudent(data.student);
      }
    } catch {}
    setHydrated(true);
  }, []);

  const login = (newRole: UserRole, newStudent?: Student) => {
    setRole(newRole);
    setStudent(newStudent || null);
    localStorage.setItem('tech-clear-auth', JSON.stringify({ role: newRole, student: newStudent || null }));
  };

  const logout = () => {
    setRole(null);
    setStudent(null);
    localStorage.removeItem('tech-clear-auth');
  };

  if (!hydrated) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ role, student, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
