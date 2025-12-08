import { databases, APPWRITE_CONFIG, SocialAccount, SocialPlatform, Workspace, WorkspaceAccount } from "./appwrite";
import { Query, ID } from "appwrite";

export interface Post {
  $id: string;
  $createdAt: string;
  content: string;
  topic: string;
  tone?: string;
  isPublished: boolean;
  userId: string;
  workspaceId?: string;
  publishedTo?: string;
  publishedAt?: string;
}

// ========================================
// Workspaces API
// ========================================

export async function getWorkspaces(ownerId: string): Promise<Workspace[]> {
  const queries = [
    Query.equal("ownerId", ownerId),
    Query.orderDesc("$createdAt"),
  ];

  const response = await databases.listDocuments(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.workspacesCollectionId,
    queries
  );

  return response.documents as unknown as Workspace[];
}

export async function getWorkspaceById(workspaceId: string): Promise<Workspace> {
  const response = await databases.getDocument(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.workspacesCollectionId,
    workspaceId
  );

  return response as unknown as Workspace;
}

export async function getWorkspaceBySlug(slug: string): Promise<Workspace | null> {
  const queries = [
    Query.equal("slug", slug),
    Query.limit(1),
  ];

  const response = await databases.listDocuments(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.workspacesCollectionId,
    queries
  );

  if (response.documents.length === 0) {
    return null;
  }

  return response.documents[0] as unknown as Workspace;
}

export interface CreateWorkspaceInput {
  name: string;
  slug: string;
  ownerId: string;
  icon?: string;
  color?: string;
}

export async function createWorkspace(data: CreateWorkspaceInput): Promise<Workspace> {
  const response = await databases.createDocument(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.workspacesCollectionId,
    ID.unique(),
    data
  );

  return response as unknown as Workspace;
}

export async function updateWorkspace(
  workspaceId: string,
  data: Partial<Omit<CreateWorkspaceInput, "ownerId">>
): Promise<Workspace> {
  const response = await databases.updateDocument(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.workspacesCollectionId,
    workspaceId,
    data
  );

  return response as unknown as Workspace;
}

export async function deleteWorkspace(workspaceId: string): Promise<void> {
  await databases.deleteDocument(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.workspacesCollectionId,
    workspaceId
  );
}

// Generate unique slug from name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ========================================
// Posts API
// ========================================

export async function getPosts(
  userId: string,
  searchTerm?: string,
  status?: string,
  workspaceId?: string
) {
  const queries = [
    Query.equal("userId", userId),
    Query.orderDesc("$createdAt"),
  ];

  if (workspaceId) {
    queries.push(Query.equal("workspaceId", workspaceId));
  }

  if (searchTerm && searchTerm.trim()) {
    // Use contains for partial matching (works without full-text index)
    // Note: Appwrite Query.or requires specific syntax
    queries.push(Query.contains("content", searchTerm.trim()));
  }

  if (status === "published") {
    queries.push(Query.equal("isPublished", true));
  } else if (status === "draft") {
    queries.push(Query.equal("isPublished", false));
  }

  const response = await databases.listDocuments(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.postsCollectionId,
    queries
  );

  return response.documents as unknown as Post[];
}

export async function deletePost(postId: string) {
  await databases.deleteDocument(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.postsCollectionId,
    postId
  );
}

// ========================================
// Social Accounts API
// ========================================

// Get all social accounts for a user (regardless of workspace)
export async function getUserSocialAccounts(
  userId: string,
  platform?: SocialPlatform
): Promise<SocialAccount[]> {
  const queries = [
    Query.equal("userId", userId),
    Query.orderDesc("$createdAt"),
  ];

  if (platform) {
    queries.push(Query.equal("platform", platform));
  }

  const response = await databases.listDocuments(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.socialAccountsCollectionId,
    queries
  );

  return response.documents as unknown as SocialAccount[];
}

// Get social accounts linked to a specific workspace
export async function getWorkspaceSocialAccounts(
  workspaceId: string,
  platform?: SocialPlatform
): Promise<SocialAccount[]> {
  // First, get all links for this workspace
  const linkQueries = [Query.equal("workspaceId", workspaceId)];
  
  const linksResponse = await databases.listDocuments(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.workspaceAccountsCollectionId,
    linkQueries
  );

  const links = linksResponse.documents as unknown as WorkspaceAccount[];
  
  if (links.length === 0) {
    return [];
  }

  // Get the actual social accounts
  const accountIds = links.map(link => link.socialAccountId);
  const accountQueries = [Query.equal("$id", accountIds)];
  
  if (platform) {
    accountQueries.push(Query.equal("platform", platform));
  }

  const accountsResponse = await databases.listDocuments(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.socialAccountsCollectionId,
    accountQueries
  );

  return accountsResponse.documents as unknown as SocialAccount[];
}

