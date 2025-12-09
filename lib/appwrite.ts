import { Client, Account, Databases, Query, ID } from "appwrite";
import { 
  Post, 
  CreatePostInput, 
  UpdatePostInput, 
  PostStatus,
  PublishedPlatform 
} from "./types";

export const client = new Client();

client
  .setEndpoint(
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1"
  )
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

export const account = new Account(client);
export const databases = new Databases(client);

export const APPWRITE_CONFIG = {
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "linkedin-saas",
  postsCollectionId:
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_POSTS || "posts",
  socialAccountsCollectionId:
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_SOCIAL_ACCOUNTS || "social_accounts",
  workspacesCollectionId:
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_WORKSPACES || "workspaces",
  workspaceAccountsCollectionId:
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_WORKSPACE_ACCOUNTS || "workspace_accounts",
};

// Supported social media platforms
export type SocialPlatform = "linkedin" | "twitter" | "facebook" | "instagram";

// Workspace interface
export interface Workspace {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  slug: string;
  ownerId: string;
  icon?: string;
  color?: string;
}

export interface SocialAccount {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  platform: SocialPlatform;
  platformUserId: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiry?: string;
  accountName: string;
  accountEmail?: string;
  accountImage?: string;
}

// Junction table for workspace-account relationship
export interface WorkspaceAccount {
  $id: string;
  $createdAt: string;
  workspaceId: string;
  socialAccountId: string;
  userId: string;
}

export const PLATFORM_CONFIG: Record<SocialPlatform, { name: string; icon: string; color: string }> = {
  linkedin: { name: "LinkedIn", icon: "linkedin", color: "#0A66C2" },
  twitter: { name: "Twitter / X", icon: "twitter", color: "#1DA1F2" },
  facebook: { name: "Facebook", icon: "facebook", color: "#1877F2" },
  instagram: { name: "Instagram", icon: "instagram", color: "#E4405F" },
};

// ============================================================
// POST MANAGEMENT FUNCTIONS
// ============================================================

/**
 * Create a new post
 */
export async function createPost(input: CreatePostInput): Promise<Post> {
  try {
    const data = {
      userId: input.userId,
      workspaceId: input.workspaceId,
      content: input.content,
      topic: input.topic,
      tone: input.tone || "",
      status: input.status || "draft",
      scheduledAt: input.scheduledAt || "",
      publishedPlatforms: JSON.stringify([]),
      errorLog: "",
      mediaUrls: JSON.stringify(input.mediaUrls || []),
      retryCount: 0,
      lastRetryAt: "",
      isPublished: false, // للتوافق مع الكود القديم
      publishedTo: "",
      publishedAt: "",
    };

    const response = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.postsCollectionId,
      ID.unique(),
      data
    );

    return parsePost(response);
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}

/**
 * Update an existing post
 */
export async function updatePost(
  postId: string,
  input: UpdatePostInput
): Promise<Post> {
  try {
    const data: Record<string, any> = {};

    if (input.content !== undefined) data.content = input.content;
    if (input.topic !== undefined) data.topic = input.topic;
    if (input.tone !== undefined) data.tone = input.tone;
    if (input.status !== undefined) data.status = input.status;
    if (input.scheduledAt !== undefined) data.scheduledAt = input.scheduledAt;
    if (input.publishedPlatforms !== undefined)
      data.publishedPlatforms = JSON.stringify(input.publishedPlatforms);
    if (input.errorLog !== undefined) data.errorLog = input.errorLog;
    if (input.mediaUrls !== undefined)
      data.mediaUrls = JSON.stringify(input.mediaUrls);
    if (input.retryCount !== undefined) data.retryCount = input.retryCount;
    if (input.lastRetryAt !== undefined) data.lastRetryAt = input.lastRetryAt;

    const response = await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.postsCollectionId,
      postId,
      data
    );

    return parsePost(response);
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
}

/**
 * Get a post by ID
 */
export async function getPostById(postId: string): Promise<Post | null> {
  try {
    const response = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.postsCollectionId,
      postId
    );

    return parsePost(response);
  } catch (error: any) {
    if (error.code === 404) {
      return null;
    }
    console.error("Error getting post:", error);
    throw error;
  }
}

/**
 * Get posts by workspace with optional filtering
 */
export async function getPostsByWorkspace(
  workspaceId: string,
  status?: PostStatus,
  limit: number = 20,
  offset: number = 0
): Promise<{ posts: Post[]; total: number }> {
  try {
    const queries = [
      Query.equal("workspaceId", workspaceId),
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
      Query.offset(offset),
    ];

    if (status) {
      queries.push(Query.equal("status", status));
    }

    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.postsCollectionId,
      queries
    );

    return {
      posts: response.documents.map(parsePost),
      total: response.total,
    };
  } catch (error) {
    console.error("Error getting posts by workspace:", error);
    throw error;
  }
}

/**
 * Get scheduled posts that are ready to publish
 */
export async function getScheduledPostsReadyToPublish(): Promise<Post[]> {
  try {
    const now = new Date().toISOString();

    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.postsCollectionId,
      [
        Query.equal("status", "scheduled"),
        Query.lessThanEqual("scheduledAt", now),
        Query.limit(100), // معالجة 100 منشور كحد أقصى في كل دورة
      ]
    );

    return response.documents.map(parsePost);
  } catch (error) {
    console.error("Error getting scheduled posts:", error);
    throw error;
  }
}

/**
 * Update post status with optional additional data
 */
export async function updatePostStatus(
  postId: string,
  status: PostStatus,
  additionalData?: Partial<UpdatePostInput>
): Promise<Post> {
  try {
    const updateData: UpdatePostInput = {
      status,
      ...additionalData,
    };

    return await updatePost(postId, updateData);
  } catch (error) {
    console.error("Error updating post status:", error);
    throw error;
  }
}

/**
 * Delete a post
 */
export async function deletePost(postId: string): Promise<void> {
  try {
    await databases.deleteDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.postsCollectionId,
      postId
    );
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
}

/**
 * Helper function to parse post document from Appwrite
 */
function parsePost(doc: any): Post {
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
    userId: doc.userId,
    workspaceId: doc.workspaceId,
    content: doc.content,
    topic: doc.topic,
    tone: doc.tone || undefined,
    status: doc.status,
    scheduledAt: doc.scheduledAt || undefined,
    publishedPlatforms: JSON.parse(doc.publishedPlatforms || "[]"),
    errorLog: doc.errorLog || undefined,
    mediaUrls: JSON.parse(doc.mediaUrls || "[]"),
    retryCount: doc.retryCount || 0,
    lastRetryAt: doc.lastRetryAt || undefined,
    isPublished: doc.isPublished || false,
    publishedTo: doc.publishedTo || undefined,
    publishedAt: doc.publishedAt || undefined,
  };
}

