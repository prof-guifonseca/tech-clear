'use client';

import { getSchool, HOME_SCHOOL_ID } from '@/data/community-schools';
import { cn } from '@/lib/cn';

type SchoolBadgeProps = {
  schoolId: string;
  className?: string;
};

export function SchoolBadge({ schoolId, className: extraClass }: SchoolBadgeProps) {
  const school = getSchool(schoolId);
  const isHome = schoolId === HOME_SCHOOL_ID;
  if (!school) return null;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] whitespace-nowrap',
        isHome
          ? 'border-emerald/40 bg-emerald/12 text-emerald'
          : 'border-white/10 bg-white/[0.04] text-parchment/64',
        extraClass,
      )}
      title={`${school.name} · ${school.city}/${school.state}`}
    >
      {isHome ? <span aria-hidden>★</span> : null}
      <span>{school.name}</span>
      <span className="text-parchment/40">{school.state}</span>
    </span>
  );
}
