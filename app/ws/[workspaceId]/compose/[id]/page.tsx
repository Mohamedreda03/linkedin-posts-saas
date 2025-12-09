"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PostGenerator } from "@/components/post-generator";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

export default function PostEditorPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  const postId = params.id as string;
  
  const { loading, user, workspaces, workspacesLoading, setCurrentWorkspaceById } = useAuth();

  // Set current workspace from URL param
  useEffect(() => {
    if (workspaceId && workspaces.length > 0 && !workspacesLoading) {
      const exists = workspaces.find(w => w.$id === workspaceId);
      if (exists) {
        setCurrentWorkspaceById(workspaceId);
      } else {
        // Workspace not found, redirect to first workspace or onboarding
        if (workspaces.length > 0) {
          router.replace(`/ws/${workspaces[0].$id}`);
        } else {
          router.replace("/onboarding");
        }
      }
    }
  }, [workspaceId, workspaces, workspacesLoading, setCurrentWorkspaceById, router]);

  if (loading || workspacesLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-zinc-500 font-medium">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via AuthContext
  }

  // Validate postId
  if (!postId) {
    router.replace(`/ws/${workspaceId}`);
    return null;
  }

  return <PostGenerator postId={postId} />;
}
