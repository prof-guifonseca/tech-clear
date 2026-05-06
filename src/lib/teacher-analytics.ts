import { WASTE_CATEGORIES } from '@/data/waste-categories';
import {
  getCategoryLabel,
  getImpactSnapshot,
  type ChartDatum,
  type ClassInsight,
  type DisposalEvent,
  type ImpactSnapshot,
} from '@/lib/demo-ledger';
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

export function getDashboardStats(
  chartData: ChartDatum[],
  students: Student[],
  snapshot: ImpactSnapshot = getImpactSnapshot([], students),
) {
  const totalStudents = students.length;
  const totalItems = chartData.reduce((sum, day) => sum + day.total, 0);

  return [
    { label: 'Eventos registrados', value: totalItems, icon: '♻', suffix: '' },
    { label: 'Alunos ativos', value: snapshot.activeStudents, icon: '👥', suffix: `/${totalStudents}` },
    { label: 'Kg desviados', value: snapshot.divertedKg.toLocaleString('pt-BR'), icon: '↗', suffix: ' kg' },
    { label: 'CO2e estimado', value: snapshot.co2eKg.toLocaleString('pt-BR'), icon: '↓', suffix: ' kg' },
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

export function getPilotReadiness(snapshot: ImpactSnapshot, classInsights: ClassInsight[]) {
  const bestClass = classInsights.toSorted((a, b) => b.totalDisposals - a.totalDisposals)[0];
  const needsAttention = classInsights.toSorted((a, b) => b.contaminationRate - a.contaminationRate)[0];

  return {
    headline: snapshot.engagementRate >= 80 ? 'Pronto para piloto ampliado' : 'Piloto inicial recomendado',
    bestClass: bestClass?.className ?? '--',
    needsAttentionClass: needsAttention?.className ?? '--',
    secretarySignal:
      snapshot.contaminationRate <= 10
        ? 'A escola ja produz evidencia suficiente para um ciclo de 90 dias com metas por turma.'
        : 'A escola precisa de uma rodada pedagogica curta antes de ampliar a coleta.',
  };
}

export function getPilotMinutes(events: DisposalEvent[], students: Student[]) {
  const snapshot = getImpactSnapshot(events, students);
  const criticalColor = getCategoryLabel(snapshot.criticalCategory, 'conamaColor').toLowerCase();
  const mainColor = getCategoryLabel(snapshot.mostWorkedCategory, 'conamaColor').toLowerCase();

  return [
    `Ata automatica do piloto Tech Clear: ${snapshot.totalItems} eventos de descarte registrados nos ultimos 30 dias, com ${snapshot.activeStudents} alunos ativos.`,
    `O material mais trabalhado foi ${mainColor}; o ponto critico atual e ${criticalColor}, com contaminacao em ${snapshot.contaminationRate}% dos eventos.`,
    `Estimativa ambiental: ${snapshot.divertedKg.toLocaleString('pt-BR')} kg desviados do lixo comum e ${snapshot.co2eKg.toLocaleString('pt-BR')} kg CO2e evitados.`,
    `Encaminhamento sugerido: ${snapshot.recommendation}`,
  ];
}
