export function relativeTime(iso: string, now: Date = new Date()): string {
  const t = new Date(iso).getTime();
  const diffMs = now.getTime() - t;
  const sec = Math.round(diffMs / 1000);
  if (sec < 30) return 'agora';
  if (sec < 60) return `${sec}s`;
  const min = Math.round(sec / 60);
  if (min < 60) return `há ${min} min`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `há ${hr}h`;
  const day = Math.round(hr / 24);
  if (day === 1) return 'ontem';
  if (day < 7) return `há ${day} dias`;
  const wk = Math.round(day / 7);
  if (wk < 4) return `há ${wk} sem`;
  return new Date(iso).toLocaleDateString('pt-BR');
}
