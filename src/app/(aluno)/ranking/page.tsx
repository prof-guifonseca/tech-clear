'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

import { FilterPill, ListRow, SectionKicker, SectionSheet } from '@/components/tech-clear/ui';
import { CLASSES, DEMO_STUDENTS } from '@/data/students';
import { cn } from '@/lib/cn';
import { useGame } from '@/store/GameContext';

type Tab = 'geral' | 'turma';

export default function RankingPage() {
  const { state } = useGame();
  const [tab, setTab] = useState<Tab>('geral');
  const [selectedClass, setSelectedClass] = useState(state.student.className);

  const sortedStudents = DEMO_STUDENTS.toSorted((a, b) => b.totalXp - a.totalXp);
  const classStudents = sortedStudents.filter((student) => student.className === selectedClass);
  const leaderboard = tab === 'geral' ? sortedStudents : classStudents;

  const currentPosition = leaderboard.findIndex((student) => student.id === state.student.id);
  const elite = leaderboard.slice(0, 3);

  return (
    <div className="space-y-4 pb-4">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <SectionSheet tone="hero">
          <div className="space-y-2">
            <SectionKicker>Competicao ativa</SectionKicker>
            <h1 className="font-heading text-[2.3rem] leading-none text-parchment">
              Ranking da guilda
            </h1>
            <p className="text-sm leading-6 text-parchment/64">
              Veja quem esta puxando o ritmo da escola e quanto falta para voce subir mais uma casa.
            </p>
          </div>

          <div className="mt-5 flex items-end justify-between gap-4 rounded-[24px] border border-white/8 bg-white/[0.035] px-4 py-4">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-[0.24em] text-parchment/42">
                Sua posicao
              </p>
              <p className="font-heading text-5xl leading-none text-brass">
                {currentPosition >= 0 ? String(currentPosition + 1).padStart(2, '0') : '--'}
              </p>
              <p className="text-sm text-parchment/62">
                {tab === 'geral' ? 'Ranking geral' : `Turma ${selectedClass}`}
              </p>
            </div>

            <div className="min-w-0 text-right">
              <p className="text-lg font-semibold text-parchment">{state.student.name}</p>
              <p className="text-sm text-parchment/58">{state.student.title}</p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.24em] text-brass/75">
                {state.student.totalXp} XP acumulado
              </p>
            </div>
          </div>
        </SectionSheet>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
      >
        <div className="rounded-full border border-white/8 bg-white/[0.03] p-1">
          <div className="grid grid-cols-2 gap-1">
            <FilterPill
              onClick={() => setTab('geral')}
              active={tab === 'geral'}
              className="border-transparent"
            >
              Geral
            </FilterPill>
            <FilterPill
              onClick={() => setTab('turma')}
              active={tab === 'turma'}
              className="border-transparent"
            >
              Por turma
            </FilterPill>
          </div>
        </div>
      </motion.section>

      {tab === 'turma' ? (
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12, ease: 'easeOut' }}
          className="flex gap-2 overflow-x-auto pb-1"
        >
          {CLASSES.map((className) => (
            <FilterPill
              key={className}
              onClick={() => setSelectedClass(className)}
              active={selectedClass === className}
            >
              Turma {className}
            </FilterPill>
          ))}
        </motion.section>
      ) : null}

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.16, ease: 'easeOut' }}
      >
        <SectionSheet>
          <div className="space-y-2">
            <SectionKicker>Elite do dia</SectionKicker>
            <h2 className="font-heading text-3xl leading-none text-parchment">Top 3 em foco</h2>
          </div>

          <div className="mt-5 space-y-3">
            {elite.map((student, index) => {
              const isCurrentStudent = student.id === state.student.id;

              return (
                <ListRow
                  key={student.id}
                  className={cn(isCurrentStudent && 'border-brass/30 bg-brass/8')}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-sm font-semibold text-brass">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-2xl">
                      {student.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold text-parchment">
                        {student.name}
                        {isCurrentStudent ? ' • voce' : ''}
                      </p>
                      <p className="truncate text-[11px] uppercase tracking-[0.2em] text-parchment/44">
                        Nivel {student.level} • Turma {student.className}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-brass">{student.totalXp}</p>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-parchment/38">XP</p>
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
        transition={{ duration: 0.45, delay: 0.22, ease: 'easeOut' }}
      >
        <SectionSheet>
          <div className="space-y-2">
            <SectionKicker>{tab === 'geral' ? 'Tabela completa' : `Turma ${selectedClass}`}</SectionKicker>
            <h2 className="font-heading text-3xl leading-none text-parchment">Classificacao</h2>
          </div>

          <div className="mt-5 space-y-3">
            {leaderboard.map((student, index) => {
              const isCurrentStudent = student.id === state.student.id;

              return (
                <ListRow
                  key={student.id}
                  className={cn(
                    'transition-colors',
                    isCurrentStudent && 'border-brass/28 bg-brass/8'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-xs font-semibold uppercase tracking-[0.16em] text-parchment/68">
                      {index + 1}
                    </div>
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-xl">
                      {student.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-[15px] font-medium text-parchment">
                          {student.name}
                          {isCurrentStudent ? ' • voce' : ''}
                        </p>
                        <span className="text-sm font-semibold text-brass">{student.totalXp} XP</span>
                      </div>
                      <p className="mt-1 truncate text-[11px] uppercase tracking-[0.2em] text-parchment/42">
                        Nivel {student.level} • {student.title} • Turma {student.className}
                      </p>
                    </div>
                  </div>
                </ListRow>
              );
            })}
          </div>
        </SectionSheet>
      </motion.section>
    </div>
  );
}
