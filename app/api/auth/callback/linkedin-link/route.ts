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
const SOCIAL_ACCOUNTS_COLLECTION_ID = 
  process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_SOCIAL_ACCOUNTS || "social_accounts";
const WORKSPACE_ACCOUNTS_COLLECTION_ID = 
  process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_WORKSPACE_ACCOUNTS || "workspace_accounts";

export async function GET(request: NextRequest) {
  console.log("=== LinkedIn Link Callback Started ===");
  
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Handle OAuth errors
  if (error) {
    // Can't redirect to specific workspace without state, fallback to onboarding
    const redirectUrl = new URL("/onboarding", process.env.NEXTAUTH_URL);
    redirectUrl.searchParams.set("error", errorDescription || error);
    return NextResponse.redirect(redirectUrl.toString());
  }

  if (!code || !state) {
    const redirectUrl = new URL("/onboarding", process.env.NEXTAUTH_URL);
    redirectUrl.searchParams.set("error", "Missing authorization code or state");
    return NextResponse.redirect(redirectUrl.toString());
  }

  try {
    // Decode state to get userId and workspaceId
    const stateData = JSON.parse(Buffer.from(state, "base64").toString("utf-8"));
    const { userId, workspaceId } = stateData;
    console.log("Decoded - userId:", userId, "workspaceId:", workspaceId);

    if (!userId || !workspaceId) {
      throw new Error("Invalid state: missing userId or workspaceId");
    }

    // Exchange code for tokens
    const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/linkedin-link`,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${errorData}`);
    }

    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;
    const expiresIn = tokens.expires_in;
    const tokenExpiry = new Date(Date.now() + expiresIn * 1000).toISOString();

    // Get LinkedIn profile info
    const profileResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!profileResponse.ok) {
      throw new Error("Failed to fetch LinkedIn profile");
    }

    const profile = await profileResponse.json();
    const platformUserId = profile.sub;
    const accountName = profile.name;
    const accountEmail = profile.email;
    const accountImage = profile.picture;

    const databases = getAdminClient();

    console.log("LinkedIn User ID:", platformUserId);
    console.log("Target workspace:", workspaceId);
    
    // ========================================
    // STEP 1: Find or create the social account (user-level)
    // ========================================
    let socialAccountId: string;
    
    // Check if this LinkedIn account already exists for this user
    const existingAccounts = await databases.listDocuments(
      DATABASE_ID,
      SOCIAL_ACCOUNTS_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.equal("platformUserId", platformUserId),
        Query.equal("platform", "linkedin"),
      ]
    );

    if (existingAccounts.documents.length > 0) {
      // Update existing account with fresh tokens
      const existingAccount = existingAccounts.documents[0];
      socialAccountId = existingAccount.$id;
      console.log("Updating existing social account:", socialAccountId);
      
      await databases.updateDocument(
        DATABASE_ID,
        SOCIAL_ACCOUNTS_COLLECTION_ID,
        socialAccountId,
        {
          accessToken,
          refreshToken: tokens.refresh_token || null,
          tokenExpiry,
          accountName,
          accountEmail,
          accountImage,
        }
      );
    } else {
      // Create new social account
      console.log("Creating new social account");
      const newAccount = await databases.createDocument(
        DATABASE_ID,
        SOCIAL_ACCOUNTS_COLLECTION_ID,
        ID.unique(),
        {
          userId,
          platform: "linkedin",
          platformUserId,
          accessToken,
          refreshToken: tokens.refresh_token || null,
          tokenExpiry,
          accountName,
          accountEmail,
          accountImage,
        }
      );
      socialAccountId = newAccount.$id;
      console.log("Created social account:", socialAccountId);
    }

    // ========================================
    // STEP 2: Link the social account to the workspace
    // ========================================
    
    // Check if this workspace already has this account linked
    const existingLinks = await databases.listDocuments(
      DATABASE_ID,
      WORKSPACE_ACCOUNTS_COLLECTION_ID,
      [
        Query.equal("workspaceId", workspaceId),
        Query.equal("socialAccountId", socialAccountId),
      ]
    );

    if (existingLinks.documents.length === 0) {
      // Create the link
      console.log("Linking account to workspace");
      await databases.createDocument(
        DATABASE_ID,
        WORKSPACE_ACCOUNTS_COLLECTION_ID,
        ID.unique(),
        {
          workspaceId,
          socialAccountId,
          userId,
        }
      );
      console.log("Account linked to workspace successfully");
    } else {
      console.log("Account already linked to this workspace");
    }

    const redirectUrl = new URL(`/ws/${workspaceId}/settings`, process.env.NEXTAUTH_URL);
    redirectUrl.searchParams.set("success", "LinkedIn account linked successfully");
    return NextResponse.redirect(redirectUrl.toString());

  } catch (error) {
    console.error("LinkedIn OAuth callback error:", error);
    // Try to get workspaceId from state for redirect
    let wsId = "";
    try {
      const stateData = JSON.parse(Buffer.from(state!, "base64").toString("utf-8"));
      wsId = stateData.workspaceId;
    } catch {}
    
    const redirectPath = wsId ? `/ws/${wsId}/settings` : "/onboarding";
    const redirectUrl = new URL(redirectPath, process.env.NEXTAUTH_URL);
    redirectUrl.searchParams.set("error", error instanceof Error ? error.message : "Failed to link account");
    return NextResponse.redirect(redirectUrl.toString());
  }
}
