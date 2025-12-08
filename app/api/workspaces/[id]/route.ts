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
const WORKSPACES_COLLECTION_ID = "workspaces";
const SOCIAL_ACCOUNTS_COLLECTION_ID = 
  process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_SOCIAL_ACCOUNTS || "social_accounts";
const POSTS_COLLECTION_ID = "posts";

// GET: Get a specific workspace
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const databases = getAdminClient();
    const workspace = await databases.getDocument(
      DATABASE_ID,
      WORKSPACES_COLLECTION_ID,
      id
    );

    return NextResponse.json({ workspace });
  } catch (error) {
    console.error("Error fetching workspace:", error);
    return NextResponse.json(
      { error: "Failed to fetch workspace" },
      { status: 500 }
    );
  }
}

// PATCH: Update a workspace
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { name, icon, color } = body;

    const databases = getAdminClient();

    // Build update object with only provided fields
    const updateData: Record<string, string> = {};
    if (name !== undefined) updateData.name = name;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;

    const updatedWorkspace = await databases.updateDocument(
      DATABASE_ID,
      WORKSPACES_COLLECTION_ID,
      id,
      updateData
    );

    return NextResponse.json({ workspace: updatedWorkspace });
  } catch (error) {
    console.error("Error updating workspace:", error);
    return NextResponse.json(
      { error: "Failed to update workspace" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a workspace and all associated data
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const databases = getAdminClient();

    // Delete all social accounts associated with this workspace
    const socialAccounts = await databases.listDocuments(
      DATABASE_ID,
      SOCIAL_ACCOUNTS_COLLECTION_ID,
      [Query.equal("workspaceId", id)]
    );

    for (const account of socialAccounts.documents) {
      await databases.deleteDocument(
        DATABASE_ID,
        SOCIAL_ACCOUNTS_COLLECTION_ID,
        account.$id
      );
    }

    // Delete all posts associated with this workspace
    try {
      const posts = await databases.listDocuments(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        [Query.equal("workspaceId", id)]
      );

      for (const post of posts.documents) {
        await databases.deleteDocument(
          DATABASE_ID,
          POSTS_COLLECTION_ID,
          post.$id
        );
      }
    } catch {
      // Posts collection might not exist or have workspaceId index yet
      console.log("Could not delete posts - collection may not be set up");
    }

    // Delete the workspace itself
    await databases.deleteDocument(
      DATABASE_ID,
      WORKSPACES_COLLECTION_ID,
      id
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting workspace:", error);
    return NextResponse.json(
      { error: "Failed to delete workspace" },
      { status: 500 }
    );
  }
}
