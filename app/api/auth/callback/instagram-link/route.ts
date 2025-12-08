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
  console.log("=== Instagram Link Callback Started ===");
  
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
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback/instagram-link`;

    // Exchange code for access token
    const tokenUrl = new URL("https://graph.facebook.com/v18.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenResponse = await fetch(tokenUrl.toString());

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Instagram token error:", errorData);
      throw new Error(`Token exchange failed: ${errorData}`);
    }

    const tokens = await tokenResponse.json();
    const shortLivedToken = tokens.access_token;

    // Exchange for long-lived token
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
      expiresIn = longLivedData.expires_in || 5184000;
    }

    const tokenExpiry = new Date(Date.now() + expiresIn * 1000).toISOString();

    // Get Facebook pages with Instagram business accounts
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${accessToken}`
    );

    if (!pagesResponse.ok) {
      throw new Error("Failed to fetch Facebook pages");
    }

    const pagesData = await pagesResponse.json();
    
    // Find a page with an Instagram business account
    let instagramAccountId = null;
    let instagramUsername = null;
    let pageAccessToken = null;

    for (const page of pagesData.data || []) {
      if (page.instagram_business_account) {
        // Get Instagram account details
        const igResponse = await fetch(
          `https://graph.facebook.com/v18.0/${page.instagram_business_account.id}?fields=id,username,profile_picture_url&access_token=${page.access_token}`
        );
        
        if (igResponse.ok) {
          const igData = await igResponse.json();
          instagramAccountId = igData.id;
          instagramUsername = igData.username;
          pageAccessToken = page.access_token;
          console.log("Found Instagram account:", instagramUsername);
          break;
        }
      }
    }

    if (!instagramAccountId) {
      throw new Error("No Instagram Business account found. Make sure you have an Instagram Professional account connected to a Facebook Page.");
    }

    const databases = getAdminClient();

    console.log("Instagram Account ID:", instagramAccountId);
    console.log("Instagram Username:", instagramUsername);
    
    // ========================================
    // STEP 1: Find or create the social account
    // ========================================
    let socialAccountId: string;
    
    const existingAccounts = await databases.listDocuments(
      DATABASE_ID,
      SOCIAL_ACCOUNTS_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.equal("platformUserId", instagramAccountId),
        Query.equal("platform", "instagram"),
      ]
    );

    if (existingAccounts.documents.length > 0) {
      const existingAccount = existingAccounts.documents[0];
      socialAccountId = existingAccount.$id;
      console.log("Updating existing Instagram account:", socialAccountId);
      
      await databases.updateDocument(
        DATABASE_ID,
        SOCIAL_ACCOUNTS_COLLECTION_ID,
        socialAccountId,
        {
          accessToken: pageAccessToken,
          tokenExpiry,
          accountName: `@${instagramUsername}`,
        }
      );
    } else {
      console.log("Creating new Instagram account");
      const newAccount = await databases.createDocument(
        DATABASE_ID,
        SOCIAL_ACCOUNTS_COLLECTION_ID,
        ID.unique(),
        {
          userId,
          platform: "instagram",
          platformUserId: instagramAccountId,
          accessToken: pageAccessToken,
          refreshToken: null,
          tokenExpiry,
          accountName: `@${instagramUsername}`,
          accountEmail: null,
          accountImage: null,
        }
      );
      socialAccountId = newAccount.$id;
      console.log("Created Instagram account:", socialAccountId);
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
      console.log("Linking Instagram account to workspace");
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
    redirectUrl.searchParams.set("success", `Instagram @${instagramUsername} linked successfully`);
    return NextResponse.redirect(redirectUrl.toString());

  } catch (error) {
    console.error("Instagram OAuth callback error:", error);
    let wsId = "";
    try {
      const stateData = JSON.parse(Buffer.from(state!, "base64").toString("utf-8"));
      wsId = stateData.workspaceId;
    } catch {}
    
    const redirectPath = wsId ? `/ws/${wsId}/settings` : "/onboarding";
    const redirectUrl = new URL(redirectPath, process.env.NEXTAUTH_URL);
    redirectUrl.searchParams.set("error", error instanceof Error ? error.message : "Failed to link Instagram account");
    return NextResponse.redirect(redirectUrl.toString());
  }
}
