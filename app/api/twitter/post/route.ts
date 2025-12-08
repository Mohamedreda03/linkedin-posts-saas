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

// Twitter has a 280 character limit
const TWITTER_MAX_LENGTH = 280;

export async function POST(request: NextRequest) {
  try {
    const { content, accountId, userId } = await request.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Post content is required" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Truncate content if too long (or you could return an error)
    const tweetContent = content.length > TWITTER_MAX_LENGTH 
      ? content.substring(0, TWITTER_MAX_LENGTH - 3) + "..."
      : content;

    const databases = getAdminClient();
    let socialAccount;

    if (accountId) {
      socialAccount = await databases.getDocument(
        DATABASE_ID,
        SOCIAL_ACCOUNTS_COLLECTION_ID,
        accountId
      );

      if (socialAccount.userId !== userId) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
      }
    } else {
      const accounts = await databases.listDocuments(
        DATABASE_ID,
        SOCIAL_ACCOUNTS_COLLECTION_ID,
        [
          Query.equal("userId", userId),
          Query.equal("platform", "twitter"),
          Query.limit(1),
        ]
      );

      if (accounts.documents.length === 0) {
        return NextResponse.json(
          { error: "No Twitter account connected. Please connect your Twitter account first." },
          { status: 400 }
        );
      }

      socialAccount = accounts.documents[0];
    }

    const accessToken = socialAccount.accessToken;

    // Check token expiry
    if (socialAccount.tokenExpiry) {
      const expiryDate = new Date(socialAccount.tokenExpiry);
      if (expiryDate < new Date()) {
        // Try to refresh the token
        if (socialAccount.refreshToken) {
          const refreshedToken = await refreshTwitterToken(socialAccount.refreshToken, databases, socialAccount.$id);
          if (refreshedToken) {
            socialAccount.accessToken = refreshedToken;
          } else {
            return NextResponse.json(
              { error: "Twitter token expired. Please reconnect your Twitter account." },
              { status: 401 }
            );
          }
        } else {
          return NextResponse.json(
            { error: "Twitter token expired. Please reconnect your Twitter account." },
            { status: 401 }
          );
        }
      }
    }

    // Post tweet using Twitter API v2
    const response = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${socialAccount.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: tweetContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Twitter API error:", response.status, errorData);

      if (response.status === 401) {
        return NextResponse.json(
          { error: "Twitter session expired. Please reconnect your Twitter account." },
          { status: 401 }
        );
      }

      if (response.status === 403) {
        return NextResponse.json(
          { error: "Permission denied. Make sure you have granted posting permissions." },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: `Failed to post to Twitter: ${errorData.detail || errorData.title || "Unknown error"}` },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: "Tweet posted successfully!",
      postId: result.data.id,
      accountName: socialAccount.accountName,
    });
  } catch (error) {
    console.error("Error posting to Twitter:", error);
    return NextResponse.json(
      { error: "Failed to post to Twitter. Please try again." },
      { status: 500 }
    );
  }
}

// Helper function to refresh Twitter token
async function refreshTwitterToken(
  refreshToken: string, 
  databases: Databases, 
  accountId: string
): Promise<string | null> {
  try {
    const clientId = process.env.TWITTER_CLIENT_ID!;
    const clientSecret = process.env.TWITTER_CLIENT_SECRET!;
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const tokens = await response.json();
    const newAccessToken = tokens.access_token;
    const newRefreshToken = tokens.refresh_token;
    const expiresIn = tokens.expires_in || 7200;
    const tokenExpiry = new Date(Date.now() + expiresIn * 1000).toISOString();

    // Update tokens in database
    await databases.updateDocument(
      DATABASE_ID,
      SOCIAL_ACCOUNTS_COLLECTION_ID,
      accountId,
      {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken || refreshToken,
        tokenExpiry,
      }
    );

    return newAccessToken;
  } catch (error) {
    console.error("Failed to refresh Twitter token:", error);
    return null;
  }
}
