'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { getXpForNextLevel } from '@/data/levels';
import { cn } from '@/lib/cn';
import { ProgressBar } from '@/components/tech-clear/ui';
import { useAuth } from '@/store/AuthContext';
import { CommunityProvider } from '@/store/CommunityContext';
import { GameProvider, useGame } from '@/store/GameContext';

const NAV_ITEMS = [
  { href: '/inicio', label: 'Inicio' },
  { href: '/descarte', label: 'Descarte' },
  { href: '/agora', label: 'Ágora' },
  { href: '/taverna', label: 'Taverna' },
  { href: '/ranking', label: 'Ranking' },
  { href: '/perfil', label: 'Perfil' },
];

function XpHeader() {
  const { state } = useGame();
  const { student } = state;
  const xpInfo = getXpForNextLevel(student.totalXp);

  return (
    <header
      className="sticky top-0 z-40 px-4"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}
    >
      <div className="rounded-[28px] border border-white/10 bg-ink/72 px-4 py-3 backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.28)]">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-full border border-brass/25 bg-brass/10 text-2xl">
            {student.avatar}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-parchment">{student.name}</p>
                <p className="truncate text-[10px] uppercase tracking-[0.24em] text-brass/70">
                  Nivel {student.level} • {student.title}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.2em] text-parchment/36">XP total</p>
                <p className="text-sm font-semibold text-brass">{student.totalXp}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <ProgressBar value={xpInfo.progress} className="h-2 flex-1" />
              <span className="text-[10px] uppercase tracking-[0.18em] text-parchment/42">
                {xpInfo.current}/{xpInfo.needed}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4">
      <nav
        className="pointer-events-auto w-full max-w-md pb-4"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)' }}
      >
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-ink/84 p-2 backdrop-blur-xl shadow-[0_16px_45px_rgba(0,0,0,0.35)]">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex min-h-11 flex-1 items-center justify-center rounded-full px-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] transition-colors',
                  isActive ? 'bg-white/[0.06] text-parchment' : 'text-parchment/46 hover:text-parchment/78'
                )}
              >
                <span className="relative">
                  {item.label}
                  {isActive ? (
                    <span className="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brass" />
                  ) : null}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function StudentShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-ink text-parchment">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(214,168,75,0.08),transparent_26%),radial-gradient(circle_at_14%_18%,rgba(72,213,151,0.08),transparent_28%),linear-gradient(180deg,rgba(11,16,32,0.96),rgba(8,12,24,1))]" />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col">
        <XpHeader />
        <main className="flex-1 overflow-x-hidden px-4 pb-32 pt-4">{children}</main>
        <BottomNav />
      </div>
    </div>
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
      <CommunityProvider>
        <StudentShell>{children}</StudentShell>
      </CommunityProvider>
    </GameProvider>
  );
}
