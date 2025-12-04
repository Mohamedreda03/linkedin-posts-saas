import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "Not authenticated. Please sign in with LinkedIn." },
        { status: 401 }
      );
    }

    const { content } = await request.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Post content is required" },
        { status: 400 }
      );
    }

    const userId = session.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found. Please sign in again." },
        { status: 401 }
      );
    }

    // Create the post using LinkedIn API
    const postData = {
      author: `urn:li:person:${userId}`,
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
        Authorization: `Bearer ${session.accessToken}`,
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
          { error: "LinkedIn session expired. Please sign in again." },
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
    });
  } catch (error) {
    console.error("Error posting to LinkedIn:", error);
    return NextResponse.json(
      { error: "Failed to post to LinkedIn. Please try again." },
      { status: 500 }
    );
  }
}
