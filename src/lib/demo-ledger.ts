import { HOME_SCHOOL_ID } from '@/data/community-schools';
import { DEMO_STUDENTS } from '@/data/students';
import { WASTE_CATEGORIES, WASTE_ITEMS, getCategoryInfo } from '@/data/waste-categories';
import type { Student } from '@/types/student';
import type { WasteCategory, WasteItem } from '@/types/waste';

export const DEMO_LEDGER_STORAGE_KEY = 'tech-clear-disposal-ledger-v1';
export const DEMO_LEDGER_EVENT = 'tech-clear-ledger-updated';
export const EQUIPMENT_COST_ESTIMATE = 494;

const CO2E_FACTORS_KG: Record<WasteCategory, number> = {
  papel: 1.1,
  plastico: 2.5,
  vidro: 0.3,
  metal: 9.0,
  organico: 0.4,
  rejeito: 0,
};

const CATEGORY_RECOMMENDATIONS: Record<WasteCategory, string> = {
  papel: 'Reforcar descarte de papel limpo e seco nas salas com maior volume.',
  plastico: 'Criar uma semana de lavagem rapida de embalagens plasticas antes do descarte.',
  vidro: 'Separar pontos de coleta supervisionados para vidro e objetos cortantes.',
  metal: 'Ativar desafio de latinhas com parceiro local para troca por recompensas.',
  organico: 'Conectar a coleta organica a uma composteira ou horta pedagogica.',
  rejeito: 'Usar os rejeitos recorrentes como tema de aula sobre consumo e reducao.',
};

export interface DisposalEvent {
  id: string;
  schoolId: string;
  deviceId: string;
  studentId: string;
  studentName: string;
  className: string;
  itemId: string;
  itemName: string;
  category: WasteCategory;
  weightGrams: number;
  confidence: number;
  contaminated: boolean;
  correct: boolean;
  xpEarned: number;
  timestamp: string;
  source: 'seed' | 'app' | 'pitch' | 'device';
}

export type DisposalEventInput = Omit<DisposalEvent, 'id' | 'timestamp' | 'schoolId' | 'deviceId' | 'correct'> &
  Partial<Pick<DisposalEvent, 'id' | 'timestamp' | 'schoolId' | 'deviceId' | 'correct'>>;

export interface ChartDatum {
  date: string;
  papel: number;
  plastico: number;
  vidro: number;
  metal: number;
  organico: number;
  rejeito: number;
  total: number;
}

export interface ClassInsight {
  className: string;
  totalDisposals: number;
  totalXp: number;
  students: number;
  activeStudents: number;
  avgXp: number;
  weightKg: number;
  contaminationRate: number;
  leadingCategory: WasteCategory;
  leadingCategoryName: string;
  recommendation: string;
}

export interface ImpactSnapshot {
  totalItems: number;
  correctItems: number;
  divertedKg: number;
  co2eKg: number;
  contaminationRate: number;
  activeStudents: number;
  engagementRate: number;
  equipmentCostEstimate: number;
  mostWorkedCategory: WasteCategory;
  mostWorkedCategoryName: string;
  criticalCategory: WasteCategory;
  criticalCategoryName: string;
  recommendation: string;
}

