'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { ListRow, SectionKicker, SectionSheet } from '@/components/tech-clear/ui';
import { REWARDS } from '@/data/rewards';
import { cn } from '@/lib/cn';
import { useGame } from '@/store/GameContext';
import type { Reward, RewardCategory } from '@/types/reward';

const CATEGORY_LABELS: Record<RewardCategory, string> = {
  gastronomia: 'Gastronomia',
  entretenimento: 'Entretenimento',
  educacao: 'Educacao',
  material: 'Material',
};

export default function TavernaPage() {
  const { state, dispatch, spendableXp } = useGame();
  const [filter, setFilter] = useState<RewardCategory | 'all'>('all');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [redeemed, setRedeemed] = useState(false);

  const filteredRewards = useMemo(() => {
    if (filter === 'all') return REWARDS;
    return REWARDS.filter((reward) => reward.category === filter);
  }, [filter]);

  const featuredReward = useMemo(() => {
    return filteredRewards.find((reward) => spendableXp >= reward.xpCost) ?? filteredRewards[0];
  }, [filteredRewards, spendableXp]);

  const remainingRewards = filteredRewards.filter((reward) => reward.id !== featuredReward?.id);

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
    <div className="space-y-4 pb-4">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <SectionSheet tone="hero">
          <div className="space-y-2">
            <SectionKicker>Trocas ativas</SectionKicker>
            <h1 className="font-heading text-[2.3rem] leading-none text-parchment">
              Taverna de trocas
            </h1>
            <p className="text-sm leading-6 text-parchment/64">
              Seu XP rende acesso real. Escolha a proxima recompensa e resgate quando quiser.
            </p>
          </div>

          <div className="mt-5 rounded-[24px] border border-white/8 bg-white/[0.035] px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-parchment/42">
              Saldo disponivel
            </p>
            <div className="mt-2 flex items-end justify-between gap-4">
              <div>
                <p className="font-heading text-5xl leading-none text-brass">{spendableXp}</p>
                <p className="mt-1 text-sm text-parchment/56">XP pronto para troca</p>
              </div>
              <p className="max-w-[10rem] text-right text-[11px] uppercase tracking-[0.22em] text-parchment/36">
                A cada descarte correto, seu credito cresce.
              </p>
            </div>
          </div>

          {featuredReward ? (
            <button
              onClick={() => {
                setSelectedReward(featuredReward);
                setRedeemed(false);
              }}
              className="mt-5 w-full rounded-[28px] border border-brass/28 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] px-5 py-5 text-left transition-colors hover:bg-white/[0.07]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex size-16 items-center justify-center rounded-[22px] bg-white/[0.06] text-4xl">
                    {featuredReward.icon}
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-emerald/80">
                      Oferta em destaque
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-parchment">
                      {featuredReward.name}
                    </h2>
                    <p className="mt-1 text-sm text-parchment/58">{featuredReward.partner}</p>
                    <p className="mt-3 max-w-[22ch] text-sm leading-6 text-parchment/68">
                      {featuredReward.description}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-brass">{featuredReward.xpCost} XP</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-parchment/38">
                    {featuredReward.stock} em estoque
                  </p>
                </div>
              </div>
            </button>
          ) : null}
        </SectionSheet>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
        className="flex gap-2 overflow-x-auto pb-1"
      >
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'min-h-11 rounded-full border px-4 text-[11px] font-semibold uppercase tracking-[0.24em] transition-colors',
            filter === 'all'
              ? 'border-brass/35 bg-brass text-ink'
              : 'border-white/8 bg-white/[0.03] text-parchment/58'
          )}
        >
          Tudo
        </button>
        {(Object.entries(CATEGORY_LABELS) as [RewardCategory, string][]).map(([category, label]) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={cn(
              'min-h-11 rounded-full border px-4 text-[11px] font-semibold uppercase tracking-[0.24em] transition-colors',
              filter === category
                ? 'border-brass/35 bg-brass text-ink'
                : 'border-white/8 bg-white/[0.03] text-parchment/58'
            )}
          >
            {label}
          </button>
        ))}
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.14, ease: 'easeOut' }}
      >
        <SectionSheet>
          <div className="space-y-2">
            <SectionKicker>Catalogo aberto</SectionKicker>
            <h2 className="font-heading text-3xl leading-none text-parchment">
              Recompensas disponiveis
            </h2>
          </div>

          <div className="mt-5 space-y-3">
            {remainingRewards.map((reward) => {
              const canAfford = spendableXp >= reward.xpCost;

              return (
                <button
                  key={reward.id}
                  onClick={() => {
                    setSelectedReward(reward);
                    setRedeemed(false);
                  }}
                  className="w-full text-left"
                >
                  <ListRow
                    className={cn(
                      'transition-colors hover:bg-white/[0.05]',
                      !canAfford && 'opacity-55'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-[3.25rem] shrink-0 items-center justify-center rounded-[18px] bg-white/[0.05] text-3xl">
                        {reward.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[15px] font-medium text-parchment">{reward.name}</p>
                            <p className="mt-1 text-sm text-parchment/56">{reward.partner}</p>
                          </div>
                          <div className="text-right">
                            <p className={cn('text-sm font-semibold', canAfford ? 'text-brass' : 'text-ruby')}>
                              {reward.xpCost} XP
                            </p>
                            <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-parchment/38">
                              {reward.stock} unidades
                            </p>
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-parchment/64">
                          {reward.description}
                        </p>
                      </div>
                    </div>
                  </ListRow>
                </button>
              );
            })}
          </div>
        </SectionSheet>
      </motion.section>

      {state.redemptions.length > 0 ? (
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2, ease: 'easeOut' }}
        >
          <SectionSheet>
            <div className="space-y-2">
              <SectionKicker>Historico</SectionKicker>
              <h2 className="font-heading text-3xl leading-none text-parchment">Resgates recentes</h2>
            </div>

            <div className="mt-5 space-y-3">
              {state.redemptions.map((redemption) => (
                <ListRow key={redemption.id}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[15px] font-medium text-parchment">{redemption.rewardName}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-parchment/40">
                        {new Date(redemption.redeemedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-brass">-{redemption.xpSpent} XP</span>
                  </div>
                </ListRow>
              ))}
            </div>
          </SectionSheet>
        </motion.section>
      ) : null}

      <AnimatePresence>
        {selectedReward ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
            onClick={() => setSelectedReward(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 18 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-md rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,32,58,0.98),rgba(8,12,24,0.98))] px-5 py-5 shadow-[0_30px_90px_rgba(0,0,0,0.45)]"
            >
              {!redeemed ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex size-16 items-center justify-center rounded-[22px] bg-white/[0.05] text-4xl">
                        {selectedReward.icon}
                      </div>
                      <div>
                        <SectionKicker>{CATEGORY_LABELS[selectedReward.category]}</SectionKicker>
                        <h3 className="mt-2 text-xl font-semibold text-parchment">
                          {selectedReward.name}
                        </h3>
                        <p className="mt-1 text-sm text-parchment/58">{selectedReward.partner}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedReward(null)}
                      className="rounded-full border border-white/10 px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-parchment/48"
                    >
                      Fechar
                    </button>
                  </div>

                  <p className="mt-5 text-sm leading-6 text-parchment/68">
                    {selectedReward.description}
                  </p>

                  <div className="mt-5 rounded-[24px] border border-white/8 bg-white/[0.03] px-4 py-4">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.24em] text-parchment/42">
                          Custo
                        </p>
                        <p className="mt-2 font-heading text-4xl leading-none text-brass">
                          {selectedReward.xpCost} XP
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-parchment/42">
                          Estoque
                        </p>
                        <p className="mt-2 text-sm font-semibold text-parchment">
                          {selectedReward.stock} restante(s)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleRedeem(selectedReward)}
                      disabled={spendableXp < selectedReward.xpCost}
                      className={cn(
                        'min-h-[3.25rem] rounded-full px-4 text-sm font-semibold uppercase tracking-[0.22em] transition-colors',
                        spendableXp >= selectedReward.xpCost
                          ? 'bg-[linear-gradient(180deg,#6EE6B0_0%,#48D597_100%)] text-ink'
                          : 'cursor-not-allowed border border-white/8 bg-white/[0.04] text-parchment/34'
                      )}
                    >
                      {spendableXp >= selectedReward.xpCost ? 'Resgatar' : 'XP insuficiente'}
                    </button>
                    <button
                      onClick={() => setSelectedReward(null)}
                      className="min-h-[3.25rem] rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold uppercase tracking-[0.22em] text-parchment"
                    >
                      Voltar
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-5 text-center">
                  <div className="space-y-2">
                    <SectionKicker>Resgate confirmado</SectionKicker>
                    <h3 className="font-heading text-[2.2rem] leading-none text-parchment">
                      Codigo liberado
                    </h3>
                    <p className="text-sm leading-6 text-parchment/64">
                      Apresente este codigo em {selectedReward.partner} para concluir a troca.
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-brass/25 bg-white/[0.04] px-4 py-5">
                    <p className="font-mono text-3xl font-semibold tracking-[0.3em] text-brass">
                      {state.redemptions[0]?.code}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedReward(null)}
                    className="min-h-[3.25rem] w-full rounded-full bg-[linear-gradient(180deg,#E5C176_0%,#D6A84B_100%)] px-4 text-sm font-semibold uppercase tracking-[0.22em] text-ink"
                  >
                    Fechar
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
