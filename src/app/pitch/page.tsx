'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

import {
  Button,
  ListRow,
  MetricPill,
  ProgressBar,
  SectionKicker,
  SectionSheet,
  TechClearMark,
} from '@/components/tech-clear/ui';
import { DEMO_STUDENTS } from '@/data/students';
import { getCategoryInfo } from '@/data/waste-categories';
import { useDemoLedger } from '@/hooks/use-demo-ledger';
import { cn } from '@/lib/cn';
import {
  createPitchDisposalEvent,
  getChartDataFromLedger,
  getClassInsights,
  getImpactSnapshot,
  getRecentEvents,
  type DisposalEvent,
} from '@/lib/demo-ledger';
import { getPilotMinutes, getPilotReadiness } from '@/lib/teacher-analytics';
import { useAuth } from '@/store/AuthContext';

const CHAPTERS = [
  {
    id: 'problema',
    title: 'Problema',
    summary: 'Coleta existe, mas a escola nao enxerga habito, erro e impacto.',
  },
  {
    id: 'descarte',
    title: 'Descarte ao vivo',
    summary: 'Lucas descarta uma garrafa PET e a lixeira gera um evento verificavel.',
  },
  {
    id: 'equipamento',
    title: 'Lixeira maker',
    summary: 'Hardware acessivel identifica, roteia e envia telemetria para o app.',
  },
  {
    id: 'app',
    title: 'App do aluno',
    summary: 'O descarte vira XP, missao, streak e motivo para voltar amanha.',
  },
  {
    id: 'professor',
    title: 'Professor',
    summary: 'O evento entra no painel e vira decisao pedagogica por turma.',
  },
  {
    id: 'gestao',
    title: 'Gestao',
    summary: 'A secretaria recebe impacto, recomendacao e proposta de piloto.',
  },
] as const;

const PITCH_EVENT_ID_PREFIX = 'pitch-live-pet';

