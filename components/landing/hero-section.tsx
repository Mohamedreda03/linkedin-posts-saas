"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Play } from "lucide-react";

export function HeroSection() {
  const { user, currentWorkspace } = useAuth();

  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">AI-Powered Content Creation</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
          Create Engaging
          <span className="block bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Social Media Posts
          </span>
          in Seconds
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Generate professional, engaging content for LinkedIn, Twitter, Facebook, and Instagram.
          Let AI help you grow your social presence effortlessly.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {user ? (
            <Link href={currentWorkspace ? `/ws/${currentWorkspace.$id}` : "/onboarding"}>
              <Button size="lg" className="gap-2 px-8">
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-up">
                <Button size="lg" className="gap-2 px-8">
                  <Zap className="w-4 h-4" />
                  Start Free Trial
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="gap-2">
                <Play className="w-4 h-4" />
                Watch Demo
              </Button>
            </>
          )}
        </div>

        {/* Social Proof */}
        <div className="mt-16 flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">Trusted by 10,000+ content creators</p>
          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 border-2 border-background flex items-center justify-center text-xs font-medium"
              >
                {String.fromCharCode(64 + i)}
              </div>
            ))}
            <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-xs font-medium text-primary">
              +5k
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
