import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import {
  LINKEDIN_SYSTEM_PROMPT,
  buildUserPrompt,
  GenerationParams,
} from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, tone, dialect, length, useEmoji } = body as GenerationParams;

    if (!topic || typeof topic !== "string") {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    // Build the user prompt using our prompt engineering system
    const userPrompt = buildUserPrompt({
      topic,
      tone: tone || "professional",
      dialect: dialect || "en-us",
      length: length || "medium",
      useEmoji: useEmoji ?? true,
    });

    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      system: LINKEDIN_SYSTEM_PROMPT,
      prompt: userPrompt,
    });

    // Return the generated post
    return NextResponse.json({
      posts: [
        {
          id: 1,
          title: "Generated Post",
          content: text.trim(),
        },
      ],
    });
  } catch (error) {
    console.error("Error generating posts:", error);
    return NextResponse.json(
      { error: "Failed to generate posts. Please check your API key." },
      { status: 500 }
    );
  }
}
