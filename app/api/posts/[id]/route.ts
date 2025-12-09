import { NextRequest, NextResponse } from "next/server";
import { getPostById, updatePost, deletePost } from "@/lib/appwrite-server";
import { UpdatePostInput, PostStatus } from "@/lib/types";

/**
 * GET /api/posts/[id]
 * جلب منشور واحد بالمعرف
 */
export async function GET(
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

    const post = await getPostById(postId);

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ post });
  } catch (error: unknown) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch post" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/posts/[id]
 * تحديث منشور موجود
 * 
 * Body (جميع الحقول اختيارية):
 * {
 *   content?: string,
 *   topic?: string,
 *   tone?: string,
 *   status?: PostStatus,
 *   scheduledAt?: string,
 *   publishedPlatforms?: PublishedPlatform[],
 *   errorLog?: string,
 *   mediaUrls?: string[],
 *   retryCount?: number,
 *   lastRetryAt?: string
 * }
 */
export async function PATCH(
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

    // التحقق من وجود المنشور
    const existingPost = await getPostById(postId);
    if (!existingPost) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // التحقق من أن هناك على الأقل حقل واحد للتحديث
    if (Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // التحقق من طول المحتوى
    if (body.content && body.content.length > 5000) {
      return NextResponse.json(
        { error: "content must not exceed 5000 characters" },
        { status: 400 }
      );
    }

    // التحقق من صحة status
    if (body.status) {
      const validStatuses: PostStatus[] = [
        "draft",
        "scheduled",
        "publishing",
        "published",
        "failed",
      ];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: "Invalid status value" },
          { status: 400 }
        );
      }
    }

    // التحقق من scheduledAt
    if (body.scheduledAt) {
      const scheduledDate = new Date(body.scheduledAt);
      if (isNaN(scheduledDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid scheduledAt date format" },
          { status: 400 }
        );
      }
    }

    // إنشاء input للتحديث
    const input: UpdatePostInput = {};
    
    // نسخ الحقول المقدمة فقط
    const allowedFields: (keyof UpdatePostInput)[] = [
      "content",
      "topic",
      "tone",
      "status",
      "scheduledAt",
      "publishedPlatforms",
      "errorLog",
      "mediaUrls",
      "retryCount",
      "lastRetryAt",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        input[field] = body[field] as never;
      }
    }

    // تحديث المنشور
    const updatedPost = await updatePost(postId, input);

    return NextResponse.json({
      post: updatedPost,
      message: "Post updated successfully",
    });
  } catch (error: unknown) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update post" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/posts/[id]
 * حذف منشور
 */
export async function DELETE(
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

    // التحقق من وجود المنشور
    const existingPost = await getPostById(postId);
    if (!existingPost) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // التحقق من أن المنشور غير منشور (اختياري)
    // يمكن السماح بحذف المنشورات المنشورة إذا أردت
    if (existingPost.status === "publishing") {
      return NextResponse.json(
        { error: "Cannot delete post while it's being published" },
        { status: 400 }
      );
    }

    // حذف المنشور
    await deletePost(postId);

    return NextResponse.json({
      message: "Post deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete post" },
      { status: 500 }
    );
  }
}
