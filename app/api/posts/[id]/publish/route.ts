import { NextRequest, NextResponse } from "next/server";
import { getPostById, updatePost, updatePostStatus } from "@/lib/appwrite-server";
import { PublishedPlatform } from "@/lib/types";

type PlatformName = "linkedin" | "twitter" | "facebook" | "instagram";

interface PublishRequest {
  platforms: PlatformName[];
  userId: string;
  workspaceId: string;
}

interface PlatformPublishResult {
  platform: PlatformName;
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
}

/**
 * POST /api/posts/[id]/publish
 * نشر منشور على المنصات المحددة
 * 
 * Body:
 * {
 *   platforms: string[], // ['linkedin', 'twitter', 'facebook', 'instagram']
 *   userId: string,
 *   workspaceId: string
 * }
 */
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const postId = params.id;

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    const body: PublishRequest = await request.json();

    // التحقق من الحقول المطلوبة
    if (!body.platforms || !Array.isArray(body.platforms) || body.platforms.length === 0) {
      return NextResponse.json(
        { error: "platforms array is required" },
        { status: 400 }
      );
    }

    if (!body.userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // جلب المنشور
    const post = await getPostById(postId);

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // التحقق من أن المستخدم هو مالك المنشور
    if (post.userId !== body.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // التحقق من حالة المنشور
    if (post.status === "publishing") {
      return NextResponse.json(
        { error: "Post is already being published" },
        { status: 400 }
      );
    }

    // تغيير الحالة إلى publishing
    await updatePostStatus(postId, "publishing");

    // نشر على كل منصة
    const results: PlatformPublishResult[] = [];
    const publishedPlatforms: PublishedPlatform[] = [...post.publishedPlatforms];

    for (const platform of body.platforms) {
      // Use platform-specific content if available, otherwise fallback to main content
      const contentToPublish = post.platformContent?.[platform] || post.content;

      const result = await publishToPlatform(
        platform,
        contentToPublish,
        body.userId,
        body.workspaceId
      );

      results.push(result);

      // إذا نجح النشر، أضف للقائمة
      if (result.success && result.postId) {
        publishedPlatforms.push({
          platform,
          postId: result.postId,
          publishedAt: new Date().toISOString(),
          url: result.url,
        });
      }
    }

    // تحديد الحالة النهائية
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    let finalStatus: "published" | "failed" = "published";
    let errorLog = "";

    if (failureCount === results.length) {
      // جميعها فشلت
      finalStatus = "failed";
      errorLog = results.map((r) => `${r.platform}: ${r.error}`).join("; ");
    } else if (failureCount > 0) {
      // بعضها فشل (partial success)
      errorLog = results
        .filter((r) => !r.success)
        .map((r) => `${r.platform}: ${r.error}`)
        .join("; ");
    }

    // تحديث المنشور بالنتائج
    await updatePost(postId, {
      status: finalStatus,
      publishedPlatforms,
      errorLog: errorLog || undefined,
    });

    return NextResponse.json({
      success: successCount > 0,
      message:
        successCount === results.length
          ? "Post published successfully to all platforms"
          : successCount > 0
          ? "Post published with some errors"
          : "Failed to publish post to any platform",
      results,
      published: successCount,
      failed: failureCount,
      total: results.length,
    });
  } catch (error: unknown) {
    console.error("Error publishing post:", error);

    // محاولة تحديث الحالة إلى failed
    try {
      await updatePostStatus(params.id, "failed", {
        errorLog: error instanceof Error ? error.message : "Unknown error",
      });
    } catch (updateError) {
      console.error("Failed to update post status:", updateError);
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to publish post" },
      { status: 500 }
    );
  }
}

/**
 * نشر المنشور على منصة واحدة
 */
async function publishToPlatform(
  platform: PlatformName,
  content: string,
  userId: string,
  workspaceId: string
): Promise<PlatformPublishResult> {
  const platformUrls: Record<PlatformName, string> = {
    linkedin: "/api/linkedin/post",
    twitter: "/api/twitter/post",
    facebook: "/api/facebook/post",
    instagram: "/api/instagram/post",
  };

  const apiUrl = platformUrls[platform];

  try {
    // استدعاء API المنصة
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${apiUrl}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          userId,
          workspaceId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        platform,
        success: false,
        error: data.error || `HTTP ${response.status}`,
      };
    }

    return {
      platform,
      success: true,
      postId: data.postId,
      url: data.url,
    };
  } catch (error: unknown) {
    console.error(`Error publishing to ${platform}:`, error);
    return {
      platform,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
