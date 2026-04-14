'use client';

import { useGame } from '@/store/GameContext';
import { getXpForNextLevel } from '@/data/levels';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function InicioPage() {
  const { state } = useGame();
  const { student, dailyQuests, disposals } = state;
  const xpInfo = getXpForNextLevel(student.totalXp);

  const todayDisposals = disposals.filter(d => {
    const dDate = new Date(d.timestamp).toDateString();
    return dDate === new Date().toDateString();
  });

  return (
    <div className="p-4 space-y-4">
      {/* Character Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rpg-card-gold p-5"
      >
        <div className="flex items-center gap-4">
          <div className="text-6xl">{student.avatar}</div>
          <div className="flex-1">
            <h2 className="font-heading text-xl font-bold text-gold">{student.name}</h2>
            <p className="text-sm text-parchment-dark">{student.title}</p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="flex items-center gap-1">
                <span className="text-gold">⭐</span> Nivel {student.level}
              </span>
              <span className="flex items-center gap-1">
                <span className="text-orange-400">🔥</span> {student.streak} dias
              </span>
            </div>
            <div className="mt-2">
              <div className="xp-bar-bg h-3">
                <div className="xp-bar-fill h-full" style={{ width: `${xpInfo.progress}%` }} />
              </div>
              <div className="text-xs text-parchment-dark mt-1">
                {xpInfo.current} / {xpInfo.needed} XP para o proximo nivel
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Link href="/descarte" className="block">
          <div className="rpg-btn-emerald rpg-btn w-full text-center py-4 text-lg flex items-center justify-center gap-3">
            <span className="text-2xl">♻️</span>
            Iniciar Descarte
            <span className="text-2xl">→</span>
          </div>
        </Link>
      </motion.div>

      {/* Today's Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-3"
      >
        <div className="rpg-card p-3 text-center">
          <div className="text-2xl font-bold text-gold">{todayDisposals.length}</div>
          <div className="text-[10px] text-parchment-dark">Descartes Hoje</div>
        </div>
        <div className="rpg-card p-3 text-center">
          <div className="text-2xl font-bold text-emerald">{disposals.length}</div>
          <div className="text-[10px] text-parchment-dark">Total</div>
        </div>
        <div className="rpg-card p-3 text-center">
          <div className="text-2xl font-bold text-orange-400">{student.streak}</div>
          <div className="text-[10px] text-parchment-dark">Streak</div>
        </div>
      </motion.div>

      {/* Daily Quests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rpg-card p-4"
      >
        <h3 className="font-heading text-lg text-gold mb-3 flex items-center gap-2">
          <span>📋</span> Missoes Diarias
        </h3>
        <div className="space-y-3">
          {dailyQuests.map((quest) => {
            const completed = quest.current >= quest.target;
            return (
              <div key={quest.id} className={`flex items-center gap-3 p-2 rounded-lg ${completed ? 'bg-emerald/10' : 'bg-navy/50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  completed ? 'bg-emerald text-navy' : 'bg-midnight text-parchment-dark'
                }`}>
                  {completed ? '✓' : `${quest.current}/${quest.target}`}
                </div>
                <div className="flex-1">
                  <div className={`text-sm ${completed ? 'text-emerald line-through' : 'text-parchment'}`}>
                    {quest.description}
                  </div>
                </div>
                <div className="text-xs text-gold font-bold">+{quest.xpReward} XP</div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Activity */}
      {disposals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rpg-card p-4"
        >
          <h3 className="font-heading text-lg text-gold mb-3 flex items-center gap-2">
            <span>📜</span> Atividade Recente
          </h3>
          <div className="space-y-2">
            {disposals.slice(0, 5).map((d) => (
              <div key={d.id} className="flex items-center gap-3 text-sm p-2 rounded bg-navy/30">
                <div className="text-lg">♻️</div>
                <div className="flex-1">
                  <span className="text-parchment">{d.itemName}</span>
                  <span className="text-parchment-dark text-xs ml-2">
                    {new Date(d.timestamp).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <span className="text-gold text-xs font-bold">+{d.xpEarned} XP</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
