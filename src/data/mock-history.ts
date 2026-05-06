import type { DisposalRecord } from '@/types/waste';

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export const MOCK_DISPOSALS: DisposalRecord[] = [
  { id: 'mock-001', studentId: 'aluno-1', itemId: 'garrafa-pet', itemName: 'Garrafa PET', category: 'plastico', xpEarned: 15, timestamp: daysAgo(0), wasCorrect: true },
  { id: 'mock-002', studentId: 'aluno-1', itemId: 'jornal', itemName: 'Jornal Velho', category: 'papel', xpEarned: 10, timestamp: daysAgo(1), wasCorrect: true },
  { id: 'mock-003', studentId: 'aluno-2', itemId: 'lata-aluminio', itemName: 'Lata de Aluminio', category: 'metal', xpEarned: 12, timestamp: daysAgo(0), wasCorrect: true },
  { id: 'mock-004', studentId: 'aluno-2', itemId: 'casca-banana', itemName: 'Casca de Banana', category: 'organico', xpEarned: 8, timestamp: daysAgo(0), wasCorrect: true },
  { id: 'mock-005', studentId: 'aluno-3', itemId: 'caixa-papelao', itemName: 'Caixa de Papelao', category: 'papel', xpEarned: 10, timestamp: daysAgo(2), wasCorrect: true },
  { id: 'mock-006', studentId: 'aluno-5', itemId: 'pote-vidro', itemName: 'Pote de Vidro', category: 'vidro', xpEarned: 12, timestamp: daysAgo(0), wasCorrect: true },
  { id: 'mock-007', studentId: 'aluno-5', itemId: 'garrafa-pet', itemName: 'Garrafa PET', category: 'plastico', xpEarned: 15, timestamp: daysAgo(0), wasCorrect: true },
  { id: 'mock-008', studentId: 'aluno-5', itemId: 'latinha-refri', itemName: 'Latinha de Refrigerante', category: 'metal', xpEarned: 12, timestamp: daysAgo(1), wasCorrect: true },
  { id: 'mock-009', studentId: 'aluno-7', itemId: 'garrafa-vidro', itemName: 'Garrafa de Vidro', category: 'vidro', xpEarned: 12, timestamp: daysAgo(0), wasCorrect: true },
  { id: 'mock-010', studentId: 'aluno-7', itemId: 'papel-amassado', itemName: 'Papel Amassado', category: 'papel', xpEarned: 10, timestamp: daysAgo(0), wasCorrect: true },
  { id: 'mock-011', studentId: 'aluno-4', itemId: 'resto-comida', itemName: 'Resto de Comida', category: 'organico', xpEarned: 8, timestamp: daysAgo(1), wasCorrect: true },
  { id: 'mock-012', studentId: 'aluno-6', itemId: 'saco-plastico', itemName: 'Sacola Plastica', category: 'plastico', xpEarned: 10, timestamp: daysAgo(3), wasCorrect: true },
];

export type ChartDatum = {
  date: string;
  papel: number;
  plastico: number;
  vidro: number;
  metal: number;
  organico: number;
  rejeito: number;
  total: number;
};

export function generateChartData(): ChartDatum[] {
  const data: ChartDatum[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = `${d.getDate()}/${d.getMonth() + 1}`;
    const day = 29 - i;
    const papel = countFor(day, 0, 5, 15);
    const plastico = countFor(day, 1, 8, 20);
    const vidro = countFor(day, 2, 2, 8);
    const metal = countFor(day, 3, 3, 10);
    const organico = countFor(day, 4, 4, 12);
    const rejeito = countFor(day, 5, 1, 5);

    data.push({
      date: label,
      papel,
      plastico,
      vidro,
      metal,
      organico,
      rejeito,
      total: papel + plastico + vidro + metal + organico + rejeito,
    });
  }
  return data;
}

function countFor(day: number, series: number, base: number, spread: number): number {
  return base + ((day * 17 + series * 11 + (day % 6) * 3) % spread);
}

export function generateClassStats() {
  return [
    { className: '7A', totalDisposals: 245, totalXp: 3200, students: 12, avgXp: 267 },
    { className: '7B', totalDisposals: 198, totalXp: 2580, students: 11, avgXp: 235 },
    { className: '8A', totalDisposals: 312, totalXp: 4100, students: 13, avgXp: 315 },
    { className: '8B', totalDisposals: 278, totalXp: 3650, students: 12, avgXp: 304 },
  ];
}
