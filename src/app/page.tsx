'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { PageHeader, SectionKicker, SectionSheet, TechClearMark } from '@/components/tech-clear/ui';
import { DEMO_STUDENTS } from '@/data/students';
import { cn } from '@/lib/cn';
import { useAuth } from '@/store/AuthContext';

type DemoStudent = (typeof DEMO_STUDENTS)[number];

export default function LoginPage() {
  const [showStudents, setShowStudents] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleStudentSelect = (student: DemoStudent) => {
    login('aluno', student);
    router.push('/inicio');
  };

  const handleTeacherLogin = () => {
    login('professor');
    router.push('/painel');
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-ink text-parchment">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(214,168,75,0.18),transparent_34%),radial-gradient(circle_at_20%_22%,rgba(72,213,151,0.12),transparent_28%),linear-gradient(180deg,rgba(11,16,32,0.96),rgba(8,12,24,1))]" />
      <div className="absolute -top-32 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-brass/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-emerald/8 blur-3xl" />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-5 py-6">
        <div
          className="flex min-h-full flex-1 flex-col justify-between gap-8"
          style={{
            paddingTop: 'max(env(safe-area-inset-top), 1.25rem)',
            paddingBottom: 'max(env(safe-area-inset-bottom), 1.5rem)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="space-y-6 pt-2"
          >
            <SectionKicker>Guilda Eco Ritual</SectionKicker>
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
              className="flex justify-center"
            >
              <TechClearMark className="w-48 sm:w-56" />
            </motion.div>
            <PageHeader
              eyebrow="Tech Clear"
              title="Tech Clear"
              description="Reciclagem com progressao real, trocas concretas e uma identidade de guilda feita para o celular."
              className="max-w-[22rem]"
            />
            <p className="max-w-[21rem] text-sm leading-6 text-parchment/58">
              Entre como aluno para continuar sua campanha ou abra o painel do professor para acompanhar a operacao.
            </p>
          </motion.div>

          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {!showStudents ? (
                <motion.div
                  key="entry-actions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="space-y-3"
                >
                  <button
                    onClick={() => setShowStudents(true)}
                    className="flex min-h-14 w-full items-center justify-center rounded-full bg-[linear-gradient(180deg,#E5C176_0%,#D6A84B_100%)] px-6 text-base font-semibold text-ink shadow-[0_16px_38px_rgba(214,168,75,0.25)] transition-transform active:scale-[0.98]"
                  >
                    Entrar como aluno
                  </button>
                  <button
                    onClick={handleTeacherLogin}
                    className="flex min-h-14 w-full items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-6 text-base font-semibold text-parchment transition-colors hover:bg-white/[0.06] active:scale-[0.98]"
                  >
                    Painel do professor
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="student-sheet"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <SectionSheet tone="hero" className="max-h-[58svh] overflow-hidden px-4 py-4">
                    <div className="flex items-end justify-between gap-3 border-b border-white/8 pb-3">
                      <div className="space-y-1">
                        <SectionKicker>Escolha o perfil</SectionKicker>
                        <h2 className="font-heading text-3xl leading-none text-parchment">
                          Sua guilda ativa
                        </h2>
                      </div>
                      <button
                        onClick={() => setShowStudents(false)}
                        className="rounded-full border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.24em] text-parchment/54 transition-colors hover:text-parchment"
                      >
                        Voltar
                      </button>
                    </div>

                    <div className="mt-4 space-y-2 overflow-y-auto pr-1">
                      {DEMO_STUDENTS.map((student) => (
                        <button
                          key={student.id}
                          onClick={() => handleStudentSelect(student)}
                          className={cn(
                            'w-full rounded-[22px] border border-white/8 bg-white/[0.035] px-4 py-3 text-left transition-all',
                            'hover:border-brass/35 hover:bg-white/[0.05] active:scale-[0.99]'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex size-12 items-center justify-center rounded-full bg-white/[0.06] text-2xl">
                              {student.avatar}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-3">
                                <p className="truncate text-base font-semibold text-parchment">
                                  {student.name}
                                </p>
                                <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-brass">
                                  Nv {student.level}
                                </span>
                              </div>
                              <p className="text-sm text-parchment/66">{student.title}</p>
                              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.22em] text-parchment/42">
                                <span>Turma {student.className}</span>
                                <span>{student.totalXp} XP</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </SectionSheet>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