export default function PitchPage() {
  const [chapterIndex, setChapterIndex] = useState(0);
  const [pitchRunId, setPitchRunId] = useState(() => Date.now().toString(36));
  const [liveEvent, setLiveEvent] = useState<DisposalEvent | null>(null);
  const { events, reset } = useDemoLedger();
  const { login } = useAuth();
  const router = useRouter();

  const chartData = useMemo(() => getChartDataFromLedger(events), [events]);
  const snapshot = useMemo(() => getImpactSnapshot(events, DEMO_STUDENTS), [events]);
  const classInsights = useMemo(() => getClassInsights(events, DEMO_STUDENTS), [events]);
  const recentEvents = useMemo(() => getRecentEvents(events, 4), [events]);
  const pilotMinutes = useMemo(() => getPilotMinutes(events, DEMO_STUDENTS), [events]);
  const readiness = useMemo(() => getPilotReadiness(snapshot, classInsights), [snapshot, classInsights]);

  const currentChapter = CHAPTERS[chapterIndex];
  const progress = Math.round(((chapterIndex + 1) / CHAPTERS.length) * 100);
  const lucas = DEMO_STUDENTS[0];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') setChapterIndex((index) => Math.min(index + 1, CHAPTERS.length - 1));
      if (event.key === 'ArrowLeft') setChapterIndex((index) => Math.max(index - 1, 0));
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleLiveDisposal = () => {
    const event = createPitchDisposalEvent(`${PITCH_EVENT_ID_PREFIX}-${pitchRunId}`);
    setLiveEvent(event);
    setChapterIndex(1);
  };

  const handleReset = () => {
    reset();
    setLiveEvent(null);
    setPitchRunId(Date.now().toString(36));
    setChapterIndex(0);
  };

  const openTeacherPanel = () => {
    login('professor');
    router.push('/painel');
  };

  const openStudentApp = () => {
    login('aluno', lucas);
    router.push('/inicio');
  };

  return (
    <div className="min-h-screen overflow-hidden bg-ink text-parchment">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(72,213,151,0.12),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(214,168,75,0.14),transparent_32%),linear-gradient(180deg,rgba(11,16,32,0.98),rgba(8,12,24,1))]" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-[94rem] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-white/8 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <TechClearMark className="w-16 shrink-0" />
            <div>
              <h1 className="font-heading text-4xl leading-none text-parchment sm:text-5xl">Tech Clear Pitch</h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-parchment/58">
                Demo narrada para escolas e secretarias: descarte verificavel, engajamento do aluno e evidencia para gestao.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleLiveDisposal} variant="success" className="uppercase tracking-[0.18em]">
              Disparo ao vivo
            </Button>
            <Button onClick={openTeacherPanel} variant="primary" className="uppercase tracking-[0.18em]">
              Abrir painel
            </Button>
            <Button onClick={handleReset} variant="secondary" className="uppercase tracking-[0.18em]">
              Resetar demo
            </Button>
          </div>
        </header>

        <section className="grid flex-1 gap-4 py-4 lg:grid-cols-[17rem_minmax(0,1fr)_21rem]">
          <aside className="order-2 space-y-3 lg:order-none">
            <SectionSheet className="px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <SectionKicker>Roteiro</SectionKicker>
                <span className="text-[11px] font-semibold text-brass">{progress}%</span>
              </div>
              <ProgressBar value={progress} className="mt-3 h-2" />
              <div className="mt-4 space-y-2">
                {CHAPTERS.map((chapter, index) => (
                  <button
                    key={chapter.id}
                    onClick={() => setChapterIndex(index)}
                    className={cn(
                      'w-full rounded-[18px] border px-3 py-3 text-left transition-colors',
                      index === chapterIndex
                        ? 'border-brass/38 bg-brass/12'
                        : 'border-white/8 bg-white/[0.025] hover:border-white/16',
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] uppercase tracking-[0.22em] text-parchment/42">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {index < chapterIndex ? <span className="text-xs font-bold text-emerald">OK</span> : null}
                    </div>
                    <p className="mt-2 text-sm font-semibold text-parchment">{chapter.title}</p>
                    <p className="mt-1 text-xs leading-5 text-parchment/50">{chapter.summary}</p>
                  </button>
                ))}
              </div>
            </SectionSheet>

            <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
              <Button onClick={() => setChapterIndex((index) => Math.max(index - 1, 0))} variant="secondary" full>
                Anterior
              </Button>
              <Button onClick={() => setChapterIndex((index) => Math.min(index + 1, CHAPTERS.length - 1))} variant="primary" full>
                Proximo
              </Button>
            </div>
          </aside>

          <section className="order-1 min-w-0 lg:order-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentChapter.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="h-full"
              >
                <PitchStage
                  chapterId={currentChapter.id}
                  liveEvent={liveEvent}
                  onLiveDisposal={handleLiveDisposal}
                  onOpenStudentApp={openStudentApp}
                  onOpenTeacherPanel={openTeacherPanel}
                  snapshot={snapshot}
                  readiness={readiness}
                  classInsights={classInsights}
                  pilotMinutes={pilotMinutes}
                />
              </motion.div>
            </AnimatePresence>
          </section>

          <aside className="order-3 space-y-3 lg:order-none">
            <SectionSheet tone="hero" className="px-4 py-4">
              <SectionKicker>Impacto ao vivo</SectionKicker>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <MetricPill label="Eventos" value={snapshot.totalItems} className="min-w-0" />
                <MetricPill label="Ativos" value={`${snapshot.activeStudents}/${DEMO_STUDENTS.length}`} className="min-w-0" accentClassName="text-emerald" />
                <MetricPill label="Kg" value={snapshot.divertedKg.toLocaleString('pt-BR')} className="min-w-0" />
                <MetricPill label="CO2e" value={snapshot.co2eKg.toLocaleString('pt-BR')} className="min-w-0" accentClassName="text-emerald" />
              </div>
              <div className="mt-4 rounded-[22px] border border-ruby/20 bg-ruby/8 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.22em] text-ruby/80">Ponto critico</p>
                <p className="mt-2 text-base font-semibold text-parchment">{snapshot.criticalCategoryName}</p>
                <p className="mt-1 text-xs leading-5 text-parchment/54">{snapshot.recommendation}</p>
              </div>
            </SectionSheet>

            <SectionSheet className="px-4 py-4">
              <SectionKicker>Ultimos eventos</SectionKicker>
              <div className="mt-4 space-y-2">
                {recentEvents.map((event) => (
                  <ListRow key={event.id} className={cn('px-3 py-3', event.source === 'pitch' && 'border-emerald/35 bg-emerald/8')}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-parchment">{event.itemName}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-parchment/42">
                          {event.studentName} · {event.className}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-brass">+{event.xpEarned}</span>
                    </div>
                  </ListRow>
                ))}
              </div>
            </SectionSheet>

            <SectionSheet className="px-4 py-4">
              <SectionKicker>30 dias</SectionKicker>
              <div className="mt-4 grid grid-cols-10 items-end gap-1">
                {chartData.slice(-20).map((day) => (
                  <div key={day.date} className="flex h-24 items-end rounded-full bg-white/[0.025]">
                    <div
                      className="w-full rounded-full bg-[linear-gradient(180deg,#48D597,#D6A84B)]"
                      style={{ height: `${Math.max(8, Math.min(100, day.total * 3))}%` }}
                    />
                  </div>
                ))}
              </div>
            </SectionSheet>
          </aside>
        </section>
      </main>
    </div>
  );
}

