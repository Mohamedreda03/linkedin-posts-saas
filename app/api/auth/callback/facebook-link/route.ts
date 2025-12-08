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
  console.log("=== Facebook Link Callback Started ===");
  
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
    // Decode state
    const stateData = JSON.parse(Buffer.from(state, "base64").toString("utf-8"));
    const { userId, workspaceId } = stateData;
    console.log("Decoded - userId:", userId, "workspaceId:", workspaceId);

    if (!userId || !workspaceId) {
      throw new Error("Invalid state: missing required fields");
    }

    const appId = process.env.FACEBOOK_APP_ID!;
    const appSecret = process.env.FACEBOOK_APP_SECRET!;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback/facebook-link`;

    // Exchange code for access token
    const tokenUrl = new URL("https://graph.facebook.com/v18.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenResponse = await fetch(tokenUrl.toString());

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Facebook token error:", errorData);
      throw new Error(`Token exchange failed: ${errorData}`);
    }

    const tokens = await tokenResponse.json();
    const shortLivedToken = tokens.access_token;

    // Exchange for long-lived token (60 days instead of 1 hour)
    const longLivedUrl = new URL("https://graph.facebook.com/v18.0/oauth/access_token");
    longLivedUrl.searchParams.set("grant_type", "fb_exchange_token");
    longLivedUrl.searchParams.set("client_id", appId);
    longLivedUrl.searchParams.set("client_secret", appSecret);
    longLivedUrl.searchParams.set("fb_exchange_token", shortLivedToken);

    const longLivedResponse = await fetch(longLivedUrl.toString());
    let accessToken = shortLivedToken;
    let expiresIn = tokens.expires_in || 3600;

    if (longLivedResponse.ok) {
      const longLivedData = await longLivedResponse.json();
      accessToken = longLivedData.access_token;
      expiresIn = longLivedData.expires_in || 5184000; // 60 days default
    }

    const tokenExpiry = new Date(Date.now() + expiresIn * 1000).toISOString();

    // Get user profile
    const profileResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?fields=id,name,email,picture&access_token=${accessToken}`
    );

    if (!profileResponse.ok) {
      throw new Error("Failed to fetch Facebook profile");
    }

    const profile = await profileResponse.json();
    const platformUserId = profile.id;
    const accountName = profile.name;
    const accountEmail = profile.email;
    const accountImage = profile.picture?.data?.url;

    // Get user's pages (for posting)
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
    );
    
    let pageAccessToken = null;
    let pageId = null;
    let pageName = null;

    if (pagesResponse.ok) {
      const pagesData = await pagesResponse.json();
      if (pagesData.data && pagesData.data.length > 0) {
        // Use the first page (you might want to let user choose)
        const firstPage = pagesData.data[0];
        pageAccessToken = firstPage.access_token;
        pageId = firstPage.id;
        pageName = firstPage.name;
        console.log("Found Facebook Page:", pageName);
      }
    }

    const databases = getAdminClient();

    console.log("Facebook User ID:", platformUserId);
    
    // ========================================
    // STEP 1: Find or create the social account
    // ========================================
    let socialAccountId: string;
    
    const existingAccounts = await databases.listDocuments(
      DATABASE_ID,
      SOCIAL_ACCOUNTS_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.equal("platformUserId", pageId || platformUserId),
        Query.equal("platform", "facebook"),
      ]
    );

    // Store page token if available, otherwise user token
    const tokenToStore = pageAccessToken || accessToken;
    const idToStore = pageId || platformUserId;
    const nameToStore = pageName ? `${pageName} (Page)` : accountName;

    if (existingAccounts.documents.length > 0) {
      const existingAccount = existingAccounts.documents[0];
      socialAccountId = existingAccount.$id;
      console.log("Updating existing Facebook account:", socialAccountId);
      
      await databases.updateDocument(
        DATABASE_ID,
        SOCIAL_ACCOUNTS_COLLECTION_ID,
        socialAccountId,
        {
          accessToken: tokenToStore,
          tokenExpiry,
          accountName: nameToStore,
          accountEmail,
          accountImage,
        }
      );
    } else {
      console.log("Creating new Facebook account");
      const newAccount = await databases.createDocument(
        DATABASE_ID,
        SOCIAL_ACCOUNTS_COLLECTION_ID,
        ID.unique(),
        {
          userId,
          platform: "facebook",
          platformUserId: idToStore,
          accessToken: tokenToStore,
          refreshToken: null,
          tokenExpiry,
          accountName: nameToStore,
          accountEmail,
          accountImage,
        }
      );
      socialAccountId = newAccount.$id;
      console.log("Created Facebook account:", socialAccountId);
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
      console.log("Linking Facebook account to workspace");
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
    const successMessage = pageName 
      ? `Facebook Page "${pageName}" linked successfully` 
      : "Facebook account linked successfully";
    redirectUrl.searchParams.set("success", successMessage);
    return NextResponse.redirect(redirectUrl.toString());

  } catch (error) {
    console.error("Facebook OAuth callback error:", error);
    let wsId = "";
    try {
      const stateData = JSON.parse(Buffer.from(state!, "base64").toString("utf-8"));
      wsId = stateData.workspaceId;
    } catch {}
    
    const redirectPath = wsId ? `/ws/${wsId}/settings` : "/onboarding";
    const redirectUrl = new URL(redirectPath, process.env.NEXTAUTH_URL);
    redirectUrl.searchParams.set("error", error instanceof Error ? error.message : "Failed to link Facebook account");
    return NextResponse.redirect(redirectUrl.toString());
  }
}
