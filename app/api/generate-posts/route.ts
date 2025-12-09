import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import {
  MULTI_PLATFORM_SYSTEM_PROMPT,
  buildUserPrompt,
  GenerationParams,
} from "@/lib/prompts";
import { PlatformContent } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, tone, dialect, length, useEmoji } = body as GenerationParams;

    if (!topic || typeof topic !== "string") {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    // Check if API key exists
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("GOOGLE_GENERATIVE_AI_API_KEY is not set");
      return NextResponse.json(
        { error: "AI service is not configured. Please add GOOGLE_GENERATIVE_AI_API_KEY to environment variables." },
        { status: 500 }
      );
    }

    // Build the user prompt using our prompt engineering system
    const userPrompt = buildUserPrompt({
      topic,
      tone: tone || "professional",
      dialect: dialect || "en-us",
      length: length || "medium",
      useEmoji: useEmoji ?? true,
    });

    console.log("Generating post with topic:", topic);

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      system: MULTI_PLATFORM_SYSTEM_PROMPT,
      prompt: userPrompt,
    });

    console.log("Post generated successfully");

    // Parse the JSON response
    let platformContent: PlatformContent = {};
    try {
      // Clean up the response if it contains markdown code blocks
      const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
      platformContent = JSON.parse(cleanText);
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", text);
      // Fallback: treat the whole text as LinkedIn content if parsing fails
      platformContent = { linkedin: text };
    }

    // Return the generated post
    return NextResponse.json({
      posts: [
        {
          id: 1,
          title: "Generated Post",
          content: platformContent.linkedin || text, // Default to LinkedIn content for backward compatibility
          platformContent: platformContent,
        },
      ],
    });
  } catch (error) {
    console.error("Error generating posts:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to generate posts: ${errorMessage}` },
      { status: 500 }
    );
  }
}
