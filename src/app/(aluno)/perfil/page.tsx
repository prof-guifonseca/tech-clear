'use client';

import { useGame } from '@/store/GameContext';
import { useAuth } from '@/store/AuthContext';
import { ACHIEVEMENTS } from '@/data/achievements';
import { WASTE_CATEGORIES } from '@/data/waste-categories';
import { getXpForNextLevel, LEVELS } from '@/data/levels';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

export default function PerfilPage() {
  const { state, dispatch } = useGame();
  const { logout } = useAuth();
  const router = useRouter();
  const { student, disposals } = state;
  const xpInfo = getXpForNextLevel(student.totalXp);

  const categoryCounts = WASTE_CATEGORIES.map(cat => ({
    ...cat,
    count: disposals.filter(d => d.category === cat.id).length,
  }));

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleReset = () => {
    dispatch({ type: 'RESET' });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Character Sheet */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rpg-card-gold p-5"
      >
        <div className="text-center mb-4">
          <div className="text-6xl mb-2">{student.avatar}</div>
          <h2 className="font-heading text-2xl font-bold text-gold">{student.name}</h2>
          <p className="text-parchment-dark">{student.title}</p>
          <div className="text-sm text-parchment-dark mt-1">Turma {student.className}</div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center bg-navy/40 rounded-lg p-2">
            <div className="text-xl font-bold text-gold">⭐ {student.level}</div>
            <div className="text-[10px] text-parchment-dark">Nivel</div>
          </div>
          <div className="text-center bg-navy/40 rounded-lg p-2">
            <div className="text-xl font-bold text-gold">🪙 {student.totalXp}</div>
            <div className="text-[10px] text-parchment-dark">XP Total</div>
          </div>
          <div className="text-center bg-navy/40 rounded-lg p-2">
            <div className="text-xl font-bold text-orange-400">🔥 {student.streak}</div>
            <div className="text-[10px] text-parchment-dark">Streak</div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-parchment-dark mb-1">
            <span>Progresso para Nv.{Math.min(student.level + 1, 10)}</span>
            <span>{xpInfo.progress}%</span>
          </div>
          <div className="xp-bar-bg h-4">
            <div className="xp-bar-fill h-full" style={{ width: `${xpInfo.progress}%` }} />
          </div>
        </div>
      </motion.div>

      {/* QR Code */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rpg-card p-4"
      >
        <h3 className="font-heading text-lg text-gold mb-3 text-center">📱 Seu QR Code</h3>
        <div className="flex justify-center bg-white rounded-lg p-4 mx-auto w-fit">
          <QRCodeSVG value={`techclear:${student.id}`} size={160} />
        </div>
        <p className="text-center text-xs text-parchment-dark mt-2">
          Escaneie na lixeira inteligente para registrar seus descartes
        </p>
      </motion.div>

      {/* Stats by Category */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rpg-card p-4"
      >
        <h3 className="font-heading text-lg text-gold mb-3">📊 Descartes por Categoria</h3>
        <div className="grid grid-cols-3 gap-2">
          {categoryCounts.map(cat => (
            <div
              key={cat.id}
              className="rounded-lg p-2 text-center border-2"
              style={{ borderColor: cat.color, backgroundColor: `${cat.color}15` }}
            >
              <div className="text-xl">{cat.icon}</div>
              <div className="text-lg font-bold" style={{ color: cat.color }}>{cat.count}</div>
              <div className="text-[9px] text-parchment-dark">{cat.conamaColor}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rpg-card p-4"
      >
        <h3 className="font-heading text-lg text-gold mb-3">🏅 Conquistas</h3>
        <div className="grid grid-cols-4 gap-2">
          {ACHIEVEMENTS.map(achievement => {
            const unlocked = student.achievements.includes(achievement.id);
            return (
              <div
                key={achievement.id}
                className={`rounded-lg p-2 text-center border-2 transition-all ${
                  unlocked
                    ? `rarity-bg-${achievement.rarity} rarity-${achievement.rarity}`
                    : 'border-parchment-dark/20 opacity-30 grayscale'
                }`}
                title={`${achievement.name}: ${achievement.description}`}
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div className="text-[8px] text-parchment mt-0.5 leading-tight">{achievement.name}</div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Level Progression */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rpg-card p-4"
      >
        <h3 className="font-heading text-lg text-gold mb-3">📈 Progressao de Niveis</h3>
        <div className="space-y-1.5">
          {LEVELS.map(level => {
            const reached = student.level >= level.level;
            const isCurrent = student.level === level.level;
            return (
              <div
                key={level.level}
                className={`flex items-center gap-2 p-2 rounded text-sm ${
                  isCurrent ? 'bg-gold/20 border border-gold/40' : reached ? 'bg-emerald/10' : 'opacity-40'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  reached ? 'bg-emerald text-white' : 'bg-midnight text-parchment-dark'
                }`}>
                  {reached ? '✓' : level.level}
                </span>
                <span className={`flex-1 ${isCurrent ? 'text-gold font-semibold' : 'text-parchment-dark'}`}>
                  {level.title}
                </span>
                <span className="text-xs text-parchment-dark">{level.xpRequired} XP</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={handleReset} className="rpg-btn flex-1 text-sm py-2">
          🔄 Resetar Progresso
        </button>
        <button onClick={handleLogout} className="rpg-btn flex-1 text-sm py-2 !border-ruby/50">
          🚪 Sair
        </button>
      </div>
    </div>
  );
}
