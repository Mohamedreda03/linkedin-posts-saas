"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowRight,
  Sparkles,
  ThumbsUp,
  MessageSquare,
  Repeat,
  Send,
  MoreHorizontal,
  Globe,
} from "lucide-react";

export const HeroSection = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section ref={ref} className="pt-32 pb-20 px-6 relative">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-background to-background dark:from-blue-900/20 dark:via-background dark:to-background opacity-50"></div>
      <div className="container mx-auto text-center max-w-4xl">
        <div className="hero-text inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          <span>AI-Powered LinkedIn Growth</span>
        </div>
        <h1 className="hero-text text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent pb-2">
          Craft Viral LinkedIn Posts in Seconds
        </h1>
        <p className="hero-text text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Stop staring at a blank screen. Use our advanced AI to generate
          engaging, professional content that grows your audience and builds
          your personal brand.
        </p>
        <div className="hero-text flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/auth/sign-in">
            <Button
              size="lg"
              className="h-12 px-8 text-lg rounded-full group"
            >
              Start Writing for Free
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            className="h-12 px-8 text-lg rounded-full"
          >
            View Examples
          </Button>
        </div>

        {/* Hero Image / Preview Placeholder */}
        <div className="hero-image mt-16 relative mx-auto max-w-2xl rounded-xl border bg-card text-card-foreground shadow-2xl overflow-hidden text-left">
          {/* LinkedIn Post Header */}
          <div className="p-4 flex gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-semibold text-sm hover:text-blue-600 hover:underline cursor-pointer">
                    Sarah Jenkins
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Growth Marketing Manager | AI Enthusiast
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <span>2h</span>
                    <span>•</span>
                    <Globe className="w-3 h-3" />
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="px-4 pb-2">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              🚀 Just discovered an incredible way to boost LinkedIn
              engagement using AI!
              <br />
              <br />
              I used to spend hours crafting the perfect post, but now I can
              generate viral-worthy content in seconds. The key is to focus on
              storytelling and authentic value.
              <br />
              <br />
              Here are 3 tips I learned:
              <br />
              1️⃣ Start with a strong hook
              <br />
              2️⃣ Use short, punchy paragraphs
              <br />
              3️⃣ End with a clear call to action
              <br />
              <br />
              Has anyone else tried using AI for their personal brand? Let me
              know in the comments! 👇
              <br />
              <br />
              <span className="text-blue-600 hover:underline cursor-pointer">
                #LinkedInGrowth
              </span>{" "}
              <span className="text-blue-600 hover:underline cursor-pointer">
                #AI
              </span>{" "}
              <span className="text-blue-600 hover:underline cursor-pointer">
                #PersonalBranding
              </span>
            </p>
          </div>

          {/* Engagement Stats */}
          <div className="px-4 py-2 flex items-center justify-between text-xs text-muted-foreground border-b">
            <div className="flex items-center gap-1">
              <div className="flex -space-x-1">
                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center z-20 ring-2 ring-background">
                  <ThumbsUp className="w-2.5 h-2.5 text-white fill-current" />
                </div>
                <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center z-10 ring-2 ring-background">
                  <span className="text-[8px] text-white">❤️</span>
                </div>
                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center ring-2 ring-background">
                  <span className="text-[8px] text-white">👏</span>
                </div>
              </div>
              <span className="ml-1 hover:text-blue-600 hover:underline cursor-pointer">
                1,245
              </span>
            </div>
            <div className="flex gap-2">
              <span className="hover:text-blue-600 hover:underline cursor-pointer">
                84 comments
              </span>
              <span>•</span>
              <span className="hover:text-blue-600 hover:underline cursor-pointer">
                12 reposts
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-2 py-1 flex items-center justify-between">
            <Button
              variant="ghost"
              className="flex-1 gap-2 text-muted-foreground hover:bg-muted/50"
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="font-semibold text-sm">Like</span>
            </Button>
            <Button
              variant="ghost"
              className="flex-1 gap-2 text-muted-foreground hover:bg-muted/50"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="font-semibold text-sm">Comment</span>
            </Button>
            <Button
              variant="ghost"
              className="flex-1 gap-2 text-muted-foreground hover:bg-muted/50"
            >
              <Repeat className="w-4 h-4" />
              <span className="font-semibold text-sm">Repost</span>
            </Button>
            <Button
              variant="ghost"
              className="flex-1 gap-2 text-muted-foreground hover:bg-muted/50"
            >
              <Send className="w-4 h-4" />
              <span className="font-semibold text-sm">Send</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = "HeroSection";
