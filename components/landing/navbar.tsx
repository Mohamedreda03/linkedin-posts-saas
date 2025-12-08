"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
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
  );
}
