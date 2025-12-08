import { Client, Account, Databases } from "appwrite";

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
