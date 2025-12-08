"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export const CTASection = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section ref={ref} className="py-32 px-6 relative overflow-hidden">
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
          <Link href="/auth/sign-in">
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
  );
});

CTASection.displayName = "CTASection";
