'use client';

import { useMemo, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ListRow, SectionKicker, SectionSheet } from '@/components/tech-clear/ui';
import { DEMO_STUDENTS } from '@/data/students';
import { generateChartData, generateClassStats } from '@/data/mock-history';
import {
  chartGridColor,
  chartTextColor,
  chartTooltipStyle,
  getCategoryTotals,
  getDashboardStats,
} from '@/lib/teacher-analytics';

const CHART_MARGIN = { left: -12, right: 8, top: 8, bottom: 0 };

export default function PainelPage() {
  const chartData = useMemo(() => generateChartData(), []);
  const classStats = useMemo(() => generateClassStats(), []);
  const categoryTotals = useMemo(() => getCategoryTotals(chartData), [chartData]);
  const statCards = useMemo(() => getDashboardStats(chartData, DEMO_STUDENTS), [chartData]);
  const topStudents = useMemo(
    () => DEMO_STUDENTS.toSorted((a, b) => b.totalXp - a.totalXp).slice(0, 5),
    [],
  );

  return (
    <div className="space-y-6">
      <header>
        <SectionKicker>Visao geral</SectionKicker>
        <h1 className="mt-2 font-heading text-4xl font-bold leading-none text-brass">Painel Geral</h1>
        <p className="mt-2 text-sm text-parchment/62">Saude do programa, volume de descartes e turmas em destaque.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, ease: 'easeOut' }}
          >
            <SectionSheet className="h-full rounded-[24px] px-4 py-4">
              <div className="text-2xl">{card.icon}</div>
              <p className="mt-3 text-2xl font-bold text-brass">
                {card.value}
                {card.suffix}
              </p>
              <p className="mt-1 text-sm text-parchment/58">{card.label}</p>
            </SectionSheet>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ChartPanel kicker="30 dias" title="Volume de reciclagem" delay={0.16}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={CHART_MARGIN}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
              <XAxis dataKey="date" tick={{ fill: chartTextColor, fontSize: 10 }} interval={4} />
              <YAxis tick={{ fill: chartTextColor, fontSize: 10 }} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Line type="monotone" dataKey="total" stroke="#d6a84b" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel kicker="Categorias" title="Distribuicao por cor" delay={0.22}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={categoryTotals}
                cx="50%"
                cy="50%"
                innerRadius={54}
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
      </section>

      <ChartPanel kicker="Turmas" title="Comparacao entre turmas" delay={0.28}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={classStats} margin={CHART_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
            <XAxis dataKey="className" tick={{ fill: chartTextColor, fontSize: 12 }} />
            <YAxis tick={{ fill: chartTextColor, fontSize: 10 }} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Legend wrapperStyle={{ color: chartTextColor }} />
            <Bar dataKey="totalDisposals" name="Descartes" fill="#48d597" radius={[4, 4, 0, 0]} />
            <Bar dataKey="avgXp" name="XP medio" fill="#d6a84b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartPanel>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.34, ease: 'easeOut' }}
      >
        <SectionSheet>
          <SectionKicker>Ranking interno</SectionKicker>
          <h2 className="mt-2 font-heading text-3xl leading-none text-parchment">Top alunos</h2>
          <div className="mt-5 space-y-3">
            {topStudents.map((student, index) => (
              <ListRow key={student.id}>
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-sm font-semibold text-brass">
                    {index + 1}
                  </span>
                  <span className="text-2xl">{student.avatar}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-parchment">{student.name}</p>
                    <p className="text-xs text-parchment/45">Turma {student.className} · Nv. {student.level}</p>
                  </div>
                  <p className="text-sm font-bold text-brass">{student.totalXp} XP</p>
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
