"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Layout,
  Share2,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  Repeat,
  Send,
  MoreHorizontal,
  Globe,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Hero Animation
      const tl = gsap.timeline();
      tl.from(".hero-text", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
      }).from(
        ".hero-image",
        {
          y: 30,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
        },
        "-=0.5"
      );

      // Features Animation
      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
      });

      // How It Works Animation
      gsap.from(".step-item", {
        scrollTrigger: {
          trigger: howItWorksRef.current,
          start: "top 75%",
        },
        x: -50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.3,
        ease: "power3.out",
      });

      // Stats Animation
      gsap.from(".stat-item", {
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 85%",
        },
        scale: 0.8,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(1.7)",
      });

      // CTA Animation
      gsap.from(ctaRef.current, {
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 80%",
        },
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-background text-foreground overflow-hidden"
    >
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            LinkedInGen
          </div>
          <div className="flex gap-4">
            <Link href="/auth/sign-in">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button variant="default" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Section 1: Hero */}
      <section ref={heroRef} className="pt-32 pb-20 px-6 relative">
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
            <Link href="/generator">
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

      {/* Section 2: Features */}
      <section ref={featuresRef} className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to go viral
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed to help you create content that resonates
              with your network.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-6 h-6 text-yellow-500" />,
                title: "Instant Generation",
                description:
                  "Generate high-quality posts from just a few keywords or a topic idea in seconds.",
              },
              {
                icon: <Layout className="w-6 h-6 text-blue-500" />,
                title: "Perfect Formatting",
                description:
                  "Get posts formatted specifically for LinkedIn's algorithm with proper spacing and hooks.",
              },
              {
                icon: <Share2 className="w-6 h-6 text-green-500" />,
                title: "Engagement Optimized",
                description:
                  "AI models trained on viral posts to maximize likes, comments, and shares.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="feature-card p-8 rounded-2xl bg-background border hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-background border shadow-sm flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: How It Works */}
      <section ref={howItWorksRef} className="py-24 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                From idea to published post in 3 steps
              </h2>
              <div className="space-y-8">
                {[
                  {
                    step: "01",
                    title: "Enter your topic",
                    desc: "Briefly describe what you want to post about.",
                  },
                  {
                    step: "02",
                    title: "Customize tone",
                    desc: "Choose from professional, casual, or storytelling styles.",
                  },
                  {
                    step: "03",
                    title: "Copy & Post",
                    desc: "Review the generated content and post directly to LinkedIn.",
                  },
                ].map((item, i) => (
                  <div key={i} className="step-item flex gap-6">
                    <div className="text-4xl font-bold text-blue-100 dark:text-blue-900/50">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-[500px] bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-1 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="h-full w-full bg-background rounded-xl overflow-hidden relative">
                {/* Abstract UI representation */}
                <div className="absolute top-0 left-0 w-full h-12 border-b bg-muted/50 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="p-8 pt-20 space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-32 bg-muted/30 rounded w-full mt-8"></div>
                  <div className="flex justify-end mt-4">
                    <div className="h-10 w-24 bg-blue-600 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Stats / Social Proof */}
      <section ref={statsRef} className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10k+", label: "Posts Generated" },
              { number: "500+", label: "Happy Users" },
              { number: "1M+", label: "Views Generated" },
              { number: "4.9/5", label: "User Rating" },
            ].map((stat, i) => (
              <div key={i} className="stat-item">
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  {stat.number}
                </div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: CTA */}
      <section ref={ctaRef} className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100/50 via-background to-background dark:from-blue-900/20"></div>
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to grow your LinkedIn presence?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join hundreds of professionals who are saving time and building
            their brand with our AI tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/generator">
              <Button
                size="lg"
                className="h-14 px-10 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
              >
                Get Started for Free
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> No credit card
              required
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> Free tier
              available
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-muted/10">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} LinkedInGen. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
