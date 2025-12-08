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

// Facebook has a 63,206 character limit for posts
const FACEBOOK_MAX_LENGTH = 63206;

export async function POST(request: NextRequest) {
  try {
    const { content, accountId, userId, link } = await request.json();

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

    const postContent = content.length > FACEBOOK_MAX_LENGTH 
      ? content.substring(0, FACEBOOK_MAX_LENGTH - 3) + "..."
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
          Query.equal("platform", "facebook"),
          Query.limit(1),
        ]
      );

      if (accounts.documents.length === 0) {
        return NextResponse.json(
          { error: "No Facebook account connected. Please connect your Facebook account first." },
          { status: 400 }
        );
      }

      socialAccount = accounts.documents[0];
    }

    const accessToken = socialAccount.accessToken;
    const pageId = socialAccount.platformUserId;

    // Check token expiry
    if (socialAccount.tokenExpiry) {
      const expiryDate = new Date(socialAccount.tokenExpiry);
      if (expiryDate < new Date()) {
        return NextResponse.json(
          { error: "Facebook token expired. Please reconnect your Facebook account." },
          { status: 401 }
        );
      }
    }

    // Post to Facebook Page using Graph API
    const postUrl = new URL(`https://graph.facebook.com/v18.0/${pageId}/feed`);
    
    const postData: Record<string, string> = {
      message: postContent,
      access_token: accessToken,
    };

    // Optionally add a link
    if (link) {
      postData.link = link;
    }

    const response = await fetch(postUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(postData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Facebook API error:", response.status, errorData);

      if (response.status === 190 || errorData.error?.code === 190) {
        return NextResponse.json(
          { error: "Facebook session expired. Please reconnect your Facebook account." },
          { status: 401 }
        );
      }

      if (response.status === 200 && errorData.error) {
        return NextResponse.json(
          { error: `Facebook error: ${errorData.error.message}` },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: `Failed to post to Facebook: ${errorData.error?.message || "Unknown error"}` },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: "Post published to Facebook successfully!",
      postId: result.id,
      accountName: socialAccount.accountName,
    });
  } catch (error) {
    console.error("Error posting to Facebook:", error);
    return NextResponse.json(
      { error: "Failed to post to Facebook. Please try again." },
      { status: 500 }
    );
  }
}
