import { NextRequest, NextResponse } from "next/server";
import { getPostsByWorkspace, createPost } from "@/lib/appwrite-server";
import { CreatePostInput, PostStatus } from "@/lib/types";

/**
 * GET /api/posts
 * جلب المنشورات مع فلترة وpagination
 * 
 * Query Parameters:
 * - workspaceId (required): معرف الـ workspace
 * - status (optional): فلترة حسب الحالة
 * - limit (optional): عدد النتائج (default: 20)
 * - offset (optional): للـ pagination (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // معرف الـ workspace مطلوب
    const workspaceId = searchParams.get("workspaceId");
    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // معاملات اختيارية
    const status = searchParams.get("status") as PostStatus | null;
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // التحقق من صحة limit
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "limit must be between 1 and 100" },
        { status: 400 }
      );
    }

    // جلب المنشورات
    const result = await getPostsByWorkspace(
      workspaceId,
      status || undefined,
      limit,
      offset
    );

    return NextResponse.json({
      posts: result.posts,
      total: result.total,
      limit,
      offset,
      hasMore: offset + limit < result.total,
    });
  } catch (error: unknown) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/posts
 * إنشاء منشور جديد
 * 
 * Body:
 * {
 *   userId: string (required),
 *   workspaceId: string (required),
 *   content?: string (optional),
 *   topic?: string (optional, default: "Untitled Post"),
 *   tone?: string (optional),
 *   status?: PostStatus (optional, default: "draft"),
 *   scheduledAt?: string (optional),
 *   mediaUrls?: string[] (optional)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // التحقق من الحقول المطلوبة (userId و workspaceId فقط)
    const requiredFields = ["userId", "workspaceId"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // التحقق من طول المحتوى إذا كان موجوداً
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
      // التأكد من أن التاريخ في المستقبل
      if (scheduledDate < new Date()) {
        return NextResponse.json(
          { error: "scheduledAt must be in the future" },
          { status: 400 }
        );
      }
    }

    // إنشاء المنشور
    const input: CreatePostInput = {
      userId: body.userId,
      workspaceId: body.workspaceId,
      content: body.content || "",
      topic: body.topic || "Untitled Post",
      tone: body.tone,
      status: body.status || "draft",
      scheduledAt: body.scheduledAt,
      mediaUrls: body.mediaUrls || [],
    };

    const post = await createPost(input);

    return NextResponse.json(
      { 
        post,
        message: "Post created successfully" 
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create post" },
      { status: 500 }
    );
  }
}
