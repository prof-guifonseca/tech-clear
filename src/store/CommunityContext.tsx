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

const STORAGE_KEY = 'tech-clear-community-v1';

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;
    case 'CREATE_POST':
      return { ...state, posts: [action.post, ...state.posts] };
    case 'CREATE_COMMENT': {
      const { comment } = action;
      const posts = state.posts.map((p) =>
        p.id === comment.postId ? { ...p, commentCount: p.commentCount + 1 } : p,
      );
      return { ...state, posts, comments: [comment, ...state.comments] };
    }
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
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as State;
        if (parsed.posts && parsed.comments) {
          dispatch({ type: 'HYDRATE', state: parsed });
        }
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state, hydrated]);

  const createPost = useCallback<ContextValue['createPost']>(
    ({ author, title, body, topicId }) => {
      const rl = checkRateLimit(author.studentId, 'post');
      if (!rl.ok) return { result: rl };
      const mod = moderatePost(title, body);
      if (!mod.ok) return { result: mod };
      const post: Post = {
        id: 'post-' + Math.random().toString(36).slice(2, 10),
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
        id: 'c-' + Math.random().toString(36).slice(2, 10),
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
    (id: string) => state.posts.find((p) => p.id === id),
    [state.posts],
  );

  const getCommentsFor = useCallback(
    (postId: string) => state.comments.filter((c) => c.postId === postId),
    [state.comments],
  );

  const value = useMemo<ContextValue>(
    () => ({
      posts: state.posts,
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
    [state, hydrated, createPost, createComment, togglePostUpvote, toggleCommentUpvote, reportPost, getPost, getCommentsFor],
  );

  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}

export function useCommunity() {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error('useCommunity must be used within CommunityProvider');
  return ctx;
}
