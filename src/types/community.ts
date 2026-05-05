export type TopicId = 'plastico' | 'organico' | 'reuso' | 'eventos' | 'cases' | 'duvidas';

export interface Topic {
  id: TopicId;
  label: string;
  icon: string;
  color: string;
  description: string;
}

export interface School {
  id: string;
  name: string;
  city: string;
  state: string;
}

export interface PostAuthor {
  studentId: string;
  name: string;
  avatar: string;
  className: string;
  schoolId: string;
}

export interface Post {
  id: string;
  topicId: TopicId;
  author: PostAuthor;
  title: string;
  body: string;
  createdAt: string;
  upvotes: number;
  upvotedBy: string[];
  commentCount: number;
  reported: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  parentCommentId: string | null;
  author: PostAuthor;
  body: string;
  createdAt: string;
  upvotes: number;
  upvotedBy: string[];
  reported: boolean;
}

export interface ModerationResult {
  ok: boolean;
  reason?: 'too-short' | 'too-long' | 'banned-word' | 'contact-info' | 'rate-limit';
  message?: string;
}
