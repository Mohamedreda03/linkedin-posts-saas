import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import {
  REWRITE_SYSTEM_PROMPT,
  buildRewritePrompt,
  RewriteParams,
} from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, style } = body as RewriteParams;

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Build the rewrite prompt
    const userPrompt = buildRewritePrompt({
      content,
      style: style || "improve",
    });

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      system: REWRITE_SYSTEM_PROMPT,
      prompt: userPrompt,
    });

    return NextResponse.json({
      rewrittenContent: text.trim(),
    });
  } catch (error) {
    console.error("Error rewriting post:", error);
    return NextResponse.json(
      { error: "Failed to rewrite post. Please try again." },
      { status: 500 }
    );
  }
}
