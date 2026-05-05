'use client';

import { useState } from 'react';

import { SchoolBadge } from '@/components/community/SchoolBadge';
import { relativeTime } from '@/lib/relative-time';
import { cn } from '@/lib/cn';
import type { Comment, ModerationResult } from '@/types/community';

type CommentListProps = {
  comments: Comment[];
  currentStudentId: string;
  onUpvote: (commentId: string) => void;
  onReply: (parentCommentId: string, body: string) => ModerationResult;
};

export function CommentList({ comments, currentStudentId, onUpvote, onReply }: CommentListProps) {
  const roots = comments.filter((c) => !c.parentCommentId);
  const childrenOf = (id: string) => comments.filter((c) => c.parentCommentId === id);

  if (roots.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-center text-sm text-parchment/56">
        Nenhum comentário ainda. Quebre o gelo.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {roots.map((c) => (
        <li key={c.id}>
          <CommentRow
            comment={c}
            replies={childrenOf(c.id)}
            currentStudentId={currentStudentId}
            onUpvote={onUpvote}
            onReply={onReply}
          />
        </li>
      ))}
    </ul>
  );
}

type CommentRowProps = {
  comment: Comment;
  replies: Comment[];
  currentStudentId: string;
  onUpvote: (commentId: string) => void;
  onReply: (parentCommentId: string, body: string) => ModerationResult;
  nested?: boolean;
};

function CommentRow({
  comment,
  replies,
  currentStudentId,
  onUpvote,
  onReply,
  nested = false,
}: CommentRowProps) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const upvoted = comment.upvotedBy.includes(currentStudentId);

  const submitReply = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = onReply(comment.id, replyText);
    if (!result.ok) {
      setError(result.message ?? 'Não foi possível responder.');
      return;
    }
    setReplyText('');
    setReplying(false);
  };

  return (
    <div
      className={cn(
        'rounded-[20px] border border-white/8 bg-white/[0.025] px-4 py-3',
        nested && 'border-white/6 bg-white/[0.015]',
      )}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onUpvote(comment.id)}
          className={cn(
            'flex w-9 shrink-0 flex-col items-center gap-0.5 rounded-xl border px-1 py-1.5 transition-colors',
            upvoted
              ? 'border-brass/45 bg-brass/15 text-brass'
              : 'border-white/8 bg-white/[0.03] text-parchment/64 hover:text-brass hover:border-brass/30',
          )}
          aria-label={upvoted ? 'Remover apoio' : 'Apoiar'}
        >
          <span className="text-[12px] leading-none">▲</span>
          <span className="text-[11px] font-semibold leading-none">{comment.upvotes}</span>
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span aria-hidden>{comment.author.avatar}</span>
            <span className="font-semibold text-parchment">{comment.author.name}</span>
            <span className="text-parchment/40">{comment.author.className}</span>
            <SchoolBadge schoolId={comment.author.schoolId} />
            <span className="ml-auto uppercase tracking-[0.18em] text-parchment/40">
              {relativeTime(comment.createdAt)}
            </span>
          </div>
          <p className="mt-1.5 text-[14px] leading-6 text-parchment/86 whitespace-pre-wrap">
            {comment.body}
          </p>

          {!nested ? (
            <div className="mt-2 flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-parchment/50">
              <button
                onClick={() => setReplying((v) => !v)}
                className="hover:text-parchment"
              >
                {replying ? 'Cancelar' : 'Responder'}
              </button>
            </div>
          ) : null}

          {replying ? (
            <form onSubmit={submitReply} className="mt-3 space-y-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="Escreva sua resposta…"
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[14px] leading-6 text-parchment placeholder:text-parchment/36 focus:border-brass/40 focus:outline-none"
              />
              {error ? (
                <p className="rounded-xl border border-ruby/40 bg-ruby/10 px-3 py-2 text-[12px] text-ruby">
                  {error}
                </p>
              ) : null}
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setReplying(false);
                    setReplyText('');
                    setError(null);
                  }}
                  className="rounded-full border border-white/10 px-4 py-1.5 text-[12px] text-parchment/64 hover:text-parchment"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-brass/85 px-4 py-1.5 text-[12px] font-semibold text-ink hover:bg-brass"
                >
                  Responder
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </div>

      {replies.length > 0 ? (
        <ul className="mt-3 space-y-2 border-l border-white/8 pl-4">
          {replies.map((r) => (
            <li key={r.id}>
              <CommentRow
                comment={r}
                replies={[]}
                currentStudentId={currentStudentId}
                onUpvote={onUpvote}
                onReply={onReply}
                nested
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
