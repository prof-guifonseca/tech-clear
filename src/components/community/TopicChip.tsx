'use client';

import { TOPICS } from '@/data/community-topics';
import { cn } from '@/lib/cn';
import type { TopicId } from '@/types/community';

type TopicChipProps = {
  topicId: TopicId | 'all';
  active?: boolean;
  count?: number;
  onClick?: () => void;
  variant?: 'filter' | 'tag';
  className?: string;
};

export function TopicChip({
  topicId,
  active = false,
  count,
  onClick,
  variant = 'filter',
  className,
}: TopicChipProps) {
  const topic = topicId === 'all' ? null : TOPICS.find((t) => t.id === topicId);
  const label = topic ? topic.label : 'Tudo';
  const icon = topic?.icon ?? '✨';
  const color = topic?.color ?? '#d6a84b';

  const base =
    variant === 'filter'
      ? 'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors whitespace-nowrap'
      : 'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap';

  const tone = active
    ? 'border-brass/45 bg-brass/15 text-parchment'
    : 'border-white/10 bg-white/[0.04] text-parchment/70 hover:text-parchment hover:bg-white/[0.06]';

  const content = (
    <>
      <span>{icon}</span>
      <span>{label}</span>
      {typeof count === 'number' ? (
        <span className="ml-0.5 text-parchment/56">{count}</span>
      ) : null}
    </>
  );

  const style = active ? { borderColor: `${color}80`, background: `${color}20`, color: '#f5ead0' } : undefined;

  if (!onClick) {
    return (
      <span style={style} className={cn(base, tone, className)}>
        {content}
      </span>
    );
  }

  return (
    <button type="button" onClick={onClick} style={style} className={cn(base, tone, className)}>
      {content}
    </button>
  );
}
