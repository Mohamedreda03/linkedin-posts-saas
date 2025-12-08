"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Spinner } from "@/components/ui/spinner";

export default function GeneratorRedirectPage() {
  const router = useRouter();
  const { currentWorkspace, workspaces, workspacesLoading } = useAuth();

  useEffect(() => {
    if (workspacesLoading) return;

    // If user has a current workspace, redirect to compose
    if (currentWorkspace) {
      router.replace(`/ws/${currentWorkspace.$id}/compose`);
      return;
    }

    // If user has workspaces but no current, use first one
    if (workspaces && workspaces.length > 0) {
      router.replace(`/ws/${workspaces[0].$id}/compose`);
      return;
    }

    // No workspaces, redirect to onboarding
    router.replace("/onboarding");
  }, [currentWorkspace, workspaces, workspacesLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
