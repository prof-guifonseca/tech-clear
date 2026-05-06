'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import { FilterPill, ListRow, SectionKicker, SectionSheet } from '@/components/tech-clear/ui';
import { CLASSES, DEMO_STUDENTS } from '@/data/students';
import { generateClassStats } from '@/data/mock-history';
import { cn } from '@/lib/cn';

export default function TurmasPage() {
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);
  const classStats = useMemo(() => generateClassStats(), []);
  const classStudents = useMemo(
    () =>
      DEMO_STUDENTS.filter((student) => student.className === selectedClass).toSorted(
        (a, b) => b.totalXp - a.totalXp,
      ),
    [selectedClass],
  );

  return (
    <div className="space-y-6">
      <header>
        <SectionKicker>Gestao por turma</SectionKicker>
        <h1 className="mt-2 font-heading text-4xl font-bold leading-none text-brass">Turmas</h1>
        <p className="mt-2 text-sm text-parchment/62">Compare salas, acompanhe alunos e identifique quem puxa o ritmo.</p>
      </header>

      <section className="flex gap-2 overflow-x-auto pb-1">
        {CLASSES.map((className) => (
          <FilterPill
            key={className}
            active={selectedClass === className}
            onClick={() => setSelectedClass(className)}
          >
            Turma {className}
          </FilterPill>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {classStats.map((classStat, index) => (
          <motion.button
            key={classStat.className}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, ease: 'easeOut' }}
            onClick={() => setSelectedClass(classStat.className)}
            className="text-left"
          >
            <SectionSheet
              className={cn(
                'h-full rounded-[24px] px-4 py-4 transition-colors hover:border-brass/30',
                selectedClass === classStat.className && 'border-brass/40 bg-brass/10',
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-full bg-white/[0.05] text-2xl">🏫</div>
                <div>
                  <h2 className="font-heading text-2xl leading-none text-brass">Turma {classStat.className}</h2>
                  <p className="mt-1 text-xs text-parchment/52">{classStat.students} alunos</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <MiniMetric label="Descartes" value={classStat.totalDisposals} tone="text-emerald" />
                <MiniMetric label="XP medio" value={classStat.avgXp} tone="text-brass" />
              </div>
            </SectionSheet>
          </motion.button>
        ))}
      </section>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, ease: 'easeOut' }}
      >
        <SectionSheet>
          <SectionKicker>Alunos da turma {selectedClass}</SectionKicker>
          <h2 className="mt-2 font-heading text-3xl leading-none text-parchment">Classificacao interna</h2>
          <div className="mt-5 space-y-3">
            {classStudents.map((student, index) => (
              <ListRow key={student.id}>
                <div className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-sm font-semibold text-brass">
                    {index + 1}
                  </span>
                  <span className="text-2xl">{student.avatar}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-parchment">{student.name}</p>
                    <p className="truncate text-xs text-parchment/45">
                      Nv. {student.level} · {student.title} · {student.achievements.length} conquistas
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-brass">{student.totalXp} XP</p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-ruby">{student.streak}d streak</p>
                  </div>
                </div>
              </ListRow>
            ))}
          </div>
        </SectionSheet>
      </motion.section>
    </div>
  );
}

function MiniMetric({ label, value, tone }: { label: string; value: string | number; tone: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3 text-center">
      <p className={cn('text-lg font-bold', tone)}>{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-parchment/42">{label}</p>
    </div>
  );
}
