import { NextRequest, NextResponse } from "next/server";
import { Client, Databases, Query } from "node-appwrite";

// Initialize Appwrite Admin Client
function getAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);
  
  return new Databases(client);
}

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "linkedin-saas";
const SOCIAL_ACCOUNTS_COLLECTION_ID = 
  process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_SOCIAL_ACCOUNTS || "social_accounts";
const WORKSPACE_ACCOUNTS_COLLECTION_ID = 
  process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_WORKSPACE_ACCOUNTS || "workspace_accounts";

// GET: List all social accounts for a workspace (using junction table)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const workspaceId = searchParams.get("workspaceId");
  const userId = searchParams.get("userId");
  const platform = searchParams.get("platform");
  const allUserAccounts = searchParams.get("all") === "true";

  try {
    const databases = getAdminClient();

    // If requesting all user accounts (not workspace-specific)
    if (allUserAccounts && userId) {
      const queries = [
        Query.equal("userId", userId),
        Query.orderDesc("$createdAt"),
      ];

      if (platform) {
        queries.push(Query.equal("platform", platform));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        SOCIAL_ACCOUNTS_COLLECTION_ID,
        queries
      );

      const accounts = response.documents.map((doc) => ({
        $id: doc.$id,
        $createdAt: doc.$createdAt,
        userId: doc.userId,
        platform: doc.platform,
        platformUserId: doc.platformUserId,
        accountName: doc.accountName,
        accountEmail: doc.accountEmail,
        accountImage: doc.accountImage,
      }));

      return NextResponse.json({ accounts });
    }

    // Otherwise, get workspace-linked accounts
    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // Step 1: Get all links for this workspace
    const linksResponse = await databases.listDocuments(
      DATABASE_ID,
      WORKSPACE_ACCOUNTS_COLLECTION_ID,
      [Query.equal("workspaceId", workspaceId)]
    );

    const links = linksResponse.documents;
    
    if (links.length === 0) {
      return NextResponse.json({ accounts: [] });
    }

    // Step 2: Get the actual social accounts
    const accountIds = links.map(link => link.socialAccountId);
    const accountQueries: string[] = [];
    
    // Appwrite requires us to query each ID separately or use contains
    // For now, we'll get all and filter
    const allAccountsResponse = await databases.listDocuments(
      DATABASE_ID,
      SOCIAL_ACCOUNTS_COLLECTION_ID,
      [Query.orderDesc("$createdAt")]
    );

    // Filter to only linked accounts
    const linkedAccounts = allAccountsResponse.documents.filter(
      doc => accountIds.includes(doc.$id)
    );

    // Apply platform filter if provided
    const filteredAccounts = platform 
      ? linkedAccounts.filter(doc => doc.platform === platform)
      : linkedAccounts;

    // Remove sensitive data from response
    const accounts = filteredAccounts.map((doc) => ({
      $id: doc.$id,
      $createdAt: doc.$createdAt,
      userId: doc.userId,
      platform: doc.platform,
      platformUserId: doc.platformUserId,
      accountName: doc.accountName,
      accountEmail: doc.accountEmail,
      accountImage: doc.accountImage,
    }));

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error("Error fetching social accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch social accounts" },
      { status: 500 }
    );
  }
}

// DELETE: Unlink a social account from workspace (doesn't delete the account itself)
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const accountId = searchParams.get("accountId");
  const userId = searchParams.get("userId");
  const workspaceId = searchParams.get("workspaceId");
  const deleteCompletely = searchParams.get("deleteCompletely") === "true";

  if (!accountId || !userId) {
    return NextResponse.json(
      { error: "accountId and userId are required" },
      { status: 400 }
    );
  }

  try {
    const databases = getAdminClient();

    // Verify ownership
    const account = await databases.getDocument(
      DATABASE_ID,
      SOCIAL_ACCOUNTS_COLLECTION_ID,
      accountId
    );

    if (account.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    if (deleteCompletely) {
      // Delete all workspace links first
      const links = await databases.listDocuments(
        DATABASE_ID,
        WORKSPACE_ACCOUNTS_COLLECTION_ID,
        [Query.equal("socialAccountId", accountId)]
      );

      for (const link of links.documents) {
        await databases.deleteDocument(
          DATABASE_ID,
          WORKSPACE_ACCOUNTS_COLLECTION_ID,
          link.$id
        );
      }

      // Then delete the account itself
      await databases.deleteDocument(
        DATABASE_ID,
        SOCIAL_ACCOUNTS_COLLECTION_ID,
        accountId
      );
    } else if (workspaceId) {
      // Just unlink from the specific workspace
      const links = await databases.listDocuments(
        DATABASE_ID,
        WORKSPACE_ACCOUNTS_COLLECTION_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.equal("socialAccountId", accountId),
        ]
      );

      for (const link of links.documents) {
        await databases.deleteDocument(
          DATABASE_ID,
          WORKSPACE_ACCOUNTS_COLLECTION_ID,
          link.$id
        );
      }
    } else {
      return NextResponse.json(
        { error: "workspaceId is required for unlinking" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting/unlinking social account:", error);
    return NextResponse.json(
      { error: "Failed to delete/unlink social account" },
      { status: 500 }
    );
  }
}
