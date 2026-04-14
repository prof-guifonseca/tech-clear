import { DisposalRecord } from '@/types/waste';

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export const MOCK_DISPOSALS: DisposalRecord[] = [
  { id: generateId(), studentId: 'aluno-1', itemId: 'garrafa-pet', itemName: 'Garrafa PET', category: 'plastico', xpEarned: 15, timestamp: daysAgo(0), wasCorrect: true },
  { id: generateId(), studentId: 'aluno-1', itemId: 'jornal', itemName: 'Jornal Velho', category: 'papel', xpEarned: 10, timestamp: daysAgo(1), wasCorrect: true },
  { id: generateId(), studentId: 'aluno-2', itemId: 'lata-aluminio', itemName: 'Lata de Aluminio', category: 'metal', xpEarned: 12, timestamp: daysAgo(0), wasCorrect: true },
  { id: generateId(), studentId: 'aluno-2', itemId: 'casca-banana', itemName: 'Casca de Banana', category: 'organico', xpEarned: 8, timestamp: daysAgo(0), wasCorrect: true },
  { id: generateId(), studentId: 'aluno-3', itemId: 'caixa-papelao', itemName: 'Caixa de Papelao', category: 'papel', xpEarned: 10, timestamp: daysAgo(2), wasCorrect: true },
  { id: generateId(), studentId: 'aluno-5', itemId: 'pote-vidro', itemName: 'Pote de Vidro', category: 'vidro', xpEarned: 12, timestamp: daysAgo(0), wasCorrect: true },
  { id: generateId(), studentId: 'aluno-5', itemId: 'garrafa-pet', itemName: 'Garrafa PET', category: 'plastico', xpEarned: 15, timestamp: daysAgo(0), wasCorrect: true },
  { id: generateId(), studentId: 'aluno-5', itemId: 'latinha-refri', itemName: 'Latinha de Refrigerante', category: 'metal', xpEarned: 12, timestamp: daysAgo(1), wasCorrect: true },
  { id: generateId(), studentId: 'aluno-7', itemId: 'garrafa-vidro', itemName: 'Garrafa de Vidro', category: 'vidro', xpEarned: 12, timestamp: daysAgo(0), wasCorrect: true },
  { id: generateId(), studentId: 'aluno-7', itemId: 'papel-amassado', itemName: 'Papel Amassado', category: 'papel', xpEarned: 10, timestamp: daysAgo(0), wasCorrect: true },
  { id: generateId(), studentId: 'aluno-4', itemId: 'resto-comida', itemName: 'Resto de Comida', category: 'organico', xpEarned: 8, timestamp: daysAgo(1), wasCorrect: true },
  { id: generateId(), studentId: 'aluno-6', itemId: 'saco-plastico', itemName: 'Sacola Plastica', category: 'plastico', xpEarned: 10, timestamp: daysAgo(3), wasCorrect: true },
];

export function generateChartData() {
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = `${d.getDate()}/${d.getMonth() + 1}`;
    data.push({
      date: label,
      papel: Math.floor(Math.random() * 15) + 5,
      plastico: Math.floor(Math.random() * 20) + 8,
      vidro: Math.floor(Math.random() * 8) + 2,
      metal: Math.floor(Math.random() * 10) + 3,
      organico: Math.floor(Math.random() * 12) + 4,
      rejeito: Math.floor(Math.random() * 5) + 1,
      total: 0,
    });
    data[data.length - 1].total = data[data.length - 1].papel + data[data.length - 1].plastico + data[data.length - 1].vidro + data[data.length - 1].metal + data[data.length - 1].organico + data[data.length - 1].rejeito;
  }
  return data;
}

export function generateClassStats() {
  return [
    { className: '7A', totalDisposals: 245, totalXp: 3200, students: 12, avgXp: 267 },
    { className: '7B', totalDisposals: 198, totalXp: 2580, students: 11, avgXp: 235 },
    { className: '8A', totalDisposals: 312, totalXp: 4100, students: 13, avgXp: 315 },
    { className: '8B', totalDisposals: 278, totalXp: 3650, students: 12, avgXp: 304 },
  ];
}
