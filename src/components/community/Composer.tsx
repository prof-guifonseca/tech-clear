'use client';

import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/tech-clear/ui';
import { TOPICS } from '@/data/community-topics';
import { cn } from '@/lib/cn';
import type { ModerationResult, TopicId } from '@/types/community';

type ComposerProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: { title: string; body: string; topicId: TopicId }) => ModerationResult;
};

export function Composer({ open, onClose, onSubmit }: ComposerProps) {
  const [topicId, setTopicId] = useState<TopicId>('cases');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setTitle('');
      setBody('');
      setError(null);
      setTopicId('cases');
    } else {
      requestAnimationFrame(() => titleRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = onSubmit({ title, body, topicId });
    if (!result.ok) {
      setError(result.message ?? 'Não foi possível publicar.');
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/72 backdrop-blur-sm sm:items-center">
      <div
        onClick={onClose}
        className="absolute inset-0"
        aria-hidden
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 mx-3 mb-3 w-full max-w-md rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(20,32,58,0.98),rgba(11,16,32,0.98))] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.5)] sm:mb-0"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1.25rem)' }}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] uppercase tracking-[0.34em] text-brass/70">Nova publicação</p>
          <Button
            onClick={onClose}
            variant="secondary"
            size="sm"
            className="min-h-8 uppercase tracking-[0.22em]"
          >
            Fechar
          </Button>
        </div>

        <div className="mt-4">
          <label className="text-[10px] uppercase tracking-[0.22em] text-parchment/52">
            Tópico
          </label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {TOPICS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTopicId(t.id)}
                style={
                  topicId === t.id
                    ? { borderColor: `${t.color}80`, background: `${t.color}20`, color: '#f5ead0' }
                    : undefined
                }
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors',
                  topicId === t.id
                    ? 'border-brass/45 bg-brass/15 text-parchment'
                    : 'border-white/10 bg-white/[0.04] text-parchment/70 hover:text-parchment',
                )}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="text-[10px] uppercase tracking-[0.22em] text-parchment/52">Título</label>
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            placeholder="Resuma sua experiência em uma linha"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-base text-parchment placeholder:text-parchment/36 focus:border-brass/40 focus:outline-none"
          />
          <div className="mt-1 text-right text-[10px] text-parchment/40">{title.length}/80</div>
        </div>

        <div className="mt-3">
          <label className="text-[10px] uppercase tracking-[0.22em] text-parchment/52">Corpo</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={1000}
            rows={5}
            placeholder="Conte o que deu certo, o que travou, e o que outras escolas podem aprender com isso."
            className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[15px] leading-6 text-parchment placeholder:text-parchment/36 focus:border-brass/40 focus:outline-none"
          />
          <div className="mt-1 text-right text-[10px] text-parchment/40">{body.length}/1000</div>
        </div>

        {error ? (
          <div className="mt-3 rounded-2xl border border-ruby/40 bg-ruby/10 px-4 py-3 text-sm text-ruby">
            {error}
          </div>
        ) : null}

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-[10px] uppercase tracking-[0.22em] text-parchment/40">
            +5 XP ao publicar
          </p>
          <Button
            type="submit"
            variant="primary"
          >
            Publicar
          </Button>
        </div>
      </form>
    </div>
  );
}
