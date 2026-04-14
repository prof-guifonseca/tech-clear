'use client';

import { useState } from 'react';
import { useGame } from '@/store/GameContext';
import { REWARDS } from '@/data/rewards';
import { motion, AnimatePresence } from 'framer-motion';
import { Reward, RewardCategory } from '@/types/reward';

const CATEGORY_LABELS: Record<RewardCategory, { label: string; icon: string }> = {
  gastronomia: { label: 'Gastronomia', icon: '🍽️' },
  entretenimento: { label: 'Entretenimento', icon: '🎭' },
  educacao: { label: 'Educacao', icon: '📚' },
  material: { label: 'Material', icon: '✏️' },
};

export default function TavernaPage() {
  const { state, dispatch, spendableXp } = useGame();
  const [filter, setFilter] = useState<RewardCategory | 'all'>('all');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [redeemed, setRedeemed] = useState(false);

  const filtered = filter === 'all' ? REWARDS : REWARDS.filter(r => r.category === filter);

  const handleRedeem = (reward: Reward) => {
    if (spendableXp < reward.xpCost) return;

    const code = `TC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    dispatch({
      type: 'REDEEM_REWARD',
      redemption: {
        id: Math.random().toString(36).substring(2, 10),
        studentId: state.student.id,
        rewardId: reward.id,
        rewardName: reward.name,
        redeemedAt: new Date().toISOString(),
        code,
        xpSpent: reward.xpCost,
      },
    });

    setRedeemed(true);
  };

  return (
    <div className="p-4">
      <div className="text-center mb-4">
        <h2 className="font-heading text-2xl text-gold">🏪 Taverna de Trocas</h2>
        <p className="text-parchment-dark text-sm mt-1">Troque seu XP por recompensas reais!</p>
        <div className="rpg-card inline-flex items-center gap-2 px-4 py-2 mt-2">
          <span className="text-gold text-xl">🪙</span>
          <span className="text-lg font-bold text-gold">{spendableXp} XP</span>
          <span className="text-parchment-dark text-xs">disponivel</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`rpg-btn text-xs px-3 py-1.5 whitespace-nowrap ${filter === 'all' ? 'rpg-btn-gold' : ''}`}
        >
          Todos
        </button>
        {(Object.entries(CATEGORY_LABELS) as [RewardCategory, { label: string; icon: string }][]).map(([key, { label, icon }]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rpg-btn text-xs px-3 py-1.5 whitespace-nowrap ${filter === key ? 'rpg-btn-gold' : ''}`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((reward, i) => {
          const canAfford = spendableXp >= reward.xpCost;
          return (
            <motion.button
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => { setSelectedReward(reward); setRedeemed(false); }}
              className={`rpg-card p-3 text-left transition-all hover:scale-[1.02] ${
                !canAfford ? 'opacity-50' : ''
              }`}
            >
              <div className="text-3xl mb-2">{reward.icon}</div>
              <div className="font-semibold text-sm text-parchment">{reward.name}</div>
              <div className="text-[10px] text-parchment-dark mt-0.5">{reward.partner}</div>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-gold">🪙</span>
                <span className={`text-sm font-bold ${canAfford ? 'text-gold' : 'text-ruby'}`}>
                  {reward.xpCost} XP
                </span>
              </div>
              <div className="text-[9px] text-parchment-dark/60 mt-1">
                {reward.stock} restantes
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Redemption History */}
      {state.redemptions.length > 0 && (
        <div className="mt-6 rpg-card p-4">
          <h3 className="font-heading text-lg text-gold mb-3">📜 Resgates Anteriores</h3>
          <div className="space-y-2">
            {state.redemptions.map((r) => (
              <div key={r.id} className="flex items-center gap-3 text-sm bg-navy/30 rounded p-2">
                <span className="text-parchment">{r.rewardName}</span>
                <span className="text-xs text-parchment-dark ml-auto">
                  {new Date(r.redeemedAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reward Modal */}
      <AnimatePresence>
        {selectedReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedReward(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="rpg-card-gold p-6 w-full max-w-sm"
            >
              {!redeemed ? (
                <>
                  <div className="text-center mb-4">
                    <div className="text-5xl mb-2">{selectedReward.icon}</div>
                    <h3 className="font-heading text-xl text-gold">{selectedReward.name}</h3>
                    <p className="text-parchment-dark text-sm mt-1">{selectedReward.partner}</p>
                  </div>
                  <p className="text-sm text-parchment mb-4">{selectedReward.description}</p>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-gold text-2xl">🪙</span>
                    <span className="text-2xl font-bold text-gold">{selectedReward.xpCost} XP</span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleRedeem(selectedReward)}
                      disabled={spendableXp < selectedReward.xpCost}
                      className={`rpg-btn flex-1 py-3 ${
                        spendableXp >= selectedReward.xpCost ? 'rpg-btn-emerald' : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {spendableXp >= selectedReward.xpCost ? '✅ Resgatar' : '❌ XP Insuficiente'}
                    </button>
                    <button onClick={() => setSelectedReward(null)} className="rpg-btn px-4">
                      Voltar
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="text-6xl mb-3">🎉</div>
                  <h3 className="font-heading text-xl text-emerald mb-2">Resgate Realizado!</h3>
                  <p className="text-parchment mb-4">
                    Apresente o codigo abaixo no(a) {selectedReward.partner}:
                  </p>
                  <div className="bg-navy rounded-lg p-3 mb-4">
                    <span className="font-mono text-2xl text-gold tracking-wider">
                      {state.redemptions[0]?.code}
                    </span>
                  </div>
                  <button onClick={() => setSelectedReward(null)} className="rpg-btn rpg-btn-gold w-full py-3">
                    Fechar
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
