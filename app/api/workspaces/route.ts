import { NextRequest, NextResponse } from "next/server";
import { Client, Databases, ID, Query } from "node-appwrite";

// Initialize Appwrite Admin Client
function getAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);
  
  return new Databases(client);
}

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "linkedin-saas";
const WORKSPACES_COLLECTION_ID = 
  process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_WORKSPACES || "workspaces";

// Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// GET: List all workspaces for a user
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ownerId = searchParams.get("ownerId");

  if (!ownerId) {
    return NextResponse.json(
      { error: "ownerId is required" },
      { status: 400 }
    );
  }

  try {
    const databases = getAdminClient();

    const response = await databases.listDocuments(
      DATABASE_ID,
      WORKSPACES_COLLECTION_ID,
      [
        Query.equal("ownerId", ownerId),
        Query.orderDesc("$createdAt"),
      ]
    );

    return NextResponse.json({ workspaces: response.documents });
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return NextResponse.json(
      { error: "Failed to fetch workspaces" },
      { status: 500 }
    );
  }
}

// POST: Create a new workspace
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, ownerId, icon, color } = body;

    if (!name || !ownerId) {
      return NextResponse.json(
        { error: "name and ownerId are required" },
        { status: 400 }
      );
    }

    const databases = getAdminClient();

    // Generate unique slug
    const baseSlug = generateSlug(name);
    let slug = baseSlug;
    let counter = 1;

    // Check if slug exists and make it unique
    while (true) {
      const existing = await databases.listDocuments(
        DATABASE_ID,
        WORKSPACES_COLLECTION_ID,
        [Query.equal("slug", slug), Query.limit(1)]
      );

      if (existing.documents.length === 0) {
        break;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const workspace = await databases.createDocument(
      DATABASE_ID,
      WORKSPACES_COLLECTION_ID,
      ID.unique(),
      {
        name,
        slug,
        ownerId,
        icon: icon || "📁",
        color: color || "#6366f1",
      }
    );

    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error) {
    console.error("Error creating workspace:", error);
    return NextResponse.json(
      { error: "Failed to create workspace" },
      { status: 500 }
    );
  }
}

// PATCH: Update a workspace
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, ownerId, name, icon, color } = body;

    if (!workspaceId || !ownerId) {
      return NextResponse.json(
        { error: "workspaceId and ownerId are required" },
        { status: 400 }
      );
    }

    const databases = getAdminClient();

    // Verify ownership
    const workspace = await databases.getDocument(
      DATABASE_ID,
      WORKSPACES_COLLECTION_ID,
      workspaceId
    );

    if (workspace.ownerId !== ownerId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (icon) updateData.icon = icon;
    if (color) updateData.color = color;

    const updatedWorkspace = await databases.updateDocument(
      DATABASE_ID,
      WORKSPACES_COLLECTION_ID,
      workspaceId,
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

// DELETE: Delete a workspace
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const workspaceId = searchParams.get("workspaceId");
  const ownerId = searchParams.get("ownerId");

  if (!workspaceId || !ownerId) {
    return NextResponse.json(
      { error: "workspaceId and ownerId are required" },
      { status: 400 }
    );
  }

  try {
    const databases = getAdminClient();

    // Verify ownership
    const workspace = await databases.getDocument(
      DATABASE_ID,
      WORKSPACES_COLLECTION_ID,
      workspaceId
    );

    if (workspace.ownerId !== ownerId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if this is the last workspace
    const allWorkspaces = await databases.listDocuments(
      DATABASE_ID,
      WORKSPACES_COLLECTION_ID,
      [Query.equal("ownerId", ownerId)]
    );

    if (allWorkspaces.documents.length <= 1) {
      return NextResponse.json(
        { error: "Cannot delete the last workspace. Create another workspace first." },
        { status: 400 }
      );
    }

    await databases.deleteDocument(
      DATABASE_ID,
      WORKSPACES_COLLECTION_ID,
      workspaceId
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
