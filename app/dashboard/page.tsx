"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Spinner } from "@/components/ui/spinner";

// Redirect from old /dashboard to new /ws/[workspaceId]
export default function DashboardRedirectPage() {
  const { currentWorkspace, workspaces, workspacesLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (workspacesLoading) return;

    if (currentWorkspace) {
      router.replace(`/ws/${currentWorkspace.$id}`);
    } else if (workspaces && workspaces.length > 0) {
      router.replace(`/ws/${workspaces[0].$id}`);
    } else {
      router.replace("/onboarding");
    }
  }, [workspacesLoading, workspaces, currentWorkspace, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