export function seedDemoLedger(now: Date = new Date()): DisposalEvent[] {
  const events: DisposalEvent[] = [];
  const students = DEMO_STUDENTS;

  for (let dayOffset = 29; dayOffset >= 0; dayOffset -= 1) {
    students.forEach((student, studentIndex) => {
      if ((dayOffset + studentIndex) % 5 === 0 && dayOffset % 3 !== 0) return;

      const count = 1 + (((dayOffset * 3 + studentIndex) % 7) === 0 ? 1 : 0);
      for (let slot = 0; slot < count; slot += 1) {
        const itemIndex = (dayOffset * 7 + studentIndex * 3 + slot * 5) % WASTE_ITEMS.length;
        const item = WASTE_ITEMS[itemIndex];
        const timestamp = timestampForSeed(now, dayOffset, studentIndex, slot);
        const contaminated = ((dayOffset + 2) * 11 + studentIndex * 7 + slot * 5) % 19 === 0;
        const confidence = 84 + (((dayOffset + studentIndex + slot) * 7) % 15);

        events.push(createEvent({
          id: `seed-${dayOffset}-${student.id}-${slot}`,
          schoolId: HOME_SCHOOL_ID,
          deviceId: 'tc-maker-001',
          studentId: student.id,
          studentName: student.name,
          className: student.className,
          itemId: item.id,
          itemName: item.name,
          category: item.category,
          weightGrams: stableWeight(item, dayOffset + studentIndex + slot),
          confidence,
          contaminated,
          correct: !contaminated,
          xpEarned: eventXp(item, contaminated),
          timestamp,
          source: 'seed',
        }));
      }
    });
  }

  return sortEvents(events);
}

