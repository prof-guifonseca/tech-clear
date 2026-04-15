'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

import {
  ListRow,
  MetricPill,
  ProgressBar,
  SectionKicker,
  SectionSheet,
} from '@/components/tech-clear/ui';
import { getXpForNextLevel } from '@/data/levels';
import { cn } from '@/lib/cn';
import { useGame } from '@/store/GameContext';

const SECTION_TRANSITION = {
  duration: 0.45,
  ease: 'easeOut' as const,
};

export default function InicioPage() {
  const { state } = useGame();
  const { student, dailyQuests, disposals } = state;
  const xpInfo = getXpForNextLevel(student.totalXp);

  const todayDisposals = disposals.filter((disposal) => {
    const disposalDate = new Date(disposal.timestamp).toDateString();
    return disposalDate === new Date().toDateString();
  });

  return (
    <div className="space-y-4 pb-4">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SECTION_TRANSITION}
      >
        <SectionSheet tone="hero" className="overflow-hidden">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex size-[4.5rem] shrink-0 items-center justify-center rounded-[26px] border border-brass/25 bg-white/[0.04] text-5xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                {student.avatar}
              </div>
              <div className="min-w-0">
                <SectionKicker>Campanha ativa</SectionKicker>
                <h1 className="mt-2 font-heading text-[2.4rem] leading-none text-parchment">
                  {student.name}
                </h1>
                <p className="mt-2 text-base text-parchment/68">{student.title}</p>
              </div>
            </div>

            <div className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-2 text-right">
              <p className="text-[10px] uppercase tracking-[0.22em] text-parchment/38">Turma</p>
              <p className="text-sm font-semibold text-brass">{student.className}</p>
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
              <span>Sequencia {student.streak} dias</span>
              <span>Nivel {student.level}</span>
            </div>
          </div>

          <Link
            href="/descarte"
            className="mt-6 flex min-h-14 items-center justify-between rounded-full bg-[linear-gradient(180deg,#6EE6B0_0%,#48D597_100%)] px-5 text-ink shadow-[0_18px_42px_rgba(72,213,151,0.2)] transition-transform active:scale-[0.99]"
          >
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-ink/60">Ritual do dia</p>
              <p className="text-base font-semibold">Abrir novo descarte</p>
            </div>
            <span className="text-sm font-semibold uppercase tracking-[0.22em]">Ir agora</span>
          </Link>
        </SectionSheet>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SECTION_TRANSITION, delay: 0.08 }}
        className="flex gap-3 overflow-x-auto pb-1"
      >
        <MetricPill label="Hoje" value={todayDisposals.length} />
        <MetricPill label="Total" value={disposals.length} accentClassName="text-emerald" />
        <MetricPill label="Streak" value={`${student.streak}d`} accentClassName="text-ruby" />
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SECTION_TRANSITION, delay: 0.14 }}
      >
        <SectionSheet>
          <div className="space-y-2">
            <SectionKicker>Rotina do dia</SectionKicker>
            <h2 className="font-heading text-3xl leading-none text-parchment">Missoes abertas</h2>
            <p className="text-sm leading-6 text-parchment/62">
              Priorize o que rende progresso imediato e mantenha a campanha acesa.
            </p>
          </div>

          <div className="mt-5 space-y-3">
            {dailyQuests.map((quest) => {
              const completed = quest.current >= quest.target;
              const progress = Math.round((quest.current / quest.target) * 100);

              return (
                <ListRow key={quest.id} className={cn(completed && 'border-emerald/28 bg-emerald/8')}>
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'flex size-11 shrink-0 items-center justify-center rounded-full border text-sm font-semibold',
                        completed
                          ? 'border-emerald/30 bg-emerald text-ink'
                          : 'border-white/10 bg-white/[0.04] text-brass'
                      )}
                    >
                      {completed ? 'OK' : `${quest.current}/${quest.target}`}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p
                          className={cn(
                            'text-[15px] leading-6 text-parchment',
                            completed && 'text-parchment/62 line-through'
                          )}
                        >
                          {quest.description}
                        </p>
                        <span className="text-sm font-semibold text-brass">+{quest.xpReward} XP</span>
                      </div>
                      <ProgressBar
                        value={progress}
                        className="mt-3 h-1.5"
                        fillClassName={completed ? 'bg-emerald' : undefined}
                      />
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
        transition={{ ...SECTION_TRANSITION, delay: 0.2 }}
      >
        <SectionSheet>
          <div className="space-y-2">
            <SectionKicker>Historico</SectionKicker>
            <h2 className="font-heading text-3xl leading-none text-parchment">Atividade recente</h2>
            <p className="text-sm leading-6 text-parchment/62">
              O feed abaixo mostra o que acabou de fortalecer sua trilha.
            </p>
          </div>

          <div className="mt-5 space-y-3">
            {disposals.length > 0 ? (
              disposals.slice(0, 5).map((disposal, index) => (
                <ListRow key={disposal.id}>
                  <div className="flex items-start gap-3">
                    <div className="relative flex size-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-lg">
                      ♻
                      {index < disposals.slice(0, 5).length - 1 ? (
                        <span className="absolute left-1/2 top-full h-5 w-px -translate-x-1/2 bg-white/8" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[15px] font-medium text-parchment">{disposal.itemName}</p>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-parchment/40">
                            {new Date(disposal.timestamp).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-brass">+{disposal.xpEarned} XP</span>
                      </div>
                    </div>
                  </div>
                </ListRow>
              ))
            ) : (
              <ListRow className="border-dashed text-parchment/62">
                <p className="text-sm leading-6">
                  Seu historico ainda esta vazio. Abra um novo descarte para iniciar a campanha.
                </p>
              </ListRow>
            )}
          </div>
        </SectionSheet>
      </motion.section>
    </div>
  );
}
