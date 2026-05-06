'use client';

import { useMemo, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ListRow, SectionKicker, SectionSheet } from '@/components/tech-clear/ui';
import { DEMO_STUDENTS } from '@/data/students';
import { WASTE_CATEGORIES } from '@/data/waste-categories';
import { useDemoLedger } from '@/hooks/use-demo-ledger';
import {
  getChartDataFromLedger,
  getClassInsights,
  getImpactSnapshot,
} from '@/lib/demo-ledger';
import {
  chartGridColor,
  chartTextColor,
  chartTooltipStyle,
  getCategoryTotals,
  getLevelDistribution,
  getPilotMinutes,
  getRadarData,
  getWeeklyTotals,
} from '@/lib/teacher-analytics';

const CHART_MARGIN = { left: -12, right: 8, top: 8, bottom: 0 };

export default function RelatoriosPage() {
  const { events } = useDemoLedger();
  const chartData = useMemo(() => getChartDataFromLedger(events), [events]);
  const classStats = useMemo(() => getClassInsights(events, DEMO_STUDENTS), [events]);
  const snapshot = useMemo(() => getImpactSnapshot(events, DEMO_STUDENTS), [events]);
  const pilotMinutes = useMemo(() => getPilotMinutes(events, DEMO_STUDENTS), [events]);
  const categoryTotals = useMemo(() => getCategoryTotals(chartData, 'name'), [chartData]);
  const weeklyTotals = useMemo(() => getWeeklyTotals(chartData), [chartData]);
  const radarData = useMemo(() => getRadarData(chartData), [chartData]);
  const levelDistribution = useMemo(() => getLevelDistribution(DEMO_STUDENTS), []);

  return (
    <div className="space-y-6">
      <header>
        <SectionKicker>Analise detalhada</SectionKicker>
        <h1 className="mt-2 font-heading text-4xl font-bold leading-none text-brass">Relatorios</h1>
        <p className="mt-2 text-sm text-parchment/62">Leitura de categorias, semanas, maturidade das turmas e narrativa pronta para coordenacao.</p>
      </header>

      <section className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
        <SectionSheet>
          <SectionKicker>Impacto consolidado</SectionKicker>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Metric label="Itens" value={snapshot.totalItems} tone="text-emerald" />
            <Metric label="Corretos" value={snapshot.correctItems} tone="text-brass" />
            <Metric label="Kg desviados" value={snapshot.divertedKg.toLocaleString('pt-BR')} />
            <Metric label="Contaminacao" value={`${snapshot.contaminationRate}%`} tone="text-ruby" />
          </div>
        </SectionSheet>

        <SectionSheet>
          <SectionKicker>Ata automatica</SectionKicker>
          <h2 className="mt-2 font-heading text-3xl leading-none text-parchment">Resumo para gestao</h2>
          <div className="mt-4 space-y-2">
            {pilotMinutes.map((line) => (
              <ListRow key={line} className="px-3 py-3">
                <p className="text-sm leading-6 text-parchment/72">{line}</p>
              </ListRow>
            ))}
          </div>
        </SectionSheet>
      </section>

      <ChartPanel kicker="30 dias" title="Reciclagem por categoria" delay={0}>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData} margin={CHART_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
            <XAxis dataKey="date" tick={{ fill: chartTextColor, fontSize: 10 }} interval={4} />
            <YAxis tick={{ fill: chartTextColor, fontSize: 10 }} />
            <Tooltip contentStyle={chartTooltipStyle} />
            {WASTE_CATEGORIES.filter((category) => category.id !== 'rejeito').map((category) => (
              <Area
                key={category.id}
                type="monotone"
                dataKey={category.id}
                name={category.conamaColor}
                stackId="1"
                fill={category.color}
                stroke={category.color}
                fillOpacity={0.62}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </ChartPanel>

      <section className="grid gap-4 xl:grid-cols-2">
        <ChartPanel kicker="Total" title="Distribuicao geral" delay={0.08}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={categoryTotals}
                cx="50%"
                cy="50%"
                outerRadius={92}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {categoryTotals.map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={chartTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel kicker="Perfil" title="Forca por material" delay={0.14}>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={chartGridColor} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: chartTextColor, fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fill: chartTextColor, fontSize: 9 }} />
              <Radar dataKey="value" fill="#d6a84b" fillOpacity={0.3} stroke="#d6a84b" strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ChartPanel kicker="Semanas" title="Comparacao semanal" delay={0.2}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyTotals} margin={CHART_MARGIN}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
              <XAxis dataKey="week" tick={{ fill: chartTextColor, fontSize: 10 }} />
              <YAxis tick={{ fill: chartTextColor, fontSize: 10 }} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="total" name="Total" fill="#48d597" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel kicker="Niveis" title="Distribuicao dos alunos" delay={0.26}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={levelDistribution} margin={CHART_MARGIN}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
              <XAxis dataKey="range" tick={{ fill: chartTextColor, fontSize: 10 }} />
              <YAxis tick={{ fill: chartTextColor, fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="count" name="Alunos" fill="#d6a84b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32, ease: 'easeOut' }}
      >
        <SectionSheet>
          <SectionKicker>Resumo por turma</SectionKicker>
          <h2 className="mt-2 font-heading text-3xl leading-none text-parchment">Performance consolidada</h2>
          <div className="mt-5 space-y-3">
            {classStats.map((classStat) => (
              <ListRow key={classStat.className}>
                <div className="grid grid-cols-[1fr_auto] gap-3 md:grid-cols-[1fr_repeat(4,auto)] md:items-center">
                  <div>
                    <p className="font-semibold text-parchment">Turma {classStat.className}</p>
                    <p className="text-xs text-parchment/45">{classStat.students} alunos ativos</p>
                  </div>
                  <Metric label="Descartes" value={classStat.totalDisposals} tone="text-emerald" />
                  <Metric label="XP total" value={classStat.totalXp.toLocaleString('pt-BR')} tone="text-brass" />
                  <Metric label="XP medio" value={classStat.avgXp} />
                  <Metric label="Alunos" value={classStat.students} />
                </div>
              </ListRow>
            ))}
          </div>
        </SectionSheet>
      </motion.section>
    </div>
  );
}

function ChartPanel({
  kicker,
  title,
  delay,
  children,
}: {
  kicker: string;
  title: string;
  delay: number;
  children: ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, ease: 'easeOut' }}
    >
      <SectionSheet className="h-full">
        <SectionKicker>{kicker}</SectionKicker>
        <h2 className="mt-2 font-heading text-2xl leading-none text-parchment">{title}</h2>
        <div className="mt-4">{children}</div>
      </SectionSheet>
    </motion.section>
  );
}

function Metric({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="text-right">
      <p className={`text-sm font-semibold ${tone ?? 'text-parchment'}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-[0.18em] text-parchment/38">{label}</p>
    </div>
  );
}
