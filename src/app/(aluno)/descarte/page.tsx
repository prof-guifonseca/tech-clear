'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';

import {
  Button,
  FilterPill,
  ListRow,
  PageHeader,
  ProgressBar,
  SectionKicker,
  SectionSheet,
} from '@/components/tech-clear/ui';
import { WASTE_CATEGORIES, WASTE_ITEMS } from '@/data/waste-categories';
import { cn } from '@/lib/cn';
import { calculateXpGain, checkLevelUp, isNewDay } from '@/lib/game-engine';
import { createId } from '@/lib/id';
import { classifyWaste, getAnalysisSteps } from '@/lib/waste-classifier';
import { useGame } from '@/store/GameContext';
import type { WasteCategory, WasteItem } from '@/types/waste';

type Step = 'scan' | 'select' | 'analyzing' | 'result';

const CONFETTI_PIECES = Array.from({ length: 18 }, (_, index) => ({
  x: `${10 + ((index * 37) % 80)}%`,
  y: `${20 + ((index * 29) % 65)}%`,
  rotate: (index * 137) % 540,
}));

export default function DescartePage() {
  const [step, setStep] = useState<Step>('scan');
  const [selectedItem, setSelectedItem] = useState<WasteItem | null>(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [xpGained, setXpGained] = useState(0);
  const [leveledUp, setLeveledUp] = useState<{ leveled: boolean; newTitle: string } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<WasteCategory | 'all'>('all');
  const { state, dispatch } = useGame();

  const analysisSteps = getAnalysisSteps();
  const filteredItems =
    categoryFilter === 'all'
      ? WASTE_ITEMS
      : WASTE_ITEMS.filter((item) => item.category === categoryFilter);

  const handleScan = () => {
    setTimeout(() => setStep('select'), 900);
  };

  const handleSelectItem = (item: WasteItem) => {
    setSelectedItem(item);
    setAnalysisStep(0);
    setStep('analyzing');
  };

  const runAnalysis = useCallback(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setAnalysisStep(current);

      if (current >= analysisSteps.length) {
        clearInterval(interval);
        setTimeout(() => {
          if (!selectedItem) return;

          const isFirstDisposalToday = isNewDay(state.lastDisposalDate);
          const xp = calculateXpGain(selectedItem, state.student.streak, isFirstDisposalToday);
          setXpGained(xp);

          const levelCheck = checkLevelUp(state.student.totalXp, state.student.totalXp + xp);
          if (levelCheck.leveled) {
            setLeveledUp({ leveled: true, newTitle: levelCheck.newTitle });
          }

          dispatch({
            type: 'ADD_DISPOSAL',
            disposal: {
              id: createId('disposal'),
              studentId: state.student.id,
              itemId: selectedItem.id,
              itemName: selectedItem.name,
              category: selectedItem.category,
              xpEarned: xp,
              timestamp: new Date().toISOString(),
              wasCorrect: true,
            },
            xpGained: xp,
          });

          setShowConfetti(true);
          setStep('result');
        }, 350);
      }
    }, 480);

    return () => clearInterval(interval);
  }, [analysisSteps.length, dispatch, selectedItem, state.lastDisposalDate, state.student.streak, state.student.totalXp, state.student.id]);

  useEffect(() => {
    if (step === 'analyzing' && selectedItem) {
      const cleanup = runAnalysis();
      return cleanup;
    }
  }, [step, selectedItem, runAnalysis]);

  const handleReset = () => {
    setStep('scan');
    setSelectedItem(null);
    setAnalysisStep(0);
    setXpGained(0);
    setLeveledUp(null);
    setShowConfetti(false);
    setCategoryFilter('all');
  };

  const result = selectedItem ? classifyWaste(selectedItem.id) : null;
  const matchedCategory = result
    ? WASTE_CATEGORIES.find((category) => category.id === result.category) ?? WASTE_CATEGORIES[0]
    : null;

  return (
    <div className="pb-4">
      <AnimatePresence mode="wait">
        {step === 'scan' ? (
          <motion.section
            key="scan"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.42, ease: 'easeOut' }}
            className="pt-2"
          >
            <SectionSheet tone="hero" className="min-h-[calc(100svh-13rem)]">
              <div className="flex h-full flex-col items-center justify-center text-center">
                <PageHeader
                  eyebrow="Ritual de descarte"
                  title="Escaneie o selo"
                  description="Aproxime o QR da lixeira para abrir a proxima leitura da sua campanha."
                  align="center"
                />

                <div className="relative mt-8 flex h-72 w-full max-w-[18rem] items-center justify-center rounded-[32px] border border-brass/22 bg-[linear-gradient(180deg,rgba(14,21,39,0.98),rgba(20,32,58,0.96))]">
                  <div className="absolute inset-4 rounded-[26px] border border-white/8" />
                  <div className="absolute inset-0 rounded-[32px] bg-[radial-gradient(circle_at_top,rgba(214,168,75,0.12),transparent_50%)]" />
                  <div className="absolute inset-x-6 top-1/2 h-px -translate-y-1/2 bg-[linear-gradient(90deg,transparent,rgba(72,213,151,0.9),transparent)] animate-scan-line" />
                  <div className="absolute left-4 top-4 h-10 w-10 rounded-tl-[20px] border-l-2 border-t-2 border-emerald" />
                  <div className="absolute right-4 top-4 h-10 w-10 rounded-tr-[20px] border-r-2 border-t-2 border-emerald" />
                  <div className="absolute bottom-4 left-4 h-10 w-10 rounded-bl-[20px] border-b-2 border-l-2 border-emerald" />
                  <div className="absolute bottom-4 right-4 h-10 w-10 rounded-br-[20px] border-b-2 border-r-2 border-emerald" />
                  <div className="text-7xl text-parchment/84">⌁</div>
                </div>

                <Button
                  onClick={handleScan}
                  variant="success"
                  size="lg"
                  className="mt-8 uppercase tracking-[0.22em]"
                >
                  Abrir leitura
                </Button>

                <p className="mt-4 max-w-[20rem] text-sm leading-6 text-parchment/52">
                  Quando o ritual abrir, voce escolhe o item e o sistema confirma a lixeira correta.
                </p>
              </div>
            </SectionSheet>
          </motion.section>
        ) : null}

        {step === 'select' ? (
          <motion.section
            key="select"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.42, ease: 'easeOut' }}
            className="space-y-4"
          >
            <SectionSheet>
              <PageHeader
                eyebrow="Escolha do item"
                title="O que voce vai descartar?"
                description="Filtre por categoria para acelerar a leitura e mantenha o foco em uma decisao por vez."
              />

              <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                <FilterPill
                  onClick={() => setCategoryFilter('all')}
                  active={categoryFilter === 'all'}
                >
                  Tudo
                </FilterPill>
                {WASTE_CATEGORIES.map((category) => (
                  <FilterPill
                    key={category.id}
                    onClick={() => setCategoryFilter(category.id)}
                    active={categoryFilter === category.id}
                  >
                    {category.conamaColor}
                  </FilterPill>
                ))}
              </div>
            </SectionSheet>

            <div className="grid grid-cols-2 gap-3">
              {filteredItems.map((item) => {
                const itemCategory =
                  WASTE_CATEGORIES.find((category) => category.id === item.category) ?? WASTE_CATEGORIES[0];

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(20,32,58,0.94),rgba(8,12,24,0.94))] px-4 py-4 text-left transition-colors hover:border-brass/30 hover:bg-white/[0.05] active:scale-[0.99]"
                  >
                    <div className="flex size-12 items-center justify-center rounded-[18px] bg-white/[0.05] text-3xl">
                      {item.icon}
                    </div>
                    <p className="mt-4 text-[15px] font-medium leading-6 text-parchment">{item.name}</p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span
                        className="rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.18em]"
                        style={{ backgroundColor: `${itemCategory.color}22`, color: itemCategory.color }}
                      >
                        {itemCategory.conamaColor}
                      </span>
                      {item.difficulty !== 'facil' ? (
                        <span className="text-[10px] uppercase tracking-[0.18em] text-ruby">
                          {item.difficulty}
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.section>
        ) : null}

        {step === 'analyzing' && selectedItem ? (
          <motion.section
            key="analyzing"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.42, ease: 'easeOut' }}
          >
            <SectionSheet tone="hero" className="min-h-[calc(100svh-13rem)]">
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="flex size-24 items-center justify-center rounded-full border border-brass/25 bg-white/[0.05] text-5xl">
                  {selectedItem.icon}
                </div>
                <h2 className="mt-6 font-heading text-[2.4rem] leading-none text-parchment">
                  Analisando item
                </h2>
                <p className="mt-2 text-base text-parchment/64">{selectedItem.name}</p>

                <div className="mt-8 w-full max-w-sm space-y-3 text-left">
                  {analysisSteps.map((analysisLabel, index) => {
                    const isDone = index < analysisStep;
                    const isCurrent = index === analysisStep;

                    return (
                      <ListRow
                        key={analysisLabel}
                        className={cn(
                          isDone && 'border-emerald/24 bg-emerald/8',
                          isCurrent && 'border-brass/24 bg-brass/10'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'flex size-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold',
                              isDone
                                ? 'border-emerald/30 bg-emerald text-ink'
                                : isCurrent
                                  ? 'border-brass/30 bg-brass text-ink'
                                  : 'border-white/10 bg-white/[0.03] text-parchment/46'
                            )}
                          >
                            {isDone ? 'OK' : isCurrent ? '...' : index + 1}
                          </div>
                          <p className="text-sm leading-6 text-parchment/72">{analysisLabel}</p>
                        </div>
                      </ListRow>
                    );
                  })}
                </div>

                <div className="mt-8 w-full max-w-sm space-y-2">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-parchment/44">
                    <span>Processo</span>
                    <span>{Math.round((analysisStep / analysisSteps.length) * 100)}%</span>
                  </div>
                  <ProgressBar value={(analysisStep / analysisSteps.length) * 100} className="h-2.5" />
                </div>
              </div>
            </SectionSheet>
          </motion.section>
        ) : null}

        {step === 'result' && selectedItem && result && matchedCategory ? (
          <motion.section
            key="result"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.42, ease: 'easeOut' }}
            className="space-y-4"
          >
            {showConfetti ? (
              <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
                {CONFETTI_PIECES.map((piece, index) => (
                  <motion.div
                    key={index}
                    className="absolute text-xl"
                    initial={{ x: '50%', y: '36%', opacity: 1 }}
                    animate={{
                      x: piece.x,
                      y: piece.y,
                      opacity: 0,
                      rotate: piece.rotate,
                    }}
                    transition={{ duration: 1.7, ease: 'easeOut' }}
                  >
                    {index % 2 === 0 ? '✦' : '✧'}
                  </motion.div>
                ))}
              </div>
            ) : null}

            <SectionSheet tone="hero">
              <div className="space-y-3 text-center">
                <div className="mx-auto flex size-24 items-center justify-center rounded-full border border-emerald/30 bg-emerald/16 text-5xl text-emerald">
                  ✓
                </div>
                <SectionKicker>Leitura concluida</SectionKicker>
                <h1 className="font-heading text-[2.5rem] leading-none text-parchment">
                  Descarte correto
                </h1>
                <p className="text-base text-parchment/64">
                  Mais um item enviado para a lixeira certa.
                </p>
                <p className="font-heading text-5xl leading-none text-brass">+{xpGained} XP</p>
              </div>

              {leveledUp?.leveled ? (
                <div className="mt-5 rounded-[24px] border border-brass/26 bg-brass/10 px-4 py-4 text-left">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-brass/80">
                    Nivel liberado
                  </p>
                  <p className="mt-2 text-lg font-semibold text-parchment">{leveledUp.newTitle}</p>
                </div>
              ) : null}
            </SectionSheet>

            <SectionSheet>
              <div className="flex items-start gap-4">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-[22px] bg-white/[0.05] text-4xl">
                  {selectedItem.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <SectionKicker>Item confirmado</SectionKicker>
                  <h2 className="mt-2 text-xl font-semibold text-parchment">{selectedItem.name}</h2>
                  <p className="mt-1 text-sm text-parchment/56">Peso aproximado de {result.weight}g</p>
                </div>
              </div>

              <div
                className="mt-5 rounded-[24px] border px-4 py-4"
                style={{ borderColor: `${matchedCategory.color}55`, backgroundColor: `${matchedCategory.color}16` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex size-12 items-center justify-center rounded-full text-2xl text-white"
                    style={{ backgroundColor: matchedCategory.color }}
                  >
                    {matchedCategory.icon}
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-parchment/52">
                      Destino correto
                    </p>
                    <p className="mt-1 text-lg font-semibold text-parchment">{matchedCategory.name}</p>
                    <p className="mt-1 text-sm" style={{ color: matchedCategory.color }}>
                      Lixeira {matchedCategory.conamaColor}
                    </p>
                  </div>
                </div>
              </div>

              <ListRow className="mt-5 border-white/8">
                <div className="space-y-2">
                  <SectionKicker className="text-parchment/52">Voce sabia?</SectionKicker>
                  <p className="text-sm leading-6 text-parchment/72">{result.funFact}</p>
                </div>
              </ListRow>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Button
                  onClick={handleReset}
                  variant="success"
                  className="min-h-[3.25rem] uppercase tracking-[0.22em]"
                >
                  Novo descarte
                </Button>
                <Link
                  href="/inicio"
                  className="flex min-h-[3.25rem] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold uppercase tracking-[0.22em] text-parchment"
                >
                  Voltar
                </Link>
              </div>
            </SectionSheet>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
