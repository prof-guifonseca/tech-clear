'use client';

import { useState } from 'react';
import { DEMO_STUDENTS, CLASSES } from '@/data/students';
import { generateClassStats } from '@/data/mock-history';
import { motion } from 'framer-motion';

export default function TurmasPage() {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const classStats = generateClassStats();

  const classStudents = selectedClass
    ? [...DEMO_STUDENTS].filter(s => s.className === selectedClass).sort((a, b) => b.totalXp - a.totalXp)
    : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-gold">🏫 Turmas</h1>
        <p className="text-parchment-dark mt-1">Gestao e acompanhamento por turma</p>
      </div>

      {/* Class Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {classStats.map((cls, i) => (
          <motion.button
            key={cls.className}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setSelectedClass(cls.className === selectedClass ? null : cls.className)}
            className={`rpg-card p-4 text-left transition-all hover:scale-[1.02] ${
              selectedClass === cls.className ? 'rpg-card-gold' : ''
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl">🏫</div>
              <div>
                <h3 className="font-heading text-xl font-bold text-gold">Turma {cls.className}</h3>
                <p className="text-xs text-parchment-dark">{cls.students} alunos</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-navy/40 rounded p-2 text-center">
                <div className="text-lg font-bold text-emerald">{cls.totalDisposals}</div>
                <div className="text-[10px] text-parchment-dark">Descartes</div>
              </div>
              <div className="bg-navy/40 rounded p-2 text-center">
                <div className="text-lg font-bold text-gold">{cls.avgXp}</div>
                <div className="text-[10px] text-parchment-dark">XP Medio</div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Selected Class Detail */}
      {selectedClass && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rpg-card p-4"
        >
          <h3 className="font-heading text-xl text-gold mb-4">
            👥 Alunos da Turma {selectedClass}
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold/20">
                  <th className="text-left py-2 text-parchment-dark font-medium">#</th>
                  <th className="text-left py-2 text-parchment-dark font-medium">Aluno</th>
                  <th className="text-left py-2 text-parchment-dark font-medium">Nivel</th>
                  <th className="text-left py-2 text-parchment-dark font-medium">Titulo</th>
                  <th className="text-right py-2 text-parchment-dark font-medium">XP</th>
                  <th className="text-right py-2 text-parchment-dark font-medium">Streak</th>
                  <th className="text-right py-2 text-parchment-dark font-medium">Conquistas</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((student, i) => (
                  <tr key={student.id} className="border-b border-navy/30 hover:bg-navy/20">
                    <td className="py-2">{i + 1}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{student.avatar}</span>
                        <span className="text-parchment">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-2 text-gold font-semibold">{student.level}</td>
                    <td className="py-2 text-parchment-dark text-xs">{student.title}</td>
                    <td className="py-2 text-right text-gold font-bold">{student.totalXp}</td>
                    <td className="py-2 text-right">
                      <span className="text-orange-400">🔥 {student.streak}</span>
                    </td>
                    <td className="py-2 text-right text-parchment-dark">
                      {student.achievements.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
