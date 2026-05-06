'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import { Composer } from '@/components/community/Composer';
import { PostCard } from '@/components/community/PostCard';
import { TopicChip } from '@/components/community/TopicChip';
import { TOPICS } from '@/data/community-topics';
import { HOME_SCHOOL_ID } from '@/data/community-schools';
import { Button, EmptyState, PageHeader, SectionKicker, SectionSheet } from '@/components/tech-clear/ui';
import { useCommunity } from '@/store/CommunityContext';
import { useGame } from '@/store/GameContext';
import type { ModerationResult, TopicId } from '@/types/community';

const POST_XP = 5;
const SECTION_TRANSITION = { duration: 0.4, ease: 'easeOut' as const };

export default function AgoraPage() {
  const { posts, createPost, togglePostUpvote } = useCommunity();
  const { state, dispatch } = useGame();
  const { student } = state;

  const [composerOpen, setComposerOpen] = useState(false);
  const [filter, setFilter] = useState<TopicId | 'all'>('all');

  const visiblePosts = useMemo(() => {
    const filtered = posts.filter((p) => !p.reported);
    const byTopic = filter === 'all' ? filtered : filtered.filter((p) => p.topicId === filter);
    return [...byTopic].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [posts, filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: 0 };
    for (const p of posts) {
      if (p.reported) continue;
      c.all++;
      c[p.topicId] = (c[p.topicId] ?? 0) + 1;
    }
    return c;
  }, [posts]);

  const handleSubmit = (input: { title: string; body: string; topicId: TopicId }): ModerationResult => {
    const { result } = createPost({
      author: {
        studentId: student.id,
        name: student.name,
        avatar: student.avatar,
        className: student.className,
        schoolId: HOME_SCHOOL_ID,
      },
      title: input.title,
      body: input.body,
      topicId: input.topicId,
    });
    if (result.ok) {
      dispatch({ type: 'ADD_XP', amount: POST_XP });
      setFilter(input.topicId);
    }
    return result;
  };

  return (
    <div className="space-y-4 pb-4">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SECTION_TRANSITION}
      >
        <SectionSheet tone="hero">
          <PageHeader
            eyebrow="Conselho aberto"
            title="Ágora"
            description="Praça das escolas. Compartilhe o que funcionou, peça ajuda no que travou, descubra como outras turmas resolveram. Tudo que importa pra reciclagem cabe aqui."
          />
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button
              onClick={() => setComposerOpen(true)}
              variant="success"
            >
              + Nova publicação
            </Button>
            <span className="text-[11px] uppercase tracking-[0.22em] text-parchment/42">
              +{POST_XP} XP por post aprovado
            </span>
          </div>
        </SectionSheet>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SECTION_TRANSITION, delay: 0.06 }}
      >
        <SectionSheet>
          <SectionKicker>Filtrar por tema</SectionKicker>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <TopicChip
              topicId="all"
              active={filter === 'all'}
              count={counts.all}
              onClick={() => setFilter('all')}
            />
            {TOPICS.map((t) => (
              <TopicChip
                key={t.id}
                topicId={t.id}
                active={filter === t.id}
                count={counts[t.id] ?? 0}
                onClick={() => setFilter(t.id)}
              />
            ))}
          </div>
        </SectionSheet>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SECTION_TRANSITION, delay: 0.12 }}
        className="space-y-3"
      >
        {visiblePosts.length === 0 ? (
          <SectionSheet tone="soft">
            <EmptyState>Nenhum post nessa categoria ainda. Seja o primeiro.</EmptyState>
          </SectionSheet>
        ) : (
          visiblePosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              upvoted={post.upvotedBy.includes(student.id)}
              onUpvote={() => togglePostUpvote(post.id, student.id)}
            />
          ))
        )}
      </motion.section>

      <Composer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
