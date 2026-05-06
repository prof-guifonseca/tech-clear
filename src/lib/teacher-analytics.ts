import { WASTE_CATEGORIES } from '@/data/waste-categories';
import type { ChartDatum } from '@/data/mock-history';
import type { Student } from '@/types/student';

export const chartTextColor = '#c7bdaa';
export const chartGridColor = '#ffffff18';
export const chartTooltipStyle = {
  backgroundColor: '#14203a',
  border: '1px solid rgba(214,168,75,0.28)',
  borderRadius: 12,
  color: '#f5ead0',
} as const;

export function getCategoryTotals(chartData: ChartDatum[], label: 'name' | 'conamaColor' = 'conamaColor') {
  return WASTE_CATEGORIES.map((category) => ({
    id: category.id,
    name: category[label],
    value: chartData.reduce((sum, day) => sum + day[category.id], 0),
    color: category.color,
  }));
}

export function getDashboardStats(chartData: ChartDatum[], students: Student[]) {
  const totalStudents = students.length;
  const totalXp = students.reduce((sum, student) => sum + student.totalXp, 0);
  const avgLevel = totalStudents
    ? (students.reduce((sum, student) => sum + student.level, 0) / totalStudents).toFixed(1)
    : '0.0';
  const totalItems = chartData.reduce((sum, day) => sum + day.total, 0);

  return [
    { label: 'Total reciclado', value: totalItems, icon: '♻', suffix: ' itens' },
    { label: 'Alunos ativos', value: totalStudents, icon: '👥', suffix: '' },
    { label: 'XP distribuido', value: totalXp.toLocaleString('pt-BR'), icon: '✦', suffix: '' },
    { label: 'Nivel medio', value: avgLevel, icon: '★', suffix: '' },
  ];
}

export function getWeeklyTotals(chartData: ChartDatum[]) {
  return Array.from({ length: 4 }, (_, index) => {
    const weekData = chartData.slice(index * 7, (index + 1) * 7);
    return {
      week: `Semana ${index + 1}`,
      total: weekData.reduce((sum, day) => sum + day.total, 0),
      papel: weekData.reduce((sum, day) => sum + day.papel, 0),
      plastico: weekData.reduce((sum, day) => sum + day.plastico, 0),
      vidro: weekData.reduce((sum, day) => sum + day.vidro, 0),
      metal: weekData.reduce((sum, day) => sum + day.metal, 0),
      organico: weekData.reduce((sum, day) => sum + day.organico, 0),
    };
  });
}

export function getRadarData(chartData: ChartDatum[]) {
  return WASTE_CATEGORIES.filter((category) => category.id !== 'rejeito').map((category) => ({
    subject: category.conamaColor,
    value: chartData.reduce((sum, day) => sum + day[category.id], 0),
  }));
}

export function getLevelDistribution(students: Student[]) {
  return [
    { range: 'Nv 1-2', count: students.filter((student) => student.level <= 2).length },
    { range: 'Nv 3-4', count: students.filter((student) => student.level >= 3 && student.level <= 4).length },
    { range: 'Nv 5-6', count: students.filter((student) => student.level >= 5 && student.level <= 6).length },
    { range: 'Nv 7-8', count: students.filter((student) => student.level >= 7 && student.level <= 8).length },
    { range: 'Nv 9-10', count: students.filter((student) => student.level >= 9).length },
  ];
}
