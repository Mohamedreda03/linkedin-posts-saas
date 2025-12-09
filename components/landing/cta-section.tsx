"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTASection() {
  const { user, currentWorkspace } = useAuth();

  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-purple-600 p-12 text-center">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 mb-6">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Start your free trial today</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your
              <br />
              Social Media Presence?
            </h2>

            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Join thousands of content creators who are already using PostCraft AI
              to create engaging posts and grow their audience.
            </p>

            {user ? (
              <Link href={currentWorkspace ? `/ws/${currentWorkspace.$id}` : "/onboarding"}>
                <Button size="lg" variant="secondary" className="gap-2">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/sign-up">
                <Button size="lg" variant="secondary" className="gap-2">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            )}

            <p className="text-sm text-white/60 mt-4">
              No credit card required • 10 free posts every month
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
