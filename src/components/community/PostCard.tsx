'use client';

import Link from 'next/link';

import { TopicChip } from '@/components/community/TopicChip';
import { SchoolBadge } from '@/components/community/SchoolBadge';
import { ListRow } from '@/components/tech-clear/ui';
import { relativeTime } from '@/lib/relative-time';
import { cn } from '@/lib/cn';
import type { Post } from '@/types/community';

type PostCardProps = {
  post: Post;
  upvoted: boolean;
  onUpvote: () => void;
};

export function PostCard({ post, upvoted, onUpvote }: PostCardProps) {
  return (
    <ListRow className="transition-colors hover:border-brass/30 hover:bg-white/[0.05]">
      <div className="flex items-start gap-3">
        <button
          onClick={onUpvote}
          className={cn(
            'flex w-12 shrink-0 flex-col items-center gap-1 rounded-2xl border px-1 py-2 transition-colors',
            upvoted
              ? 'border-brass/45 bg-brass/15 text-brass'
              : 'border-white/8 bg-white/[0.03] text-parchment/64 hover:text-brass hover:border-brass/30',
          )}
          aria-label={upvoted ? 'Remover apoio' : 'Apoiar este post'}
        >
          <span className="text-base leading-none">▲</span>
          <span className="text-[12px] font-semibold leading-none">{post.upvotes}</span>
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <TopicChip topicId={post.topicId} variant="tag" />
            <SchoolBadge schoolId={post.author.schoolId} />
            <span className="text-[10px] uppercase tracking-[0.2em] text-parchment/40">
              {relativeTime(post.createdAt)}
            </span>
          </div>

          <Link href={`/agora/${post.id}`} className="block rounded-lg focus:outline-none focus:ring-2 focus:ring-brass/50">
            <h3 className="mt-2 font-heading text-[1.35rem] leading-tight text-parchment">
              {post.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-parchment/68">{post.body}</p>
          </Link>

          <div className="mt-3 flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-parchment/50">
            <span className="flex items-center gap-1.5">
              <span aria-hidden>{post.author.avatar}</span>
              <span className="normal-case tracking-normal text-parchment/72">
                {post.author.name}
              </span>
              <span className="text-parchment/36">{post.author.className}</span>
            </span>
            <span>·</span>
            <span>💬 {post.commentCount}</span>
          </div>
        </div>
      </div>
    </ListRow>
  );
}
