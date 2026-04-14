'use client';

import { useState } from 'react';
import { useGame } from '@/store/GameContext';
import { DEMO_STUDENTS, CLASSES } from '@/data/students';
import { motion } from 'framer-motion';

type Tab = 'geral' | 'turma';

export default function RankingPage() {
  const [tab, setTab] = useState<Tab>('geral');
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);
  const { state } = useGame();

  const sortedStudents = [...DEMO_STUDENTS].sort((a, b) => b.totalXp - a.totalXp);
  const classStudents = sortedStudents.filter(s => s.className === selectedClass);

  const getMedalEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const renderList = (students: typeof DEMO_STUDENTS) => (
    <div className="space-y-2">
      {students.map((student, i) => {
        const isMe = student.id === state.student.id;
        return (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rpg-card p-3 flex items-center gap-3 ${isMe ? 'rpg-card-gold' : ''}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
              i < 3 ? 'text-2xl' : 'bg-midnight text-parchment-dark'
            }`}>
              {getMedalEmoji(i)}
            </div>
            <div className="text-2xl">{student.avatar}</div>
            <div className="flex-1 min-w-0">
              <div className={`font-semibold text-sm truncate ${isMe ? 'text-gold' : 'text-parchment'}`}>
                {student.name} {isMe && '(Voce)'}
              </div>
              <div className="text-xs text-parchment-dark">
                Nv.{student.level} • {student.title} • Turma {student.className}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-gold">{student.totalXp}</div>
              <div className="text-[10px] text-parchment-dark">XP</div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <div className="p-4">
      <div className="text-center mb-4">
        <h2 className="font-heading text-2xl text-gold">🏆 Salao da Fama</h2>
        <p className="text-parchment-dark text-sm mt-1">Os maiores herois da reciclagem!</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('geral')}
          className={`rpg-btn flex-1 text-sm py-2 ${tab === 'geral' ? 'rpg-btn-gold' : ''}`}
        >
          🌍 Geral
        </button>
        <button
          onClick={() => setTab('turma')}
          className={`rpg-btn flex-1 text-sm py-2 ${tab === 'turma' ? 'rpg-btn-gold' : ''}`}
        >
          🏫 Por Turma
        </button>
      </div>

      {tab === 'turma' && (
        <div className="flex gap-2 mb-4">
          {CLASSES.map(cls => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`rpg-btn text-xs px-3 py-1.5 ${selectedClass === cls ? 'rpg-btn-gold' : ''}`}
            >
              {cls}
            </button>
          ))}
        </div>
      )}

      {/* Top 3 Podium */}
      {tab === 'geral' && (
        <div className="flex items-end justify-center gap-2 mb-6">
          {[sortedStudents[1], sortedStudents[0], sortedStudents[2]].map((student, i) => {
            if (!student) return null;
            const heights = ['h-24', 'h-32', 'h-20'];
            const medals = ['🥈', '🥇', '🥉'];
            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="text-3xl mb-1">{student.avatar}</div>
                <div className="text-xs text-parchment font-semibold truncate max-w-[80px] text-center">
                  {student.name}
                </div>
                <div className="text-xs text-gold font-bold">{student.totalXp} XP</div>
                <div className={`${heights[i]} w-20 rpg-card flex items-start justify-center pt-2 mt-1 rounded-t-lg`}>
                  <span className="text-2xl">{medals[i]}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {renderList(tab === 'geral' ? sortedStudents : classStudents)}
    </div>
  );
}
