"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, ChevronDown, Plus, Settings } from "lucide-react";
import Link from "next/link";

interface WorkspaceSelectorProps {
  className?: string;
  showSettings?: boolean;
}

export function WorkspaceSelector({ className, showSettings = true }: WorkspaceSelectorProps) {
  const { workspaces, currentWorkspace, workspacesLoading, switchWorkspace } = useAuth();
  const router = useRouter();

  const handleSwitchWorkspace = (workspaceId: string) => {
    switchWorkspace(workspaceId);
    router.push(`/ws/${workspaceId}`);
  };

  if (workspacesLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <Link href="/onboarding">
        <Button variant="outline" size="sm" className={className}>
          <Plus className="h-4 w-4 mr-2" />
          Create Workspace
        </Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`h-10 px-3 gap-2 font-medium ${className}`}
        >
          <span
            className="w-6 h-6 rounded-md flex items-center justify-center text-sm"
            style={{ backgroundColor: currentWorkspace.color || "#6366f1" }}
          >
            {currentWorkspace.icon || "📁"}
          </span>
          <span className="max-w-[150px] truncate">{currentWorkspace.name}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.$id}
            onClick={() => handleSwitchWorkspace(workspace.$id)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <span
              className="w-6 h-6 rounded-md flex items-center justify-center text-sm flex-shrink-0"
              style={{ backgroundColor: workspace.color || "#6366f1" }}
            >
              {workspace.icon || "📁"}
            </span>
            <span className="flex-1 truncate">{workspace.name}</span>
            {currentWorkspace.$id === workspace.$id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        
        <Link href="/onboarding">
          <DropdownMenuItem className="cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Create New Workspace
          </DropdownMenuItem>
        </Link>
        
        {showSettings && currentWorkspace && (
          <Link href={`/ws/${currentWorkspace.$id}/settings`}>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="h-4 w-4 mr-2" />
              Workspace Settings
            </DropdownMenuItem>
          </Link>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact version for headers
export function WorkspaceSelectorCompact({ className }: { className?: string }) {
  const { currentWorkspace, workspacesLoading, workspaces, switchWorkspace } = useAuth();
  const router = useRouter();

  const handleSwitchWorkspace = (workspaceId: string) => {
    switchWorkspace(workspaceId);
    router.push(`/ws/${workspaceId}`);
  };

  if (workspacesLoading) {
    return <Skeleton className="h-8 w-8 rounded-md" />;
  }

  if (!currentWorkspace) {
    return null;
  }

  if (workspaces.length === 1) {
    return (
      <div
        className={`w-8 h-8 rounded-md flex items-center justify-center text-sm ${className}`}
        style={{ backgroundColor: currentWorkspace.color || "#6366f1" }}
        title={currentWorkspace.name}
      >
        {currentWorkspace.icon || "📁"}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`w-8 h-8 rounded-md p-0 ${className}`}
          style={{ backgroundColor: currentWorkspace.color || "#6366f1" }}
          title={currentWorkspace.name}
        >
          <span className="text-sm">{currentWorkspace.icon || "📁"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Switch Workspace</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.$id}
            onClick={() => handleSwitchWorkspace(workspace.$id)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span
              className="w-5 h-5 rounded flex items-center justify-center text-xs flex-shrink-0"
              style={{ backgroundColor: workspace.color || "#6366f1" }}
            >
              {workspace.icon || "📁"}
            </span>
            <span className="flex-1 truncate text-sm">{workspace.name}</span>
            {currentWorkspace.$id === workspace.$id && (
              <Check className="h-3 w-3 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
