import { Client, Databases, Query, ID, Models } from "node-appwrite";
import { 
  Post, 
  CreatePostInput, 
  UpdatePostInput,
  PostStatus 
} from "./types";

// Initialize Appwrite Server Client
const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
  .setKey(process.env.APPWRITE_API_KEY || "");

const databases = new Databases(client);

const APPWRITE_CONFIG = {
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "linkedin-saas",
  postsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_POSTS || "posts",
};

interface PostDocument extends Models.Document {
  userId: string;
  workspaceId: string;
  content: string;
  topic: string;
  tone?: string;
  status: PostStatus;
  scheduledAt?: string;
  publishedPlatforms?: string;
  errorLog?: string;
  mediaUrls?: string;
  retryCount?: number;
  lastRetryAt?: string;
  isPublished?: boolean;
  publishedTo?: string;
  publishedAt?: string;
  platformContent?: string;
}

// Helper to parse document to Post type
function parsePost(doc: Models.Document): Post {
  const postDoc = doc as PostDocument;
  return {
    $id: postDoc.$id,
    $createdAt: postDoc.$createdAt,
    $updatedAt: postDoc.$updatedAt,
    userId: postDoc.userId,
    workspaceId: postDoc.workspaceId,
    content: postDoc.content,
    topic: postDoc.topic,
    tone: postDoc.tone || undefined,
    status: postDoc.status,
    scheduledAt: postDoc.scheduledAt || undefined,
    publishedPlatforms: JSON.parse(postDoc.publishedPlatforms || "[]"),
    errorLog: postDoc.errorLog || undefined,
    mediaUrls: JSON.parse(postDoc.mediaUrls || "[]"),
    retryCount: postDoc.retryCount || 0,
    lastRetryAt: postDoc.lastRetryAt || undefined,
    isPublished: postDoc.isPublished || false,
    publishedTo: postDoc.publishedTo || undefined,
    publishedAt: postDoc.publishedAt || undefined,
    platformContent: JSON.parse(postDoc.platformContent || "{}"),
  };
}

/**
 * Create a new post (Server Side)
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
      isPublished: false,
      publishedTo: "",
      publishedAt: "",
      platformContent: JSON.stringify(input.platformContent || {}),
    };

    const doc = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.postsCollectionId,
      ID.unique(),
      data
    );

    return parsePost(doc);
  } catch (error) {
    console.error("Error creating post (server):", error);
    throw error;
  }
}

/**
 * Get posts by workspace (Server Side)
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
    console.error("Error getting posts by workspace (server):", error);
    throw error;
  }
}

/**
 * Get a single post by ID (Server Side)
 */
export async function getPostById(postId: string): Promise<Post | null> {
  try {
    const doc = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.postsCollectionId,
      postId
    );
    return parsePost(doc);
  } catch (error: unknown) {
    const appwriteError = error as { code?: number };
    if (appwriteError.code === 404) {
      return null;
    }
    console.error("Error getting post by ID (server):", error);
    throw error;
  }
}

/**
 * Update a post (Server Side)
 */
export async function updatePost(
  postId: string,
  input: UpdatePostInput
): Promise<Post> {
  try {
    const data: Record<string, unknown> = { ...input };
    
    // Handle array/object fields that need stringification
    if (input.mediaUrls) {
      data.mediaUrls = JSON.stringify(input.mediaUrls);
    }
    if (input.publishedPlatforms) {
      data.publishedPlatforms = JSON.stringify(input.publishedPlatforms);
    }
    if (input.platformContent) {
      data.platformContent = JSON.stringify(input.platformContent);
    }

    const doc = await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.postsCollectionId,
      postId,
      data
    );

    return parsePost(doc);
  } catch (error) {
    console.error("Error updating post (server):", error);
    throw error;
  }
}

/**
 * Update post status with optional additional data (Server Side)
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
    console.error("Error updating post status (server):", error);
    throw error;
  }
}

/**
 * Delete a post (Server Side)
 */
export async function deletePost(postId: string): Promise<void> {
  try {
    await databases.deleteDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.postsCollectionId,
      postId
    );
  } catch (error) {
    console.error("Error deleting post (server):", error);
    throw error;
  }
}
