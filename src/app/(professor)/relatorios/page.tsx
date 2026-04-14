'use client';

import { useMemo } from 'react';
import { WASTE_CATEGORIES } from '@/data/waste-categories';
import { DEMO_STUDENTS } from '@/data/students';
import { generateChartData, generateClassStats } from '@/data/mock-history';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

export default function RelatoriosPage() {
  const chartData = useMemo(() => generateChartData(), []);
  const classStats = useMemo(() => generateClassStats(), []);

  const pieData = WASTE_CATEGORIES.map(cat => ({
    name: cat.name,
    label: cat.conamaColor,
    value: chartData.reduce((sum, d) => sum + (d[cat.id as keyof typeof d] as number || 0), 0),
    color: cat.color,
  }));

  const totalByWeek = useMemo(() => {
    const weeks = [];
    for (let i = 0; i < 4; i++) {
      const weekData = chartData.slice(i * 7, (i + 1) * 7);
      weeks.push({
        week: `Semana ${i + 1}`,
        total: weekData.reduce((sum, d) => sum + d.total, 0),
        papel: weekData.reduce((sum, d) => sum + d.papel, 0),
        plastico: weekData.reduce((sum, d) => sum + d.plastico, 0),
        vidro: weekData.reduce((sum, d) => sum + d.vidro, 0),
        metal: weekData.reduce((sum, d) => sum + d.metal, 0),
        organico: weekData.reduce((sum, d) => sum + d.organico, 0),
      });
    }
    return weeks;
  }, [chartData]);

  const radarData = WASTE_CATEGORIES.filter(c => c.id !== 'rejeito').map(cat => ({
    subject: cat.conamaColor,
    value: chartData.reduce((sum, d) => sum + (d[cat.id as keyof typeof d] as number || 0), 0),
  }));

  const levelDistribution = [
    { range: 'Nv 1-2', count: DEMO_STUDENTS.filter(s => s.level <= 2).length },
    { range: 'Nv 3-4', count: DEMO_STUDENTS.filter(s => s.level >= 3 && s.level <= 4).length },
    { range: 'Nv 5-6', count: DEMO_STUDENTS.filter(s => s.level >= 5 && s.level <= 6).length },
    { range: 'Nv 7-8', count: DEMO_STUDENTS.filter(s => s.level >= 7 && s.level <= 8).length },
    { range: 'Nv 9-10', count: DEMO_STUDENTS.filter(s => s.level >= 9).length },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-gold">📈 Relatorios</h1>
        <p className="text-parchment-dark mt-1">Analise detalhada do programa de reciclagem</p>
      </div>

      {/* Area Chart - Stacked Categories Over Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rpg-card p-4 mb-6"
      >
        <h3 className="font-heading text-lg text-gold mb-4">📊 Reciclagem por Categoria (30 dias)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#0f346040" />
            <XAxis dataKey="date" tick={{ fill: '#d4c4a8', fontSize: 10 }} interval={4} />
            <YAxis tick={{ fill: '#d4c4a8', fontSize: 10 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#16213e', border: '1px solid #e6b42240', borderRadius: 8, color: '#f0e6d3' }}
            />
            <Legend wrapperStyle={{ color: '#d4c4a8' }} />
            {WASTE_CATEGORIES.filter(c => c.id !== 'rejeito').map(cat => (
              <Area
                key={cat.id}
                type="monotone"
                dataKey={cat.id}
                name={cat.conamaColor}
                stackId="1"
                fill={cat.color}
                stroke={cat.color}
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rpg-card p-4"
        >
          <h3 className="font-heading text-lg text-gold mb-4">🎨 Distribuicao Total</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={({ name, percent }: { name?: string; percent?: number }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
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

        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rpg-card p-4"
        >
          <h3 className="font-heading text-lg text-gold mb-4">🎯 Perfil de Reciclagem</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#0f346060" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#d4c4a8', fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fill: '#d4c4a8', fontSize: 9 }} />
              <Radar dataKey="value" fill="#e6b422" fillOpacity={0.3} stroke="#e6b422" strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Weekly Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rpg-card p-4"
        >
          <h3 className="font-heading text-lg text-gold mb-4">📅 Comparacao Semanal</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={totalByWeek}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0f346040" />
              <XAxis dataKey="week" tick={{ fill: '#d4c4a8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#d4c4a8', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#16213e', border: '1px solid #e6b42240', borderRadius: 8, color: '#f0e6d3' }}
              />
              <Bar dataKey="total" name="Total" fill="#2ecc71" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Level Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rpg-card p-4"
        >
          <h3 className="font-heading text-lg text-gold mb-4">⭐ Distribuicao por Nivel</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={levelDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0f346040" />
              <XAxis dataKey="range" tick={{ fill: '#d4c4a8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#d4c4a8', fontSize: 10 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#16213e', border: '1px solid #e6b42240', borderRadius: 8, color: '#f0e6d3' }}
              />
              <Bar dataKey="count" name="Alunos" fill="#e6b422" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rpg-card p-4"
      >
        <h3 className="font-heading text-lg text-gold mb-4">📋 Resumo por Turma</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/20">
                <th className="text-left py-2 text-parchment-dark">Turma</th>
                <th className="text-right py-2 text-parchment-dark">Alunos</th>
                <th className="text-right py-2 text-parchment-dark">Descartes</th>
                <th className="text-right py-2 text-parchment-dark">XP Total</th>
                <th className="text-right py-2 text-parchment-dark">XP Medio</th>
              </tr>
            </thead>
            <tbody>
              {classStats.map(cls => (
                <tr key={cls.className} className="border-b border-navy/30 hover:bg-navy/20">
                  <td className="py-2 font-semibold text-parchment">Turma {cls.className}</td>
                  <td className="py-2 text-right text-parchment-dark">{cls.students}</td>
                  <td className="py-2 text-right text-emerald font-semibold">{cls.totalDisposals}</td>
                  <td className="py-2 text-right text-gold font-semibold">{cls.totalXp.toLocaleString()}</td>
                  <td className="py-2 text-right text-parchment-dark">{cls.avgXp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
