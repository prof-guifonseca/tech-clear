'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';

import { SEED_COMMENTS } from '@/data/community-comments';
import { SEED_POSTS } from '@/data/community-posts';
import {
  checkRateLimit,
  moderateComment,
  moderatePost,
  recordRateLimit,
} from '@/lib/community-moderation';
import { createId } from '@/lib/id';
import { readJson, writeJson } from '@/lib/storage';
import type { Comment, ModerationResult, Post, PostAuthor, TopicId } from '@/types/community';

type State = {
  posts: Post[];
  comments: Comment[];
};

type Action =
  | { type: 'CREATE_POST'; post: Post }
  | { type: 'CREATE_COMMENT'; comment: Comment }
  | { type: 'TOGGLE_POST_UPVOTE'; postId: string; studentId: string }
  | { type: 'TOGGLE_COMMENT_UPVOTE'; commentId: string; studentId: string }
  | { type: 'REPORT_POST'; postId: string }
  | { type: 'HYDRATE'; state: State };

const STORAGE_KEY = 'tech-clear-community-v2';

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;
    case 'CREATE_POST':
      return { ...state, posts: [action.post, ...state.posts] };
    case 'CREATE_COMMENT':
      return { ...state, comments: [action.comment, ...state.comments] };
    case 'TOGGLE_POST_UPVOTE': {
      const { postId, studentId } = action;
      const posts = state.posts.map((p) => {
        if (p.id !== postId) return p;
        const has = p.upvotedBy.includes(studentId);
        return {
          ...p,
          upvotes: p.upvotes + (has ? -1 : 1),
          upvotedBy: has ? p.upvotedBy.filter((s) => s !== studentId) : [...p.upvotedBy, studentId],
        };
      });
      return { ...state, posts };
    }
    case 'TOGGLE_COMMENT_UPVOTE': {
      const { commentId, studentId } = action;
      const comments = state.comments.map((c) => {
        if (c.id !== commentId) return c;
        const has = c.upvotedBy.includes(studentId);
        return {
          ...c,
          upvotes: c.upvotes + (has ? -1 : 1),
          upvotedBy: has ? c.upvotedBy.filter((s) => s !== studentId) : [...c.upvotedBy, studentId],
        };
      });
      return { ...state, comments };
    }
    case 'REPORT_POST':
      return {
        ...state,
        posts: state.posts.map((p) => (p.id === action.postId ? { ...p, reported: true } : p)),
      };
    default:
      return state;
  }
}

function initialState(): State {
  return { posts: SEED_POSTS, comments: SEED_COMMENTS };
}

function restoreState(saved: unknown): State {
  if (!isRecord(saved)) return initialState();

  return {
    posts: Array.isArray(saved.posts) ? (saved.posts as Post[]) : SEED_POSTS,
    comments: Array.isArray(saved.comments) ? (saved.comments as Comment[]) : SEED_COMMENTS,
  };
}

function withCommentCounts(posts: Post[], comments: Comment[]): Post[] {
  const counts = new Map<string, number>();
  for (const comment of comments) {
    counts.set(comment.postId, (counts.get(comment.postId) ?? 0) + 1);
  }

  return posts.map((post) => ({
    ...post,
    commentCount: counts.get(post.id) ?? 0,
  }));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

type ContextValue = {
  posts: Post[];
  comments: Comment[];
  hydrated: boolean;
  createPost: (input: {
    author: PostAuthor;
    title: string;
    body: string;
    topicId: TopicId;
  }) => { result: ModerationResult; post?: Post };
  createComment: (input: {
    author: PostAuthor;
    postId: string;
    parentCommentId: string | null;
    body: string;
  }) => { result: ModerationResult; comment?: Comment };
  togglePostUpvote: (postId: string, studentId: string) => void;
  toggleCommentUpvote: (commentId: string, studentId: string) => void;
  reportPost: (postId: string) => void;
  getPost: (id: string) => Post | undefined;
  getCommentsFor: (postId: string) => Comment[];
};

const CommunityContext = createContext<ContextValue | undefined>(undefined);

export function CommunityProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    dispatch({ type: 'HYDRATE', state: restoreState(readJson<unknown>(STORAGE_KEY, null)) });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeJson(STORAGE_KEY, state);
  }, [state, hydrated]);

  const posts = useMemo(() => withCommentCounts(state.posts, state.comments), [state.posts, state.comments]);

  const createPost = useCallback<ContextValue['createPost']>(
    ({ author, title, body, topicId }) => {
      const rl = checkRateLimit(author.studentId, 'post');
      if (!rl.ok) return { result: rl };
      const mod = moderatePost(title, body);
      if (!mod.ok) return { result: mod };
      const post: Post = {
        id: createId('post'),
        topicId,
        author,
        title: title.trim(),
        body: body.trim(),
        createdAt: new Date().toISOString(),
        upvotes: 1,
        upvotedBy: [author.studentId],
        commentCount: 0,
        reported: false,
      };
      recordRateLimit(author.studentId, 'post');
      dispatch({ type: 'CREATE_POST', post });
      return { result: { ok: true }, post };
    },
    [],
  );

  const createComment = useCallback<ContextValue['createComment']>(
    ({ author, postId, parentCommentId, body }) => {
      const rl = checkRateLimit(author.studentId, 'comment');
      if (!rl.ok) return { result: rl };
      const mod = moderateComment(body);
      if (!mod.ok) return { result: mod };
      const comment: Comment = {
        id: createId('c'),
        postId,
        parentCommentId,
        author,
        body: body.trim(),
        createdAt: new Date().toISOString(),
        upvotes: 1,
        upvotedBy: [author.studentId],
        reported: false,
      };
      recordRateLimit(author.studentId, 'comment');
      dispatch({ type: 'CREATE_COMMENT', comment });
      return { result: { ok: true }, comment };
    },
    [],
  );

  const togglePostUpvote = useCallback((postId: string, studentId: string) => {
    dispatch({ type: 'TOGGLE_POST_UPVOTE', postId, studentId });
  }, []);

  const toggleCommentUpvote = useCallback((commentId: string, studentId: string) => {
    dispatch({ type: 'TOGGLE_COMMENT_UPVOTE', commentId, studentId });
  }, []);

  const reportPost = useCallback((postId: string) => {
    dispatch({ type: 'REPORT_POST', postId });
  }, []);

  const getPost = useCallback(
    (id: string) => posts.find((p) => p.id === id),
    [posts],
  );

  const getCommentsFor = useCallback(
    (postId: string) => state.comments.filter((c) => c.postId === postId),
    [state.comments],
  );

  const value = useMemo<ContextValue>(
    () => ({
      posts,
      comments: state.comments,
      hydrated,
      createPost,
      createComment,
      togglePostUpvote,
      toggleCommentUpvote,
      reportPost,
      getPost,
      getCommentsFor,
    }),
    [posts, state.comments, hydrated, createPost, createComment, togglePostUpvote, toggleCommentUpvote, reportPost, getPost, getCommentsFor],
  );

  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}

export function useCommunity() {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error('useCommunity must be used within CommunityProvider');
  return ctx;
}
