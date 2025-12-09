"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

export default function ComposeIndexPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  
  const { loading, user, currentWorkspace } = useAuth();

  useEffect(() => {
    async function createNewPost() {
      if (!user || !currentWorkspace || loading) return;

      try {
        // Create new post with default title only
        const response = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.$id,
            workspaceId: currentWorkspace.$id,
            content: "",
            topic: "Untitled Post",
            tone: "professional",
            status: "draft",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create post");
        }

        const data = await response.json();
        const postId = data.post.$id;
        
        // Redirect to the new post
        router.replace(`/ws/${workspaceId}/compose/${postId}`);
      } catch (error) {
        console.error("Error creating post:", error);
        // Fallback to dashboard if post creation fails
        router.replace(`/ws/${workspaceId}`);
      }
    }
    
    createNewPost();
  }, [user, currentWorkspace, loading, router, workspaceId]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-zinc-500 font-medium">Creating new post...</p>
      </div>
    </div>
  );
}
