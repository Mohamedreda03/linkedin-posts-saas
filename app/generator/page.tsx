"use client";

import { PostGenerator } from "@/components/post-generator";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

export default function GeneratorPage() {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via AuthContext
  }

  return <PostGenerator />;
}