export function readDemoLedger(): DisposalEvent[] {
  if (typeof window === 'undefined') return seedDemoLedger();

  try {
    const raw = window.localStorage.getItem(DEMO_LEDGER_STORAGE_KEY);
    if (!raw) {
      const seeded = seedDemoLedger();
      writeDemoLedger(seeded);
      return seeded;
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return resetDemoLedger();

    const events = parsed.flatMap((value) => {
      const event = restoreEvent(value);
      return event ? [event] : [];
    });

    if (!events.length) return resetDemoLedger();
    return sortEvents(events);
  } catch {
    return resetDemoLedger();
  }
}

export function writeDemoLedger(events: DisposalEvent[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DEMO_LEDGER_STORAGE_KEY, JSON.stringify(sortEvents(events)));
  window.dispatchEvent(new CustomEvent(DEMO_LEDGER_EVENT));
}

export function resetDemoLedger(): DisposalEvent[] {
  const seeded = seedDemoLedger();
  writeDemoLedger(seeded);
  return seeded;
}

export function recordDisposalEvent(input: DisposalEventInput): DisposalEvent {
  const event = createEvent({
    ...input,
    id: input.id ?? createLedgerId(input.studentId, input.itemId),
    schoolId: input.schoolId ?? HOME_SCHOOL_ID,
    deviceId: input.deviceId ?? 'tc-maker-001',
    timestamp: input.timestamp ?? new Date().toISOString(),
    correct: input.correct ?? !input.contaminated,
  });

  if (typeof window !== 'undefined') {
    const current = readDemoLedger();
    const withoutDuplicate = current.filter((item) => item.id !== event.id);
    writeDemoLedger([event, ...withoutDuplicate]);
  }

  return event;
}

export function createPitchDisposalEvent(id: string): DisposalEvent {
  const student = DEMO_STUDENTS[0];
  const item = WASTE_ITEMS.find((wasteItem) => wasteItem.id === 'garrafa-pet') ?? WASTE_ITEMS[0];

  return recordDisposalEvent({
    id,
    schoolId: HOME_SCHOOL_ID,
    deviceId: 'tc-maker-001',
    studentId: student.id,
    studentName: student.name,
    className: student.className,
    itemId: item.id,
    itemName: item.name,
    category: item.category,
    weightGrams: 31,
    confidence: 96,
    contaminated: false,
    correct: true,
    xpEarned: 42,
    timestamp: new Date().toISOString(),
    source: 'pitch',
  });
}

export function getChartDataFromLedger(events: DisposalEvent[], now: Date = new Date()): ChartDatum[] {
  const byDate = new Map<string, ChartDatum>();

  for (let dayOffset = 29; dayOffset >= 0; dayOffset -= 1) {
    const date = dateForOffset(now, dayOffset);
    byDate.set(date.key, emptyChartDatum(date.label));
  }

  events.forEach((event) => {
    const date = new Date(event.timestamp);
    const key = dateKey(date);
    const datum = byDate.get(key);
    if (!datum) return;
    datum[event.category] += 1;
    datum.total += 1;
  });

  return Array.from(byDate.values());
}

export function getImpactSnapshot(events: DisposalEvent[], students: Student[] = DEMO_STUDENTS): ImpactSnapshot {
  const totalItems = events.length;
  const correctItems = events.filter((event) => event.correct).length;
  const activeStudents = new Set(events.map((event) => event.studentId)).size;
  const recyclableEvents = events.filter((event) => event.correct && event.category !== 'rejeito');
  const divertedKg = round1(recyclableEvents.reduce((sum, event) => sum + event.weightGrams, 0) / 1000);
  const co2eKg = round1(
    recyclableEvents.reduce(
      (sum, event) => sum + (event.weightGrams / 1000) * CO2E_FACTORS_KG[event.category],
      0,
    ),
  );
  const contaminationRate = totalItems ? Math.round((events.filter((event) => event.contaminated).length / totalItems) * 100) : 0;
  const engagementRate = students.length ? Math.round((activeStudents / students.length) * 100) : 0;
  const mostWorkedCategory = topCategory(events);
  const criticalCategory = criticalCategoryFor(events);

  return {
    totalItems,
    correctItems,
    divertedKg,
    co2eKg,
    contaminationRate,
    activeStudents,
    engagementRate,
    equipmentCostEstimate: EQUIPMENT_COST_ESTIMATE,
    mostWorkedCategory,
    mostWorkedCategoryName: getCategoryInfo(mostWorkedCategory).name,
    criticalCategory,
    criticalCategoryName: getCategoryInfo(criticalCategory).name,
    recommendation: CATEGORY_RECOMMENDATIONS[criticalCategory],
  };
}

export function getClassInsights(events: DisposalEvent[], students: Student[] = DEMO_STUDENTS): ClassInsight[] {
  const classNames = Array.from(new Set(students.map((student) => student.className))).sort();

  return classNames.map((className) => {
    const classEvents = events.filter((event) => event.className === className);
    const classStudents = students.filter((student) => student.className === className);
    const activeStudents = new Set(classEvents.map((event) => event.studentId)).size;
    const totalXp = classEvents.reduce((sum, event) => sum + event.xpEarned, 0);
    const leadingCategory = topCategory(classEvents);
    const contaminationRate = classEvents.length
      ? Math.round((classEvents.filter((event) => event.contaminated).length / classEvents.length) * 100)
      : 0;

    return {
      className,
      totalDisposals: classEvents.length,
      totalXp,
      students: classStudents.length,
      activeStudents,
      avgXp: classStudents.length ? Math.round(totalXp / classStudents.length) : 0,
      weightKg: round1(classEvents.reduce((sum, event) => sum + event.weightGrams, 0) / 1000),
      contaminationRate,
      leadingCategory,
      leadingCategoryName: getCategoryInfo(leadingCategory).conamaColor,
      recommendation:
        contaminationRate >= 12
          ? CATEGORY_RECOMMENDATIONS[criticalCategoryFor(classEvents)]
          : `Manter desafio de ${getCategoryInfo(leadingCategory).conamaColor.toLowerCase()} com feedback semanal.`,
    };
  });
}

export function getRecentEvents(events: DisposalEvent[], count = 6): DisposalEvent[] {
  return sortEvents(events).slice(0, count);
}

export function getCategoryLabel(category: WasteCategory, label: 'name' | 'conamaColor' = 'conamaColor') {
  return getCategoryInfo(category)[label];
}

function createEvent(input: DisposalEvent): DisposalEvent {
  return {
    ...input,
    confidence: Math.max(0, Math.min(100, Math.round(input.confidence))),
    weightGrams: Math.max(1, Math.round(input.weightGrams)),
    xpEarned: Math.max(0, Math.round(input.xpEarned)),
  };
}

function restoreEvent(value: unknown): DisposalEvent | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.id !== 'string' ||
    typeof value.studentId !== 'string' ||
    typeof value.studentName !== 'string' ||
    typeof value.className !== 'string' ||
    typeof value.itemId !== 'string' ||
    typeof value.itemName !== 'string' ||
    typeof value.category !== 'string' ||
    !isWasteCategory(value.category) ||
    typeof value.timestamp !== 'string'
  ) {
    return null;
  }

  return createEvent({
    id: value.id,
    schoolId: typeof value.schoolId === 'string' ? value.schoolId : HOME_SCHOOL_ID,
    deviceId: typeof value.deviceId === 'string' ? value.deviceId : 'tc-maker-001',
    studentId: value.studentId,
    studentName: value.studentName,
    className: value.className,
    itemId: value.itemId,
    itemName: value.itemName,
    category: value.category,
    weightGrams: numberOr(value.weightGrams, 1),
    confidence: numberOr(value.confidence, 90),
    contaminated: Boolean(value.contaminated),
    correct: typeof value.correct === 'boolean' ? value.correct : !Boolean(value.contaminated),
    xpEarned: numberOr(value.xpEarned, 0),
    timestamp: value.timestamp,
    source: isSource(value.source) ? value.source : 'seed',
  });
}

