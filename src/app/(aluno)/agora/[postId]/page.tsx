'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import { CommentList } from '@/components/community/CommentList';
import { TopicChip } from '@/components/community/TopicChip';
import { SchoolBadge } from '@/components/community/SchoolBadge';
import { Button, SectionKicker, SectionSheet } from '@/components/tech-clear/ui';
import { HOME_SCHOOL_ID } from '@/data/community-schools';
import { relativeTime } from '@/lib/relative-time';
import { cn } from '@/lib/cn';
import { useCommunity } from '@/store/CommunityContext';
import { useGame } from '@/store/GameContext';
import type { ModerationResult } from '@/types/community';

const COMMENT_XP = 2;
const SECTION_TRANSITION = { duration: 0.4, ease: 'easeOut' as const };

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = Array.isArray(params.postId) ? params.postId[0] : params.postId;

  const { getPost, getCommentsFor, togglePostUpvote, toggleCommentUpvote, createComment, reportPost } =
    useCommunity();
  const { state, dispatch } = useGame();
  const { student } = state;

  const post = postId ? getPost(postId) : undefined;
  const comments = useMemo(
    () => (postId ? getCommentsFor(postId).slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt)) : []),
    [getCommentsFor, postId],
  );

  const [topLevel, setTopLevel] = useState('');
  const [topLevelError, setTopLevelError] = useState<string | null>(null);
  const [reportedNotice, setReportedNotice] = useState(false);

  if (!post) {
    return (
      <div className="space-y-4 pb-4">
        <SectionSheet>
          <p className="text-sm leading-6 text-parchment/64">
            Post não encontrado. Pode ter sido removido.
          </p>
          <button
            onClick={() => router.push('/agora')}
            className="mt-3 rounded-full border border-white/10 px-4 py-2 text-[12px] uppercase tracking-[0.22em] text-parchment/64 hover:text-parchment"
          >
            Voltar à Ágora
          </button>
        </SectionSheet>
      </div>
    );
  }

  const upvoted = post.upvotedBy.includes(student.id);

  const submitTopComment = (e: React.FormEvent) => {
    e.preventDefault();
    setTopLevelError(null);
    const { result } = createComment({
      author: {
        studentId: student.id,
        name: student.name,
        avatar: student.avatar,
        className: student.className,
        schoolId: HOME_SCHOOL_ID,
      },
      postId: post.id,
      parentCommentId: null,
      body: topLevel,
    });
    if (!result.ok) {
      setTopLevelError(result.message ?? 'Não foi possível comentar.');
      return;
    }
    dispatch({ type: 'ADD_XP', amount: COMMENT_XP });
    setTopLevel('');
  };

  const handleReply = (parentCommentId: string, body: string): ModerationResult => {
    const { result } = createComment({
      author: {
        studentId: student.id,
        name: student.name,
        avatar: student.avatar,
        className: student.className,
        schoolId: HOME_SCHOOL_ID,
      },
      postId: post.id,
      parentCommentId,
      body,
    });
    if (result.ok) dispatch({ type: 'ADD_XP', amount: COMMENT_XP });
    return result;
  };

  const handleReport = () => {
    if (!confirm('Reportar este post como inadequado?')) return;
    reportPost(post.id);
    setReportedNotice(true);
    setTimeout(() => router.push('/agora'), 1200);
  };

  return (
    <div className="space-y-4 pb-4">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SECTION_TRANSITION}
      >
        <button
          onClick={() => router.push('/agora')}
          className="text-[11px] uppercase tracking-[0.24em] text-parchment/56 hover:text-parchment"
        >
          ← Voltar
        </button>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SECTION_TRANSITION, delay: 0.04 }}
      >
        <SectionSheet tone="hero">
          <div className="flex flex-wrap items-center gap-1.5">
            <TopicChip topicId={post.topicId} variant="tag" />
            <SchoolBadge schoolId={post.author.schoolId} />
            <span className="text-[10px] uppercase tracking-[0.2em] text-parchment/44">
              {relativeTime(post.createdAt)}
            </span>
          </div>

          <h1 className="mt-3 font-heading text-[2rem] leading-tight text-parchment sm:text-[2.4rem]">
            {post.title}
          </h1>

          <div className="mt-3 flex items-center gap-2 text-[12px]">
            <span aria-hidden className="text-lg">{post.author.avatar}</span>
            <span className="font-semibold text-parchment">{post.author.name}</span>
            <span className="text-parchment/40">{post.author.className}</span>
          </div>

          <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-parchment/86">
            {post.body}
          </p>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={() => togglePostUpvote(post.id, student.id)}
              className={cn(
                'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                upvoted
                  ? 'border-brass/45 bg-brass/15 text-brass'
                  : 'border-white/10 bg-white/[0.04] text-parchment/72 hover:text-brass hover:border-brass/30',
              )}
            >
              <span>▲</span>
              <span>{post.upvotes}</span>
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-parchment/56">
                {upvoted ? 'Apoiado' : 'Apoiar'}
              </span>
            </button>
            <span className="text-[12px] text-parchment/56">💬 {post.commentCount} comentários</span>
            <button
              onClick={handleReport}
              className="ml-auto text-[11px] uppercase tracking-[0.22em] text-parchment/40 hover:text-ruby"
            >
              Reportar
            </button>
          </div>
          {reportedNotice ? (
            <p className="mt-3 rounded-2xl border border-ruby/35 bg-ruby/10 px-3 py-2 text-[12px] text-ruby">
              Post reportado. Ele foi escondido do feed.
            </p>
          ) : null}
        </SectionSheet>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SECTION_TRANSITION, delay: 0.1 }}
      >
        <SectionSheet>
          <SectionKicker>Conversa</SectionKicker>

          <form onSubmit={submitTopComment} className="mt-3 space-y-2">
            <textarea
              value={topLevel}
              onChange={(e) => setTopLevel(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Comente com sua experiência ou pergunte algo…"
              className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[14px] leading-6 text-parchment placeholder:text-parchment/36 focus:border-brass/40 focus:outline-none"
            />
            {topLevelError ? (
              <p className="rounded-xl border border-ruby/40 bg-ruby/10 px-3 py-2 text-[12px] text-ruby">
                {topLevelError}
              </p>
            ) : null}
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] uppercase tracking-[0.22em] text-parchment/40">
                +{COMMENT_XP} XP por comentário
              </span>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={topLevel.trim().length < 2}
              >
                Comentar
              </Button>
            </div>
          </form>

          <div className="mt-5">
            <CommentList
              comments={comments}
              currentStudentId={student.id}
              onUpvote={(id) => toggleCommentUpvote(id, student.id)}
              onReply={handleReply}
            />
          </div>
        </SectionSheet>
      </motion.section>
    </div>
  );
}
