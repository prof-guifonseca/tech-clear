'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/store/AuthContext';
import { GameProvider } from '@/store/GameContext';
import { getXpForNextLevel } from '@/data/levels';
import { useGame } from '@/store/GameContext';

const NAV_ITEMS = [
  { href: '/inicio', icon: '🏠', label: 'Inicio' },
  { href: '/descarte', icon: '♻️', label: 'Descarte' },
  { href: '/taverna', icon: '🏪', label: 'Taverna' },
  { href: '/ranking', icon: '🏆', label: 'Ranking' },
  { href: '/perfil', icon: '👤', label: 'Perfil' },
];

function XpHeader() {
  const { state } = useGame();
  const { student } = state;
  const xpInfo = getXpForNextLevel(student.totalXp);

  return (
    <header className="bg-navy-light/80 backdrop-blur-sm border-b border-gold/20 px-4 py-2 flex items-center gap-3 sticky top-0 z-40">
      <span className="text-2xl">{student.avatar}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-parchment truncate">{student.name}</span>
          <span className="text-xs text-gold font-heading">Nv.{student.level}</span>
        </div>
        <div className="xp-bar-bg h-2.5 mt-0.5">
          <div className="xp-bar-fill h-full" style={{ width: `${xpInfo.progress}%` }} />
        </div>
        <div className="text-[10px] text-parchment-dark mt-0.5">
          {xpInfo.current} / {xpInfo.needed} XP • {student.title}
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs text-parchment-dark">XP Total</div>
        <div className="text-sm font-bold text-gold">{student.totalXp}</div>
      </div>
    </header>
  );
}

function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-navy-light/95 backdrop-blur-sm border-t border-gold/20 z-40">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-3 transition-all ${
                isActive
                  ? 'text-gold scale-110'
                  : 'text-parchment-dark hover:text-parchment'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-gold mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function StudentContent({ children }: { children: React.ReactNode }) {
  return (
    <>
      <XpHeader />
      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>
      <BottomNav />
    </>
  );
}

export default function AlunoLayout({ children }: { children: React.ReactNode }) {
  const { role, student } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (role !== 'aluno' || !student) {
      router.push('/');
    }
  }, [role, student, router]);

  if (!student) return null;

  return (
    <GameProvider student={student}>
      <div className="min-h-screen flex flex-col max-w-lg mx-auto relative">
        <StudentContent>{children}</StudentContent>
      </div>
    </GameProvider>
  );
}
