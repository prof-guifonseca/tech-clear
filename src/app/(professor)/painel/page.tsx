'use client';

import { useMemo } from 'react';
import { DEMO_STUDENTS } from '@/data/students';
import { WASTE_CATEGORIES } from '@/data/waste-categories';
import { generateChartData, generateClassStats } from '@/data/mock-history';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';

export default function PainelPage() {
  const chartData = useMemo(() => generateChartData(), []);
  const classStats = useMemo(() => generateClassStats(), []);

  const totalStudents = DEMO_STUDENTS.length;
  const totalXp = DEMO_STUDENTS.reduce((sum, s) => sum + s.totalXp, 0);
  const avgLevel = (DEMO_STUDENTS.reduce((sum, s) => sum + s.level, 0) / totalStudents).toFixed(1);
  const totalItems = chartData.reduce((sum, d) => sum + d.total, 0);

  const pieData = WASTE_CATEGORIES.map(cat => ({
    name: cat.conamaColor,
    value: chartData.reduce((sum, d) => sum + (d[cat.id as keyof typeof d] as number || 0), 0),
    color: cat.color,
  }));

  const statCards = [
    { label: 'Total Reciclado', value: totalItems, icon: '♻️', suffix: ' itens' },
    { label: 'Alunos Ativos', value: totalStudents, icon: '👥', suffix: '' },
    { label: 'XP Distribuido', value: totalXp.toLocaleString(), icon: '🪙', suffix: '' },
    { label: 'Nivel Medio', value: avgLevel, icon: '⭐', suffix: '' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-gold">📊 Painel Geral</h1>
        <p className="text-parchment-dark mt-1">Visao geral do programa de reciclagem</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rpg-card p-4"
          >
            <div className="text-2xl mb-2">{card.icon}</div>
            <div className="text-2xl font-bold text-gold">{card.value}{card.suffix}</div>
            <div className="text-sm text-parchment-dark">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Line Chart - Recycling Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rpg-card p-4"
        >
          <h3 className="font-heading text-lg text-gold mb-4">📈 Volume de Reciclagem (30 dias)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0f346040" />
              <XAxis dataKey="date" tick={{ fill: '#d4c4a8', fontSize: 10 }} interval={4} />
              <YAxis tick={{ fill: '#d4c4a8', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#16213e', border: '1px solid #e6b42240', borderRadius: 8, color: '#f0e6d3' }}
              />
              <Line type="monotone" dataKey="total" stroke="#e6b422" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart - Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rpg-card p-4"
        >
          <h3 className="font-heading text-lg text-gold mb-4">🎨 Distribuicao por Categoria</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#16213e', border: '1px solid #e6b42240', borderRadius: 8, color: '#f0e6d3' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bar Chart - Class Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rpg-card p-4 mb-6"
      >
        <h3 className="font-heading text-lg text-gold mb-4">🏫 Comparacao entre Turmas</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={classStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#0f346040" />
            <XAxis dataKey="className" tick={{ fill: '#d4c4a8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#d4c4a8', fontSize: 10 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#16213e', border: '1px solid #e6b42240', borderRadius: 8, color: '#f0e6d3' }}
            />
            <Legend wrapperStyle={{ color: '#d4c4a8' }} />
            <Bar dataKey="totalDisposals" name="Descartes" fill="#2ecc71" radius={[4, 4, 0, 0]} />
            <Bar dataKey="avgXp" name="XP Medio" fill="#e6b422" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Top Students */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rpg-card p-4"
      >
        <h3 className="font-heading text-lg text-gold mb-4">🏆 Top Alunos</h3>
        <div className="space-y-2">
          {[...DEMO_STUDENTS].sort((a, b) => b.totalXp - a.totalXp).slice(0, 5).map((student, i) => (
            <div key={student.id} className="flex items-center gap-3 p-2 bg-navy/30 rounded-lg">
              <span className="text-lg w-6 text-center">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
              </span>
              <span className="text-xl">{student.avatar}</span>
              <div className="flex-1">
                <span className="text-sm font-semibold text-parchment">{student.name}</span>
                <span className="text-xs text-parchment-dark ml-2">Turma {student.className}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gold">{student.totalXp} XP</div>
                <div className="text-xs text-parchment-dark">Nv.{student.level}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
