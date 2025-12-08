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
  console.log("=== Twitter Link Callback Started ===");
  
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Handle OAuth errors
  if (error) {
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
    // Decode state to get userId, workspaceId, and codeVerifier
    const stateData = JSON.parse(Buffer.from(state, "base64").toString("utf-8"));
    const { userId, workspaceId, codeVerifier } = stateData;
    console.log("Decoded - userId:", userId, "workspaceId:", workspaceId);

    if (!userId || !workspaceId || !codeVerifier) {
      throw new Error("Invalid state: missing required fields");
    }

    const clientId = process.env.TWITTER_CLIENT_ID!;
    const clientSecret = process.env.TWITTER_CLIENT_SECRET!;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback/twitter-link`;

    // Exchange code for tokens (Twitter uses Basic Auth)
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    
    const tokenResponse = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Twitter token error:", errorData);
      throw new Error(`Token exchange failed: ${errorData}`);
    }

    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;
    const expiresIn = tokens.expires_in || 7200; // Default 2 hours
    const tokenExpiry = new Date(Date.now() + expiresIn * 1000).toISOString();

    // Get Twitter user info
    const userResponse = await fetch("https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to fetch Twitter profile");
    }

    const userData = await userResponse.json();
    const user = userData.data;
    const platformUserId = user.id;
    const accountName = user.name;
    const accountHandle = user.username;
    const accountImage = user.profile_image_url;

    const databases = getAdminClient();

    console.log("Twitter User ID:", platformUserId);
    console.log("Twitter Handle:", accountHandle);
    
    // ========================================
    // STEP 1: Find or create the social account
    // ========================================
    let socialAccountId: string;
    
    const existingAccounts = await databases.listDocuments(
      DATABASE_ID,
      SOCIAL_ACCOUNTS_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.equal("platformUserId", platformUserId),
        Query.equal("platform", "twitter"),
      ]
    );

    if (existingAccounts.documents.length > 0) {
      const existingAccount = existingAccounts.documents[0];
      socialAccountId = existingAccount.$id;
      console.log("Updating existing Twitter account:", socialAccountId);
      
      await databases.updateDocument(
        DATABASE_ID,
        SOCIAL_ACCOUNTS_COLLECTION_ID,
        socialAccountId,
        {
          accessToken,
          refreshToken: refreshToken || null,
          tokenExpiry,
          accountName: `${accountName} (@${accountHandle})`,
          accountImage,
        }
      );
    } else {
      console.log("Creating new Twitter account");
      const newAccount = await databases.createDocument(
        DATABASE_ID,
        SOCIAL_ACCOUNTS_COLLECTION_ID,
        ID.unique(),
        {
          userId,
          platform: "twitter",
          platformUserId,
          accessToken,
          refreshToken: refreshToken || null,
          tokenExpiry,
          accountName: `${accountName} (@${accountHandle})`,
          accountEmail: null,
          accountImage,
        }
      );
      socialAccountId = newAccount.$id;
      console.log("Created Twitter account:", socialAccountId);
    }

    // ========================================
    // STEP 2: Link to workspace
    // ========================================
    const existingLinks = await databases.listDocuments(
      DATABASE_ID,
      WORKSPACE_ACCOUNTS_COLLECTION_ID,
      [
        Query.equal("workspaceId", workspaceId),
        Query.equal("socialAccountId", socialAccountId),
      ]
    );

    if (existingLinks.documents.length === 0) {
      console.log("Linking Twitter account to workspace");
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
    }

    const redirectUrl = new URL(`/ws/${workspaceId}/settings`, process.env.NEXTAUTH_URL);
    redirectUrl.searchParams.set("success", "Twitter account linked successfully");
    return NextResponse.redirect(redirectUrl.toString());

  } catch (error) {
    console.error("Twitter OAuth callback error:", error);
    let wsId = "";
    try {
      const stateData = JSON.parse(Buffer.from(state!, "base64").toString("utf-8"));
      wsId = stateData.workspaceId;
    } catch {}
    
    const redirectPath = wsId ? `/ws/${wsId}/settings` : "/onboarding";
    const redirectUrl = new URL(redirectPath, process.env.NEXTAUTH_URL);
    redirectUrl.searchParams.set("error", error instanceof Error ? error.message : "Failed to link Twitter account");
    return NextResponse.redirect(redirectUrl.toString());
  }
}
