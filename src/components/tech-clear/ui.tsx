import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { cn } from '@/lib/cn';

type SectionSheetProps = ComponentPropsWithoutRef<'section'> & {
  tone?: 'default' | 'hero' | 'soft';
};

const SHEET_TONES = {
  default:
    'border-white/10 bg-[linear-gradient(180deg,rgba(20,32,58,0.96),rgba(8,12,24,0.94))] shadow-[0_24px_70px_rgba(0,0,0,0.32)]',
  hero:
    'border-brass/35 bg-[linear-gradient(180deg,rgba(26,40,70,0.98),rgba(11,16,32,0.96))] shadow-[0_30px_90px_rgba(0,0,0,0.4)]',
  soft: 'border-white/6 bg-white/[0.035]',
} as const;

export function SectionSheet({
  className,
  tone = 'default',
  children,
  ...props
}: SectionSheetProps) {
  return (
    <section
      className={cn(
        'rounded-[28px] border px-5 py-5 backdrop-blur-xl',
        SHEET_TONES[tone],
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
  action?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
  action,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'space-y-3',
        align === 'center' ? 'text-center' : 'text-left',
        className
      )}
    >
      {eyebrow ? (
        <p className="text-[11px] uppercase tracking-[0.35em] text-brass/75">{eyebrow}</p>
      ) : null}
      <div className="space-y-2">
        <h1 className="font-heading text-[2.2rem] leading-[0.92] text-parchment sm:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="text-sm leading-6 text-parchment/72 sm:text-[15px]">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

type ProgressBarProps = {
  value: number;
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
};

export function ProgressBar({
  value,
  className,
  trackClassName,
  fillClassName,
}: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div
      className={cn(
        'h-2 rounded-full bg-white/8 ring-1 ring-inset ring-white/8',
        className,
        trackClassName
      )}
    >
      <div
        className={cn(
          'h-full rounded-full bg-[linear-gradient(90deg,#D6A84B_0%,#48D597_100%)]',
          fillClassName
        )}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}

type MetricPillProps = {
  label: string;
  value: string | number;
  icon?: string;
  accentClassName?: string;
  className?: string;
};

export function MetricPill({
  label,
  value,
  icon,
  accentClassName,
  className,
}: MetricPillProps) {
  return (
    <div
      className={cn(
        'min-w-[110px] rounded-[22px] border border-white/8 bg-white/[0.035] px-4 py-3',
        className
      )}
    >
      <div className={cn('text-xl font-semibold text-brass', accentClassName)}>
        {icon ? <span className="mr-1.5 text-base">{icon}</span> : null}
        {value}
      </div>
      <div className="mt-1 text-[11px] uppercase tracking-[0.24em] text-parchment/48">{label}</div>
    </div>
  );
}

export function ListRow({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn(
        'rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SectionKicker({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn('text-[11px] uppercase tracking-[0.34em] text-brass/70', className)}>
      {children}
    </p>
  );
}

export function TechClearMark({ className }: { className?: string }) {
  return (
    <div className={cn('relative isolate aspect-square w-56', className)}>
      <div className="absolute inset-0 rounded-full border border-brass/20 bg-[radial-gradient(circle_at_top,rgba(214,168,75,0.2),transparent_58%)]" />
      <div className="absolute inset-4 rounded-full border border-white/10" />
      <div className="absolute inset-8 rounded-full border border-white/5" />
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_35%,rgba(72,213,151,0.18),transparent_42%),radial-gradient(circle_at_50%_70%,rgba(214,168,75,0.15),transparent_36%)]" />
      <div className="absolute inset-[30%] rounded-full bg-emerald/22 blur-3xl" />
      <div className="absolute left-1/2 top-[16%] h-3 w-3 -translate-x-1/2 rounded-full bg-brass/70 shadow-[0_0_25px_rgba(214,168,75,0.5)]" />
      <div className="absolute bottom-[18%] left-[18%] h-2.5 w-2.5 rounded-full bg-white/55" />
      <div className="absolute bottom-[18%] right-[18%] h-2.5 w-2.5 rounded-full bg-white/55" />
      <div className="absolute inset-[27%] flex items-center justify-center rounded-full border border-white/8 bg-ink-soft/60 backdrop-blur-sm">
        <span className="text-[4.8rem] leading-none text-emerald drop-shadow-[0_0_30px_rgba(72,213,151,0.35)]">
          ♻
        </span>
      </div>
    </div>
  );
}
