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

// Instagram caption limit is 2,200 characters
const INSTAGRAM_MAX_LENGTH = 2200;

export async function POST(request: NextRequest) {
  try {
    const { content, accountId, userId, imageUrl } = await request.json();

    // Instagram REQUIRES an image for feed posts
    if (!imageUrl) {
      return NextResponse.json(
        { error: "Instagram requires an image URL. Text-only posts are not supported." },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Caption is optional but we'll use content if provided
    const caption = content 
      ? (content.length > INSTAGRAM_MAX_LENGTH 
          ? content.substring(0, INSTAGRAM_MAX_LENGTH - 3) + "..."
          : content)
      : "";

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
          Query.equal("platform", "instagram"),
          Query.limit(1),
        ]
      );

      if (accounts.documents.length === 0) {
        return NextResponse.json(
          { error: "No Instagram account connected. Please connect your Instagram account first." },
          { status: 400 }
        );
      }

      socialAccount = accounts.documents[0];
    }

    const accessToken = socialAccount.accessToken;
    const instagramAccountId = socialAccount.platformUserId;

    // Check token expiry
    if (socialAccount.tokenExpiry) {
      const expiryDate = new Date(socialAccount.tokenExpiry);
      if (expiryDate < new Date()) {
        return NextResponse.json(
          { error: "Instagram token expired. Please reconnect your Instagram account." },
          { status: 401 }
        );
      }
    }

    // Instagram Content Publishing is a 2-step process:
    // Step 1: Create a media container
    const containerUrl = new URL(`https://graph.facebook.com/v18.0/${instagramAccountId}/media`);
    
    const containerResponse = await fetch(containerUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        image_url: imageUrl,
        caption: caption,
        access_token: accessToken,
      }),
    });

    if (!containerResponse.ok) {
      const errorData = await containerResponse.json();
      console.error("Instagram container error:", containerResponse.status, errorData);

      if (errorData.error?.code === 190) {
        return NextResponse.json(
          { error: "Instagram session expired. Please reconnect your Instagram account." },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: `Failed to create Instagram media: ${errorData.error?.message || "Unknown error"}` },
        { status: containerResponse.status }
      );
    }

    const containerData = await containerResponse.json();
    const creationId = containerData.id;

    // Step 2: Publish the media container
    const publishUrl = new URL(`https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`);
    
    const publishResponse = await fetch(publishUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        creation_id: creationId,
        access_token: accessToken,
      }),
    });

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json();
      console.error("Instagram publish error:", publishResponse.status, errorData);

      return NextResponse.json(
        { error: `Failed to publish to Instagram: ${errorData.error?.message || "Unknown error"}` },
        { status: publishResponse.status }
      );
    }

    const result = await publishResponse.json();

    return NextResponse.json({
      success: true,
      message: "Post published to Instagram successfully!",
      postId: result.id,
      accountName: socialAccount.accountName,
    });
  } catch (error) {
    console.error("Error posting to Instagram:", error);
    return NextResponse.json(
      { error: "Failed to post to Instagram. Please try again." },
      { status: 500 }
    );
  }
}