function PitchStage({
  chapterId,
  liveEvent,
  onLiveDisposal,
  onOpenStudentApp,
  onOpenTeacherPanel,
  snapshot,
  readiness,
  classInsights,
  pilotMinutes,
}: {
  chapterId: (typeof CHAPTERS)[number]['id'];
  liveEvent: DisposalEvent | null;
  onLiveDisposal: () => void;
  onOpenStudentApp: () => void;
  onOpenTeacherPanel: () => void;
  snapshot: ReturnType<typeof getImpactSnapshot>;
  readiness: ReturnType<typeof getPilotReadiness>;
  classInsights: ReturnType<typeof getClassInsights>;
  pilotMinutes: string[];
}) {
  if (chapterId === 'problema') {
    return (
      <SectionSheet tone="hero" className="flex min-h-[34rem] flex-col justify-between overflow-hidden">
        <div className="grid gap-6 lg:grid-cols-[1fr_18rem] lg:items-start">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-brass/75">Abertura</p>
            <h2 className="mt-4 break-words font-heading text-[2.6rem] leading-[0.94] text-parchment sm:text-[4.8rem]">
              A escola ja separa lixo. O Tech Clear revela comportamento.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-parchment/66">
              O pitch deixa de vender uma lixeira e passa a vender uma operacao educativa mensuravel: cada descarte vira dado, cada dado vira intervencao, cada intervencao vira impacto para a rede.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] px-5 py-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-parchment/42">Sem Tech Clear</p>
            <div className="mt-4 space-y-3">
              {['Sem autoria do descarte', 'Sem taxa de contaminacao', 'Sem turma responsavel', 'Sem prova para secretaria'].map((item) => (
                <ListRow key={item} className="border-ruby/18 bg-ruby/8 px-3 py-3 text-sm text-parchment/72">
                  {item}
                </ListRow>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          <ValueCard label="Aprendizagem" value="missao diaria" />
          <ValueCard label="Operacao" value="evento auditavel" />
          <ValueCard label="Gestao" value="ata automatica" />
        </div>
      </SectionSheet>
    );
  }

  if (chapterId === 'descarte') {
    const category = getCategoryInfo(liveEvent?.category ?? 'plastico');
    return (
      <SectionSheet tone="hero" className="min-h-[34rem]">
        <div className="grid gap-6 xl:grid-cols-[1fr_21rem]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-emerald/80">Momento demonstravel</p>
            <h2 className="mt-4 break-words font-heading text-[2.6rem] leading-[0.94] text-parchment sm:text-[4.4rem]">
              Lucas descarta PET. A rede ganha uma evidencia.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-parchment/66">
              O evento simula a fronteira futura da API: aluno, turma, item, peso, confianca, XP e origem do equipamento.
            </p>
            <Button onClick={onLiveDisposal} variant="success" size="lg" className="mt-7 uppercase tracking-[0.22em]">
              Registrar descarte PET
            </Button>
          </div>

          <div className="rounded-[30px] border border-emerald/24 bg-emerald/8 px-5 py-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-parchment/46">Evento</p>
                <p className="mt-1 text-lg font-semibold text-parchment">{liveEvent ? 'Confirmado' : 'Aguardando leitura'}</p>
              </div>
              <div className="flex size-14 items-center justify-center rounded-full border border-emerald/35 bg-emerald/16 text-2xl">
                {liveEvent ? '✓' : '•'}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <FactRow label="Aluno" value={liveEvent?.studentName ?? 'Lucas Silva'} />
              <FactRow label="Turma" value={liveEvent?.className ?? '7A'} />
              <FactRow label="Item" value={liveEvent?.itemName ?? 'Garrafa PET'} />
              <FactRow label="Destino" value={`Lixeira ${category.conamaColor}`} />
              <FactRow label="Confianca" value={`${liveEvent?.confidence ?? 96}%`} />
              <FactRow label="XP" value={`+${liveEvent?.xpEarned ?? 42}`} />
            </div>
          </div>
        </div>
      </SectionSheet>
    );
  }

  if (chapterId === 'equipamento') {
    return (
      <SectionSheet tone="hero" className="min-h-[34rem]">
        <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-brass/75">Prova fisica</p>
            <h2 className="mt-4 break-words font-heading text-[2.6rem] leading-[0.94] text-parchment sm:text-[4.4rem]">
              Baixo custo, alta clareza operacional.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-parchment/66">
              A lixeira maker usa tambor reaproveitado, sensores acessiveis e compartimentos coloridos. O hardware faz o que precisa: identifica, roteia e envia o evento.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/equipamento"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[linear-gradient(180deg,#E5C176_0%,#D6A84B_100%)] px-5 text-sm font-semibold uppercase tracking-[0.18em] text-ink"
              >
                Ver 3D maker
              </Link>
              <Button variant="secondary" onClick={onLiveDisposal} className="uppercase tracking-[0.18em]">
                Reenviar evento
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <ValueCard label="BOM estimado" value={`R$ ${snapshot.equipmentCostEstimate}`} />
            <FlowStep index="01" title="Identifica" body="camera, peso e sensores confirmam o residuo." />
            <FlowStep index="02" title="Roteia" body="servo direciona a calha para o compartimento correto." />
            <FlowStep index="03" title="Envia" body="evento chega ao app e ao painel por WiFi." />
          </div>
        </div>
      </SectionSheet>
    );
  }

  if (chapterId === 'app') {
    return (
      <SectionSheet tone="hero" className="min-h-[34rem]">
        <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-emerald/80">Engajamento</p>
            <h2 className="mt-4 break-words font-heading text-[2.6rem] leading-[0.94] text-parchment sm:text-[4.4rem]">
              O aluno nao recebe sermão. Recebe progresso.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-parchment/66">
              XP, streak, missoes e recompensas transformam reciclagem em rotina. A estética de guilda fala com o aluno; os dados falam com a escola.
            </p>
            <Button onClick={onOpenStudentApp} variant="success" size="lg" className="mt-7 uppercase tracking-[0.22em]">
              Abrir app do aluno
            </Button>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,32,58,0.98),rgba(8,12,24,0.98))] px-5 py-5">
            <div className="flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-[22px] border border-brass/24 bg-brass/10 text-4xl">
                {DEMO_STUDENTS[0].avatar}
              </div>
              <div>
                <p className="text-lg font-semibold text-parchment">{DEMO_STUDENTS[0].name}</p>
                <p className="text-[11px] uppercase tracking-[0.22em] text-brass/70">Turma {DEMO_STUDENTS[0].className}</p>
              </div>
            </div>
            <div className="mt-5 rounded-[24px] border border-emerald/24 bg-emerald/8 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-parchment/46">Leitura concluida</p>
              <p className="mt-2 font-heading text-5xl leading-none text-brass">+{liveEvent?.xpEarned ?? 42} XP</p>
              <p className="mt-2 text-sm leading-6 text-parchment/58">Missao diaria atualizada e streak preservado.</p>
            </div>
          </div>
        </div>
      </SectionSheet>
    );
  }

  if (chapterId === 'professor') {
    const bestClass = classInsights.toSorted((a, b) => b.totalDisposals - a.totalDisposals)[0];
    return (
      <SectionSheet tone="hero" className="min-h-[34rem]">
        <div className="grid gap-6 xl:grid-cols-[1fr_23rem]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-brass/75">Painel pedagogico</p>
            <h2 className="mt-4 break-words font-heading text-[2.6rem] leading-[0.94] text-parchment sm:text-[4.4rem]">
              O professor ve padrao, nao so pontuacao.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-parchment/66">
              A mesma leitura que animou Lucas aponta quais turmas aderiram, qual material contamina mais e qual acao pedagogica faz sentido agora.
            </p>
            <Button onClick={onOpenTeacherPanel} variant="primary" size="lg" className="mt-7 uppercase tracking-[0.22em]">
              Ver painel completo
            </Button>
          </div>

          <div className="space-y-3">
            <ValueCard label="Turma com tracao" value={bestClass?.className ?? '--'} />
            {classInsights.slice(0, 3).map((classInsight) => (
              <ListRow key={classInsight.className}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-parchment">Turma {classInsight.className}</p>
                    <p className="mt-1 text-xs leading-5 text-parchment/50">{classInsight.recommendation}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-brass">{classInsight.totalDisposals}</p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-parchment/40">eventos</p>
                  </div>
                </div>
              </ListRow>
            ))}
          </div>
        </div>
      </SectionSheet>
    );
  }

  return (
    <SectionSheet tone="hero" className="min-h-[34rem]">
      <div className="grid gap-6 xl:grid-cols-[1fr_25rem]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-emerald/80">Fechamento</p>
          <h2 className="mt-4 break-words font-heading text-[2.6rem] leading-[0.94] text-parchment sm:text-[4.4rem]">
            A proposta nao e comprar lixeiras. E pilotar aprendizagem mensuravel.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-parchment/66">
            Para secretaria, o Tech Clear vira um pacote simples: equipamento maker, app de engajamento, painel docente, relatorio de impacto e parceiros locais.
          </p>

          <div className="mt-7 grid gap-3 md:grid-cols-3">
            <ValueCard label="90 dias" value="piloto" />
            <ValueCard label="Rede" value={readiness.headline} />
            <ValueCard label="Custo" value={`R$ ${snapshot.equipmentCostEstimate}`} />
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] px-5 py-5">
          <SectionKicker>Ata automatica</SectionKicker>
          <div className="mt-4 space-y-3">
            {pilotMinutes.map((line) => (
              <p key={line} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-3 text-sm leading-6 text-parchment/72">
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </SectionSheet>
  );
}

function ValueCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.04] px-4 py-4">
      <p className="text-[10px] uppercase tracking-[0.22em] text-parchment/40">{label}</p>
      <p className="mt-2 font-heading text-3xl leading-none text-brass">{value}</p>
    </div>
  );
}

function FactRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-3">
      <span className="text-[10px] uppercase tracking-[0.2em] text-parchment/42">{label}</span>
      <span className="text-sm font-semibold text-parchment">{value}</span>
    </div>
  );
}

function FlowStep({ index, title, body }: { index: string; title: string; body: string }) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.04] px-4 py-4">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-brass/24 bg-brass/10 text-xs font-semibold text-brass">
          {index}
        </span>
        <div>
          <p className="text-base font-semibold text-parchment">{title}</p>
          <p className="mt-1 text-sm leading-6 text-parchment/58">{body}</p>
        </div>
      </div>
    </div>
  );
}
