// lib/types/post.ts

export type PostStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';

export interface PublishedPlatform {
  platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram';
  postId: string;
  publishedAt: string;
  url?: string;
}

export interface PlatformContent {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
}

export interface Post {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  workspaceId: string;
  content: string;
  topic: string;
  tone?: string;
  status: PostStatus;
  scheduledAt?: string;
  publishedPlatforms: PublishedPlatform[];
  errorLog?: string;
  mediaUrls: string[];
  retryCount: number;
  lastRetryAt?: string;
  isPublished: boolean; // للتوافق مع الكود القديم
  publishedTo?: string;
  publishedAt?: string;
  platformContent?: PlatformContent;
}

export interface CreatePostInput {
  userId: string;
  workspaceId: string;
  content: string;
  topic: string;
  tone?: string;
  status?: PostStatus;
  scheduledAt?: string;
  mediaUrls?: string[];
  platformContent?: PlatformContent;
}

export interface UpdatePostInput {
  content?: string;
  topic?: string;
  tone?: string;
  status?: PostStatus;
  scheduledAt?: string;
  publishedPlatforms?: PublishedPlatform[];
  errorLog?: string;
  mediaUrls?: string[];
  retryCount?: number;
  lastRetryAt?: string;
  platformContent?: PlatformContent;
}
