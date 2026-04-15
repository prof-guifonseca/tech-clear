'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

import {
  ListRow,
  MetricPill,
  ProgressBar,
  SectionKicker,
  SectionSheet,
} from '@/components/tech-clear/ui';
import { ACHIEVEMENTS } from '@/data/achievements';
import { LEVELS, getXpForNextLevel } from '@/data/levels';
import { WASTE_CATEGORIES } from '@/data/waste-categories';
import { cn } from '@/lib/cn';
import { useAuth } from '@/store/AuthContext';
import { useGame } from '@/store/GameContext';

const RARITY_TONE = {
  comum: 'border-white/10 bg-white/[0.03] text-parchment/72',
  raro: 'border-[#6BA8FF]/30 bg-[#6BA8FF]/10 text-[#B7D2FF]',
  epico: 'border-[#B784FF]/30 bg-[#B784FF]/10 text-[#D8BFFF]',
  lendario: 'border-brass/35 bg-brass/12 text-brass',
} as const;

export default function PerfilPage() {
  const { state, dispatch } = useGame();
  const { logout } = useAuth();
  const router = useRouter();
  const { student, disposals } = state;
  const xpInfo = getXpForNextLevel(student.totalXp);

  const categoryCounts = WASTE_CATEGORIES.map((category) => ({
    ...category,
    count: disposals.filter((disposal) => disposal.category === category.id).length,
  }));

  const unlockedAchievements = ACHIEVEMENTS.filter((achievement) =>
    student.achievements.includes(achievement.id)
  );

  const [selectedAchievementId, setSelectedAchievementId] = useState(
    unlockedAchievements[0]?.id ?? ACHIEVEMENTS[0].id
  );

  const selectedAchievement =
    ACHIEVEMENTS.find((achievement) => achievement.id === selectedAchievementId) ?? ACHIEVEMENTS[0];
  const selectedUnlocked = student.achievements.includes(selectedAchievement.id);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleReset = () => {
    dispatch({ type: 'RESET' });
  };

  return (
    <div className="space-y-4 pb-4">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <SectionSheet tone="hero">
          <div className="flex items-start gap-4">
            <div className="flex size-20 shrink-0 items-center justify-center rounded-[28px] border border-brass/25 bg-white/[0.05] text-5xl">
              {student.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <SectionKicker>Ficha da guilda</SectionKicker>
              <h1 className="mt-2 font-heading text-[2.3rem] leading-none text-parchment">
                {student.name}
              </h1>
              <p className="mt-2 text-base text-parchment/68">{student.title}</p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-parchment/42">
                Turma {student.className} • desde{' '}
                {new Date(student.joinedAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-parchment/52">
              <span>Progresso para o proximo nivel</span>
              <span>{xpInfo.progress}%</span>
            </div>
            <ProgressBar value={xpInfo.progress} className="h-3" />
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] uppercase tracking-[0.22em] text-parchment/44">
              <span>{xpInfo.current} de {xpInfo.needed} XP</span>
              <span>Nivel {student.level}</span>
              <span>Sequencia {student.streak} dias</span>
            </div>
          </div>
        </SectionSheet>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
        className="flex gap-3 overflow-x-auto pb-1"
      >
        <MetricPill label="Nivel" value={student.level} />
        <MetricPill label="XP total" value={student.totalXp} accentClassName="text-brass" />
        <MetricPill label="Streak" value={`${student.streak}d`} accentClassName="text-ruby" />
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.14, ease: 'easeOut' }}
      >
        <SectionSheet>
          <div className="space-y-2">
            <SectionKicker>Acesso rapido</SectionKicker>
            <h2 className="font-heading text-3xl leading-none text-parchment">Seu QR pessoal</h2>
          </div>

          <div className="mt-5 flex flex-col items-center rounded-[28px] border border-white/8 bg-white/[0.03] px-4 py-5">
            <div className="rounded-[24px] bg-white p-4 shadow-[0_20px_50px_rgba(0,0,0,0.16)]">
              <QRCodeSVG value={`techclear:${student.id}`} size={176} />
            </div>
            <p className="mt-4 max-w-[20rem] text-center text-sm leading-6 text-parchment/62">
              Use este codigo na lixeira inteligente para registrar descartes sem perder o ritmo da campanha.
            </p>
          </div>
        </SectionSheet>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.18, ease: 'easeOut' }}
      >
        <SectionSheet>
          <div className="space-y-2">
            <SectionKicker>Mapa de descarte</SectionKicker>
            <h2 className="font-heading text-3xl leading-none text-parchment">
              Categorias trabalhadas
            </h2>
          </div>

          <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
            {categoryCounts.map((category) => (
              <div
                key={category.id}
                className="min-w-[118px] rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3"
              >
                <div className="text-2xl">{category.icon}</div>
                <p className="mt-3 text-2xl font-semibold" style={{ color: category.color }}>
                  {category.count}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-parchment/42">
                  {category.conamaColor}
                </p>
              </div>
            ))}
          </div>
        </SectionSheet>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.22, ease: 'easeOut' }}
      >
        <SectionSheet>
          <div className="space-y-2">
            <SectionKicker>Conquistas</SectionKicker>
            <h2 className="font-heading text-3xl leading-none text-parchment">Colecao da jornada</h2>
          </div>

          <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
            {ACHIEVEMENTS.map((achievement) => {
              const unlocked = student.achievements.includes(achievement.id);

              return (
                <button
                  key={achievement.id}
                  onClick={() => setSelectedAchievementId(achievement.id)}
                  className={cn(
                    'min-w-[124px] rounded-[24px] border px-4 py-4 text-left transition-colors',
                    selectedAchievementId === achievement.id
                      ? 'border-brass/35 bg-brass/12'
                      : unlocked
                        ? 'border-white/10 bg-white/[0.03]'
                        : 'border-white/6 bg-white/[0.02] opacity-45'
                  )}
                >
                  <div className="text-2xl">{achievement.icon}</div>
                  <p className="mt-4 text-[13px] font-medium text-parchment">{achievement.name}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-parchment/42">
                    {unlocked ? 'Liberada' : 'Bloqueada'}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            <ListRow className={cn(RARITY_TONE[selectedAchievement.rarity])}>
              <div className="flex items-start gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-current/20 bg-current/10 text-2xl">
                  {selectedAchievement.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[15px] font-semibold text-parchment">
                        {selectedAchievement.name}
                      </p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-parchment/42">
                        {selectedUnlocked ? 'Conquista liberada' : 'Ainda em progresso'}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-brass">
                      +{selectedAchievement.xpReward} XP
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-parchment/68">
                    {selectedAchievement.description}
                  </p>
                </div>
              </div>
            </ListRow>
          </div>
        </SectionSheet>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.26, ease: 'easeOut' }}
      >
        <SectionSheet>
          <div className="space-y-2">
            <SectionKicker>Escalada</SectionKicker>
            <h2 className="font-heading text-3xl leading-none text-parchment">Trilha de niveis</h2>
          </div>

          <div className="mt-5 space-y-3">
            {LEVELS.map((level) => {
              const reached = student.level >= level.level;
              const current = student.level === level.level;

              return (
                <ListRow
                  key={level.level}
                  className={cn(
                    current && 'border-brass/28 bg-brass/8',
                    reached && !current && 'border-emerald/24 bg-emerald/8'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex size-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold',
                        reached
                          ? 'border-emerald/30 bg-emerald text-ink'
                          : 'border-white/10 bg-white/[0.03] text-parchment/52'
                      )}
                    >
                      {reached ? 'OK' : level.level}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-medium text-parchment">{level.title}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-parchment/40">
                        {level.xpRequired} XP
                      </p>
                    </div>
                  </div>
                </ListRow>
              );
            })}
          </div>
        </SectionSheet>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.3, ease: 'easeOut' }}
        className="grid grid-cols-2 gap-3"
      >
        <button
          onClick={handleReset}
          className="min-h-[3.25rem] rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold uppercase tracking-[0.22em] text-parchment"
        >
          Resetar
        </button>
        <button
          onClick={handleLogout}
          className="min-h-[3.25rem] rounded-full bg-[linear-gradient(180deg,#E5C176_0%,#D6A84B_100%)] px-4 text-sm font-semibold uppercase tracking-[0.22em] text-ink"
        >
          Sair
        </button>
      </motion.section>
    </div>
  );
}
