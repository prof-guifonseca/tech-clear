'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/store/GameContext';
import { WASTE_ITEMS, WASTE_CATEGORIES } from '@/data/waste-categories';
import { classifyWaste, getAnalysisSteps } from '@/lib/waste-classifier';
import { calculateXpGain, checkLevelUp, isNewDay } from '@/lib/game-engine';
import { motion, AnimatePresence } from 'framer-motion';
import { WasteItem } from '@/types/waste';

type Step = 'scan' | 'select' | 'analyzing' | 'result';

export default function DescartePage() {
  const [step, setStep] = useState<Step>('scan');
  const [selectedItem, setSelectedItem] = useState<WasteItem | null>(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [xpGained, setXpGained] = useState(0);
  const [leveledUp, setLeveledUp] = useState<{ leveled: boolean; newTitle: string } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { state, dispatch } = useGame();

  const handleScan = () => {
    setTimeout(() => setStep('select'), 1500);
  };

  const handleSelectItem = (item: WasteItem) => {
    setSelectedItem(item);
    setStep('analyzing');
  };

  const runAnalysis = useCallback(() => {
    const steps = getAnalysisSteps();
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setAnalysisStep(current);
      if (current >= steps.length) {
        clearInterval(interval);
        setTimeout(() => {
          if (selectedItem) {
            const isFirst = isNewDay(state.lastDisposalDate);
            const xp = calculateXpGain(selectedItem, state.student.streak, isFirst);
            setXpGained(xp);

            const levelCheck = checkLevelUp(state.student.totalXp, state.student.totalXp + xp);
            if (levelCheck.leveled) {
              setLeveledUp({ leveled: true, newTitle: levelCheck.newTitle });
            }

            dispatch({
              type: 'ADD_DISPOSAL',
              disposal: {
                id: Math.random().toString(36).substring(2, 10),
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
          }
        }, 500);
      }
    }, 600);
    return () => clearInterval(interval);
  }, [selectedItem, state.lastDisposalDate, state.student, dispatch]);

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
  };

  return (
    <div className="p-4 min-h-[calc(100vh-120px)]">
      <AnimatePresence mode="wait">
        {/* Step 1: QR Scan */}
        {step === 'scan' && (
          <motion.div
            key="scan"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col items-center justify-center min-h-[60vh]"
          >
            <h2 className="font-heading text-2xl text-gold mb-6">Escanear QR Code</h2>
            <div className="relative w-64 h-64 mb-6">
              <div className="absolute inset-0 border-2 border-gold/30 rounded-2xl bg-midnight/50 flex items-center justify-center">
                <div className="text-6xl">📱</div>
              </div>
              {/* Scanning corners */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-emerald rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-emerald rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-emerald rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-emerald rounded-br-lg" />
              {/* Scan line */}
              <div className="absolute left-2 right-2 h-0.5 bg-emerald/80 animate-scan-line" />
            </div>
            <p className="text-parchment-dark text-sm mb-4 text-center">
              Posicione seu QR Code na area de escaneamento
            </p>
            <button onClick={handleScan} className="rpg-btn rpg-btn-emerald text-lg px-8 py-3">
              📷 Escanear Agora
            </button>
            <p className="text-parchment-dark/50 text-xs mt-3">
              ou continue como {state.student.name}
            </p>
          </motion.div>
        )}

        {/* Step 2: Select Waste Item */}
        {step === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <div className="text-center mb-4">
              <h2 className="font-heading text-2xl text-gold mb-1">Selecione o Item</h2>
              <p className="text-parchment-dark text-sm">Qual residuo voce deseja descartar?</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {WASTE_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className="rpg-card p-3 flex flex-col items-center hover:border-gold transition-all hover:scale-[1.03] active:scale-95"
                >
                  <span className="text-3xl mb-1">{item.icon}</span>
                  <span className="text-[11px] text-parchment text-center leading-tight">{item.name}</span>
                  {item.difficulty === 'dificil' && (
                    <span className="text-[9px] text-ruby mt-0.5">⚡ Dificil</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 3: AI Analysis */}
        {step === 'analyzing' && selectedItem && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center justify-center min-h-[60vh]"
          >
            <div className="text-6xl mb-4 animate-spin-slow">⚙️</div>
            <h2 className="font-heading text-2xl text-gold mb-2">Analisando...</h2>
            <div className="text-4xl mb-4">{selectedItem.icon}</div>
            <p className="text-lg text-parchment mb-6">{selectedItem.name}</p>

            <div className="w-full max-w-xs space-y-2">
              {getAnalysisSteps().map((stepText, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 text-sm transition-all duration-300 ${
                    i < analysisStep ? 'text-emerald' : i === analysisStep ? 'text-gold' : 'text-parchment-dark/30'
                  }`}
                >
                  <span>{i < analysisStep ? '✅' : i === analysisStep ? '🔄' : '⬜'}</span>
                  <span>{stepText}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 xp-bar-bg w-full max-w-xs h-3">
              <motion.div
                className="xp-bar-fill h-full"
                initial={{ width: '0%' }}
                animate={{ width: `${(analysisStep / getAnalysisSteps().length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        )}

        {/* Step 4: Result */}
        {step === 'result' && selectedItem && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-4"
          >
            {/* Confetti effect */}
            {showConfetti && (
              <div className="fixed inset-0 pointer-events-none z-50">
                {Array.from({ length: 30 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-2xl"
                    initial={{
                      x: '50%',
                      y: '40%',
                      opacity: 1,
                    }}
                    animate={{
                      x: `${Math.random() * 100}%`,
                      y: `${Math.random() * 100}%`,
                      opacity: 0,
                      rotate: Math.random() * 720,
                    }}
                    transition={{ duration: 2, ease: 'easeOut' }}
                  >
                    {['✨', '⭐', '🌟', '💎', '🎉'][i % 5]}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Success Header */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="text-7xl mb-2"
            >
              ✅
            </motion.div>
            <h2 className="font-heading text-2xl text-emerald mb-1">Descarte Correto!</h2>

            {/* XP Gained */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-gold my-3 flex items-center gap-2"
            >
              <span>+{xpGained} XP</span>
              <span className="text-2xl">🪙</span>
            </motion.div>

            {/* Level Up */}
            {leveledUp?.leveled && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: 'spring' }}
                className="rpg-card-gold p-4 mb-4 text-center glow-gold"
              >
                <div className="text-4xl mb-1">🎉</div>
                <h3 className="font-heading text-xl text-gold">Subiu de Nivel!</h3>
                <p className="text-parchment">{leveledUp.newTitle}</p>
              </motion.div>
            )}

            {/* Classification Result */}
            {(() => {
              const result = classifyWaste(selectedItem.id);
              const cat = WASTE_CATEGORIES.find(c => c.id === result.category)!;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="rpg-card p-4 w-full mb-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">{selectedItem.icon}</span>
                    <div>
                      <div className="text-lg font-semibold text-parchment">{selectedItem.name}</div>
                      <div className="text-sm text-parchment-dark">~{result.weight}g</div>
                    </div>
                  </div>
                  <div
                    className="rounded-lg p-3 border-2 mb-3"
                    style={{ borderColor: cat.color, backgroundColor: `${cat.color}15` }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                        style={{ backgroundColor: cat.color }}
                      >
                        {cat.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-parchment">{cat.name}</div>
                        <div className="text-xs" style={{ color: cat.color }}>
                          Lixeira {cat.conamaColor}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-navy/50 rounded-lg p-3">
                    <div className="text-xs text-gold font-semibold mb-1">💡 Voce sabia?</div>
                    <p className="text-sm text-parchment-dark">{result.funFact}</p>
                  </div>
                </motion.div>
              );
            })()}

            {/* Action Buttons */}
            <div className="flex gap-3 w-full">
              <button onClick={handleReset} className="rpg-btn rpg-btn-emerald flex-1 py-3 text-center">
                ♻️ Novo Descarte
              </button>
              <a href="/inicio" className="rpg-btn flex-1 py-3 text-center">
                🏠 Voltar
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
