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

    const databases = getAdminClient();
    let socialAccount;

    if (accountId) {
      // Get specific account
      socialAccount = await databases.getDocument(
        DATABASE_ID,
        SOCIAL_ACCOUNTS_COLLECTION_ID,
        accountId
      );

      // Verify ownership
      if (socialAccount.userId !== userId) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
      }
    } else {
      // Get default LinkedIn account for user
      const accounts = await databases.listDocuments(
        DATABASE_ID,
        SOCIAL_ACCOUNTS_COLLECTION_ID,
        [
          Query.equal("userId", userId),
          Query.equal("platform", "linkedin"),
          Query.equal("isDefault", true),
          Query.limit(1),
        ]
      );

      if (accounts.documents.length === 0) {
        // Try to get any LinkedIn account
        const anyAccounts = await databases.listDocuments(
          DATABASE_ID,
          SOCIAL_ACCOUNTS_COLLECTION_ID,
          [
            Query.equal("userId", userId),
            Query.equal("platform", "linkedin"),
            Query.limit(1),
          ]
        );

        if (anyAccounts.documents.length === 0) {
          return NextResponse.json(
            { error: "No LinkedIn account connected. Please connect your LinkedIn account first." },
            { status: 400 }
          );
        }

        socialAccount = anyAccounts.documents[0];
      } else {
        socialAccount = accounts.documents[0];
      }
    }

    const accessToken = socialAccount.accessToken;
    const platformUserId = socialAccount.platformUserId;

    // Check token expiry
    if (socialAccount.tokenExpiry) {
      const expiryDate = new Date(socialAccount.tokenExpiry);
      if (expiryDate < new Date()) {
        return NextResponse.json(
          { error: "LinkedIn token expired. Please reconnect your LinkedIn account." },
          { status: 401 }
        );
      }
    }

    // Create the post using LinkedIn API
    const postData = {
      author: `urn:li:person:${platformUserId}`,
      commentary: content,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: "PUBLISHED",
    };

    const response = await fetch("https://api.linkedin.com/rest/posts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
        "LinkedIn-Version": "202411",
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("LinkedIn API error:", response.status, errorText);

      if (response.status === 401) {
        return NextResponse.json(
          { error: "LinkedIn session expired. Please reconnect your LinkedIn account." },
          { status: 401 }
        );
      }

      if (response.status === 403) {
        return NextResponse.json(
          {
            error:
              "Permission denied. Make sure you have granted posting permissions.",
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: `Failed to post to LinkedIn: ${errorText}` },
        { status: response.status }
      );
    }

    // LinkedIn returns 201 Created with the post ID in the x-restli-id header
    const postId = response.headers.get("x-restli-id");

    return NextResponse.json({
      success: true,
      message: "Post published successfully!",
      postId,
      accountName: socialAccount.accountName,
    });
  } catch (error) {
    console.error("Error posting to LinkedIn:", error);
    return NextResponse.json(
      { error: "Failed to post to LinkedIn. Please try again." },
      { status: 500 }
    );
  }
}
