'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/store/AuthContext';

const NAV_ITEMS = [
  { href: '/painel', icon: '📊', label: 'Painel' },
  { href: '/turmas', icon: '🏫', label: 'Turmas' },
  { href: '/relatorios', icon: '📈', label: 'Relatorios' },
];

export default function ProfessorLayout({ children }: { children: React.ReactNode }) {
  const { role, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (role !== 'professor') {
      router.push('/');
    }
  }, [role, router]);

  if (role !== 'professor') return null;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-navy-light border-r border-gold/20 flex flex-col sticky top-0 h-screen">
        <div className="p-4 border-b border-gold/20">
          <div className="flex items-center gap-2">
            <span className="text-3xl">♻️</span>
            <div>
              <h1 className="font-heading text-lg font-bold text-gold">Tech Clear</h1>
              <p className="text-xs text-parchment-dark">Painel do Professor</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                  isActive
                    ? 'bg-gold/15 text-gold border border-gold/30'
                    : 'text-parchment-dark hover:text-parchment hover:bg-navy/50'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gold/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-parchment-dark hover:text-ruby transition-all text-sm"
          >
            <span>🚪</span>
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
