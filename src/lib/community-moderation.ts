import type { ModerationResult } from '@/types/community';

const BANNED_WORDS = [
  'porra', 'caralho', 'merda', 'foda', 'foder', 'puta', 'cu',
  'arrombado', 'desgracado', 'desgraçado', 'imbecil', 'idiota',
  'retardado', 'mongol', 'mongoloide',
  'viado', 'bicha', 'sapatao', 'sapatão', 'traveco',
  'preto fedido', 'macaco', 'negao', 'negão',
  'matar', 'mate-se', 'suicide', 'suicidio', 'suicídio',
];

const CONTACT_PATTERNS: RegExp[] = [
  /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i,
  /(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?9?\s?\d{4}[-.\s]?\d{4}\b/,
  /(?<!\w)@[a-z0-9_.]{3,}/i,
  /\b(?:wpp|whats|whatsapp|insta|instagram|tiktok|telegram|tg|discord)\b[\s:.-]*\S+/i,
];

const TITLE_MIN = 3;
const TITLE_MAX = 80;
const BODY_MIN = 10;
const BODY_MAX = 1000;
const COMMENT_MIN = 2;
const COMMENT_MAX = 500;

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function findBanned(text: string): string | null {
  const norm = normalize(text);
  for (const w of BANNED_WORDS) {
    const re = new RegExp(`\\b${w}\\b`);
    if (re.test(norm)) return w;
  }
  return null;
}

function findContactInfo(text: string): boolean {
  return CONTACT_PATTERNS.some((re) => re.test(text));
}

export function moderatePost(title: string, body: string): ModerationResult {
  const titleTrim = title.trim();
  const bodyTrim = body.trim();

  if (titleTrim.length < TITLE_MIN || bodyTrim.length < BODY_MIN) {
    return {
      ok: false,
      reason: 'too-short',
      message: `Título precisa de ao menos ${TITLE_MIN} caracteres e o corpo de ${BODY_MIN}.`,
    };
  }
  if (titleTrim.length > TITLE_MAX || bodyTrim.length > BODY_MAX) {
    return {
      ok: false,
      reason: 'too-long',
      message: `Título até ${TITLE_MAX} caracteres, corpo até ${BODY_MAX}.`,
    };
  }
  if (findBanned(titleTrim) || findBanned(bodyTrim)) {
    return {
      ok: false,
      reason: 'banned-word',
      message: 'Sua mensagem contém termos não permitidos. Edite e tente de novo.',
    };
  }
  if (findContactInfo(titleTrim) || findContactInfo(bodyTrim)) {
    return {
      ok: false,
      reason: 'contact-info',
      message: 'Não compartilhe contatos pessoais ou redes sociais aqui.',
    };
  }
  return { ok: true };
}

export function moderateComment(body: string): ModerationResult {
  const trim = body.trim();
  if (trim.length < COMMENT_MIN) {
    return {
      ok: false,
      reason: 'too-short',
      message: `Comentário precisa de ao menos ${COMMENT_MIN} caracteres.`,
    };
  }
  if (trim.length > COMMENT_MAX) {
    return {
      ok: false,
      reason: 'too-long',
      message: `Comentário até ${COMMENT_MAX} caracteres.`,
    };
  }
  if (findBanned(trim)) {
    return {
      ok: false,
      reason: 'banned-word',
      message: 'Seu comentário contém termos não permitidos.',
    };
  }
  if (findContactInfo(trim)) {
    return {
      ok: false,
      reason: 'contact-info',
      message: 'Não compartilhe contatos pessoais aqui.',
    };
  }
  return { ok: true };
}

const POST_LIMIT = 5;
const COMMENT_LIMIT = 30;
const WINDOW_MS = 30 * 60 * 1000;

function rateLimitKey(studentId: string, kind: 'post' | 'comment') {
  return `tech-clear-rl-${kind}-${studentId}`;
}

function readTimestamps(key: string): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as number[];
    return parsed.filter((t) => Date.now() - t < WINDOW_MS);
  } catch {
    return [];
  }
}

function writeTimestamps(key: string, ts: number[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(ts));
  } catch {}
}

export function checkRateLimit(studentId: string, kind: 'post' | 'comment'): ModerationResult {
  const key = rateLimitKey(studentId, kind);
  const ts = readTimestamps(key);
  const limit = kind === 'post' ? POST_LIMIT : COMMENT_LIMIT;
  if (ts.length >= limit) {
    return {
      ok: false,
      reason: 'rate-limit',
      message:
        kind === 'post'
          ? 'Você atingiu o limite de posts por agora. Volte em alguns minutos.'
          : 'Você atingiu o limite de comentários por agora.',
    };
  }
  return { ok: true };
}

export function recordRateLimit(studentId: string, kind: 'post' | 'comment') {
  const key = rateLimitKey(studentId, kind);
  const ts = readTimestamps(key);
  ts.push(Date.now());
  writeTimestamps(key, ts);
}
