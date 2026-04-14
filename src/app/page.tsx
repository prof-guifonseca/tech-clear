'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';
import { DEMO_STUDENTS } from '@/data/students';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const [showStudents, setShowStudents] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleStudentSelect = (student: typeof DEMO_STUDENTS[0]) => {
    login('aluno', student);
    router.push('/inicio');
  };

  const handleTeacherLogin = () => {
    login('professor');
    router.push('/painel');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy-light to-midnight" />
      <div className="absolute top-10 left-10 text-6xl opacity-20 animate-spin-slow">⚙️</div>
      <div className="absolute bottom-20 right-10 text-5xl opacity-15 animate-spin-slow" style={{ animationDirection: 'reverse' }}>🔧</div>
      <div className="absolute top-1/4 right-1/4 text-3xl opacity-10">✨</div>
      <div className="absolute bottom-1/3 left-1/5 text-4xl opacity-10">🌿</div>

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center mb-8"
      >
        <div className="text-7xl mb-4">♻️</div>
        <h1 className="font-heading text-5xl md:text-6xl font-bold text-gold mb-2 glow-text-gold">
          Tech Clear
        </h1>
        <p className="text-parchment-dark text-lg md:text-xl max-w-md mx-auto">
          A Epica Jornada da Reciclagem
        </p>
        <p className="text-parchment-dark/60 text-sm mt-2">
          Salve o Reino com a Lixeira Inteligente e ganhe XP!
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!showStudents ? (
          <motion.div
            key="buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="relative z-10 flex flex-col gap-4 w-full max-w-sm"
          >
            <button
              onClick={() => setShowStudents(true)}
              className="rpg-btn-gold rpg-btn text-lg py-4 flex items-center justify-center gap-3"
            >
              <span className="text-2xl">⚔️</span>
              Eu sou Aventureiro
            </button>
            <button
              onClick={handleTeacherLogin}
              className="rpg-btn text-lg py-4 flex items-center justify-center gap-3"
            >
              <span className="text-2xl">📊</span>
              Eu sou Mestre
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="students"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 w-full max-w-md"
          >
            <div className="rpg-card p-6">
              <h2 className="font-heading text-xl text-gold text-center mb-4">
                Escolha seu Aventureiro
              </h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {DEMO_STUDENTS.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => handleStudentSelect(student)}
                    className="rpg-card p-3 hover:border-gold transition-all hover:scale-[1.02] text-left"
                  >
                    <div className="text-3xl mb-1">{student.avatar}</div>
                    <div className="font-semibold text-sm text-parchment">{student.name}</div>
                    <div className="text-xs text-parchment-dark">
                      Turma {student.className} • Nv.{student.level}
                    </div>
                    <div className="text-xs text-gold mt-1">{student.title}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowStudents(false)}
                className="rpg-btn w-full text-sm"
              >
                ← Voltar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="relative z-10 text-parchment-dark/40 text-xs mt-8"
      >
        🌍 O lixo nao e o fim. E apenas o Start de uma nova aventura!
      </motion.p>
    </div>
  );
}