function sortEvents(events: DisposalEvent[]): DisposalEvent[] {
  return [...events].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

function timestampForSeed(now: Date, dayOffset: number, studentIndex: number, slot: number): string {
  const date = new Date(now);
  date.setHours(8 + ((studentIndex + slot) % 9), (studentIndex * 11 + slot * 17) % 60, 0, 0);
  date.setDate(date.getDate() - dayOffset);

  if (date.getTime() > now.getTime()) {
    date.setTime(now.getTime() - (studentIndex + slot + 1) * 12 * 60 * 1000);
  }

  return date.toISOString();
}

function dateForOffset(now: Date, dayOffset: number) {
  const date = new Date(now);
  date.setDate(date.getDate() - dayOffset);
  return {
    key: dateKey(date),
    label: `${date.getDate()}/${date.getMonth() + 1}`,
  };
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function emptyChartDatum(date: string): ChartDatum {
  return {
    date,
    papel: 0,
    plastico: 0,
    vidro: 0,
    metal: 0,
    organico: 0,
    rejeito: 0,
    total: 0,
  };
}

function topCategory(events: DisposalEvent[]): WasteCategory {
  if (!events.length) return 'plastico';
  const counts = new Map<WasteCategory, number>();
  events.forEach((event) => counts.set(event.category, (counts.get(event.category) ?? 0) + 1));
  return maxCategory(counts);
}

function criticalCategoryFor(events: DisposalEvent[]): WasteCategory {
  const contaminated = events.filter((event) => event.contaminated);
  if (contaminated.length) return topCategory(contaminated);

  const rejectCount = events.filter((event) => event.category === 'rejeito').length;
  if (rejectCount > events.length * 0.12) return 'rejeito';

  return topCategory(events);
}

function maxCategory(counts: Map<WasteCategory, number>): WasteCategory {
  let winner: WasteCategory = 'plastico';
  let max = -1;
  WASTE_CATEGORIES.forEach((category) => {
    const value = counts.get(category.id) ?? 0;
    if (value > max) {
      winner = category.id;
      max = value;
    }
  });
  return winner;
}

function stableWeight(item: WasteItem, salt: number): number {
  return Math.max(1, item.weight + ((item.id.length * 7 + salt * 5) % 21) - 10);
}

function eventXp(item: WasteItem, contaminated: boolean): number {
  const base = getCategoryInfo(item.category).xpBase;
  const difficulty = item.difficulty === 'dificil' ? 5 : item.difficulty === 'medio' ? 3 : 0;
  return contaminated ? Math.max(2, Math.round((base + difficulty) * 0.35)) : base + difficulty + 8;
}

function createLedgerId(studentId: string, itemId: string): string {
  return `evt-${studentId}-${itemId}-${Date.now().toString(36)}`;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function isWasteCategory(value: string): value is WasteCategory {
  return WASTE_CATEGORIES.some((category) => category.id === value);
}

function isSource(value: unknown): value is DisposalEvent['source'] {
  return value === 'seed' || value === 'app' || value === 'pitch' || value === 'device';
}