// Legacy function - get accounts (supports both old and new schema)
export async function getSocialAccounts(
  userId: string,
  platform?: SocialPlatform,
  workspaceId?: string
): Promise<SocialAccount[]> {
  if (workspaceId) {
    return getWorkspaceSocialAccounts(workspaceId, platform);
  }
  return getUserSocialAccounts(userId, platform);
}

// Get a specific platform account for a workspace
export async function getWorkspaceSocialAccount(
  workspaceId: string,
  platform: SocialPlatform
): Promise<SocialAccount | null> {
  const accounts = await getWorkspaceSocialAccounts(workspaceId, platform);
  return accounts.length > 0 ? accounts[0] : null;
}

export async function getSocialAccountById(
  accountId: string
): Promise<SocialAccount> {
  const response = await databases.getDocument(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.socialAccountsCollectionId,
    accountId
  );

  return response as unknown as SocialAccount;
}

// Legacy function - kept for backward compatibility
export async function getDefaultSocialAccount(
  userId: string,
  platform: SocialPlatform
): Promise<SocialAccount | null> {
  const queries = [
    Query.equal("userId", userId),
    Query.equal("platform", platform),
    Query.limit(1),
  ];

  const response = await databases.listDocuments(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.socialAccountsCollectionId,
    queries
  );

  if (response.documents.length === 0) {
    return null;
  }

  return response.documents[0] as unknown as SocialAccount;
}

export interface CreateSocialAccountInput {
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

export async function createSocialAccount(
  data: CreateSocialAccountInput
): Promise<SocialAccount> {
  const response = await databases.createDocument(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.socialAccountsCollectionId,
    ID.unique(),
    data
  );

  return response as unknown as SocialAccount;
}

export async function updateSocialAccount(
  accountId: string,
  data: Partial<Omit<CreateSocialAccountInput, "userId" | "platform" | "platformUserId">>
): Promise<SocialAccount> {
  const response = await databases.updateDocument(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.socialAccountsCollectionId,
    accountId,
    data
  );

  return response as unknown as SocialAccount;
}

export async function deleteSocialAccount(accountId: string): Promise<void> {
  await databases.deleteDocument(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.socialAccountsCollectionId,
    accountId
  );
}

export async function findSocialAccountByPlatformUserId(
  platformUserId: string,
  platform: SocialPlatform
): Promise<SocialAccount | null> {
  const queries = [
    Query.equal("platformUserId", platformUserId),
    Query.equal("platform", platform),
    Query.limit(1),
  ];

  const response = await databases.listDocuments(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.socialAccountsCollectionId,
    queries
  );

  if (response.documents.length === 0) {
    return null;
  }

  return response.documents[0] as unknown as SocialAccount;
}

// ========================================
// Workspace Account Links API (Junction Table)
// ========================================

// Link an existing social account to a workspace
export async function linkAccountToWorkspace(
  workspaceId: string,
  socialAccountId: string,
  userId: string
): Promise<WorkspaceAccount> {
  // Check if already linked
  const existingLinks = await databases.listDocuments(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.workspaceAccountsCollectionId,
    [
      Query.equal("workspaceId", workspaceId),
      Query.equal("socialAccountId", socialAccountId),
    ]
  );

  if (existingLinks.documents.length > 0) {
    return existingLinks.documents[0] as unknown as WorkspaceAccount;
  }

  const response = await databases.createDocument(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.workspaceAccountsCollectionId,
    ID.unique(),
    {
      workspaceId,
      socialAccountId,
      userId,
    }
  );

  return response as unknown as WorkspaceAccount;
}

// Unlink an account from a workspace (doesn't delete the account)
export async function unlinkAccountFromWorkspace(
  workspaceId: string,
  socialAccountId: string
): Promise<void> {
  const links = await databases.listDocuments(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.workspaceAccountsCollectionId,
    [
      Query.equal("workspaceId", workspaceId),
      Query.equal("socialAccountId", socialAccountId),
    ]
  );

  for (const link of links.documents) {
    await databases.deleteDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.workspaceAccountsCollectionId,
      link.$id
    );
  }
}

// Get all workspace links for a social account
export async function getAccountWorkspaceLinks(
  socialAccountId: string
): Promise<WorkspaceAccount[]> {
  const response = await databases.listDocuments(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.workspaceAccountsCollectionId,
    [Query.equal("socialAccountId", socialAccountId)]
  );

  return response.documents as unknown as WorkspaceAccount[];
}

// Delete a social account and all its workspace links
export async function deleteSocialAccountCompletely(
  accountId: string
): Promise<void> {
  // First, delete all workspace links
  const links = await getAccountWorkspaceLinks(accountId);
  for (const link of links) {
    await databases.deleteDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.workspaceAccountsCollectionId,
      link.$id
    );
  }

  // Then delete the account itself
  await deleteSocialAccount(accountId);
}
