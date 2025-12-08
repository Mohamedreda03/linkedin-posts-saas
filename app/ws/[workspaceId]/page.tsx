"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { getPosts } from "@/lib/api";
import { DataTable } from "@/components/dashboard/data-table";
import { columns } from "@/components/dashboard/columns";
import { UserNav } from "@/components/dashboard/user-nav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Loader2, Plus, LayoutGrid, List, PenTool, ChevronsUpDown, Check, Settings } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { WORKSPACE_ICONS, WORKSPACE_COLORS } from "@/lib/constants/workspace";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function WorkspaceDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  
  const { user, loading: authLoading, workspaces, currentWorkspace, setCurrentWorkspaceById, workspacesLoading, refreshWorkspaces } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [queryTerm, setQueryTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  
  // Create workspace dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("💼");
  const [selectedColor, setSelectedColor] = useState("#3B82F6");
  const [isCreating, setIsCreating] = useState(false);

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

  const {
    data: posts,
    isLoading: isPostsLoading,
    isError,
  } = useQuery({
    queryKey: ["posts", user?.$id, queryTerm, statusFilter, workspaceId],
    queryFn: () =>
      getPosts(
        user!.$id,
        queryTerm,
        statusFilter === "all" ? undefined : statusFilter,
        workspaceId
      ),
    enabled: !!user && !!workspaceId,
  });

  const isLoading = authLoading || isPostsLoading || workspacesLoading;

  const handleSearch = () => {
    setQueryTerm(searchInput);
  };

  const handleSwitchWorkspace = (newWorkspaceId: string) => {
    setWorkspaceOpen(false);
    router.push(`/ws/${newWorkspaceId}`);
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      toast.error("Please enter a workspace name");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newWorkspaceName.trim(),
          ownerId: user?.$id,
          icon: selectedIcon,
          color: selectedColor,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to create workspace");
      }

      await refreshWorkspaces();
      setCreateDialogOpen(false);
      setNewWorkspaceName("");
      setSelectedIcon("💼");
      setSelectedColor("#3B82F6");
      toast.success("Workspace created successfully!");
      
      // Navigate to new workspace
      router.push(`/ws/${data.workspace.$id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create workspace");
    } finally {
      setIsCreating(false);
    }
  };

  // Show loading while checking workspace
  if (workspacesLoading || (!currentWorkspace && workspaces.length > 0)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-900" />
          <p className="text-zinc-500 font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-10 space-y-8">
        {/* Header Section */}
        <div className="space-y-6">
          {/* Top Row: Search & Actions */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Left: Search */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-[400px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Search by topic or content..."
                  className="pl-10 h-11 bg-zinc-50 border-zinc-200 focus:border-zinc-900 focus:ring-0 transition-all rounded-lg font-medium"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button
                onClick={handleSearch}
                className="h-11 px-6 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-medium transition-all"
              >
                Search
              </Button>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-end">
              <Link href={`/ws/${workspaceId}/compose`}>
                <Button className="h-11 px-6 bg-white border-2 border-zinc-900 text-zinc-900 hover:bg-zinc-50 hover:text-zinc-900 rounded-lg font-bold tracking-wide transition-all shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] hover:translate-x-[2px] hover:translate-y-[2px]">
                  <PenTool className="w-4 h-4 mr-2" />
                  CREATE POST
                </Button>
              </Link>
              <UserNav />
            </div>
          </div>

          {/* Bottom Row: Filter Switch & Workspace Selector */}
          <div className="flex items-center justify-between">
            <Tabs
              value={statusFilter}
              onValueChange={setStatusFilter}
              className="w-auto"
            >
              <TabsList className="h-10 bg-zinc-100 p-1 rounded-lg flex gap-1">
                <TabsTrigger
                  value="all"
                  className="rounded-md px-6 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm transition-all"
                >
                  All Posts
                </TabsTrigger>
                <TabsTrigger
                  value="published"
                  className="rounded-md px-6 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm transition-all"
                >
                  Published
                </TabsTrigger>
                <TabsTrigger
                  value="draft"
                  className="rounded-md px-6 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm transition-all"
                >
                  Drafts
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Workspace Selector Combobox */}
            <Popover open={workspaceOpen} onOpenChange={setWorkspaceOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={workspaceOpen}
                  className="w-[250px] justify-between h-10 border-zinc-200 bg-white hover:bg-zinc-50"
                  disabled={workspacesLoading}
                >
                  {currentWorkspace ? (
                    <div className="flex items-center gap-2">
                      <span
                        className="w-5 h-5 rounded flex items-center justify-center text-xs shrink-0"
                        style={{ backgroundColor: `${currentWorkspace.color}20` }}
                      >
                        {currentWorkspace.icon}
                      </span>
                      <span className="truncate">{currentWorkspace.name}</span>
                    </div>
                  ) : (
                    <span className="text-zinc-500">Select workspace...</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[250px] p-0" align="end">
                <Command>
                  <CommandInput placeholder="Search workspace..." />
                  <CommandList>
                    <CommandEmpty>No workspace found.</CommandEmpty>
                    <CommandGroup>
                      {workspaces.map((workspace) => (
                        <CommandItem
                          key={workspace.$id}
                          value={workspace.name}
                          onSelect={() => handleSwitchWorkspace(workspace.$id)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <span
                              className="w-5 h-5 rounded flex items-center justify-center text-xs shrink-0"
                              style={{ backgroundColor: `${workspace.color}20` }}
                            >
                              {workspace.icon}
                            </span>
                            <span className="truncate">{workspace.name}</span>
                          </div>
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              workspaceId === workspace.$id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                  <CommandSeparator />
                  <div className="p-1 space-y-1">
                    <Link href={`/ws/${workspaceId}/settings`}>
                      <button
                        onClick={() => setWorkspaceOpen(false)}
                        className="w-full flex items-center gap-2 text-zinc-600 px-2 py-1.5 text-sm rounded-sm hover:bg-zinc-100 cursor-pointer"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Workspace Settings</span>
                      </button>
                    </Link>
                    <button
                      onClick={() => {
                        setWorkspaceOpen(false);
                        setCreateDialogOpen(true);
                      }}
                      className="w-full flex items-center gap-2 text-primary px-2 py-1.5 text-sm rounded-sm hover:bg-zinc-100 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create new workspace</span>
                    </button>
                  </div>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Create Workspace Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Workspace</DialogTitle>
                  <DialogDescription>
                    Create a new workspace to organize your social media presence.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {/* Workspace Name */}
                  <div className="space-y-2">
                    <Label htmlFor="workspace-name">Workspace Name</Label>
                    <Input
                      id="workspace-name"
                      placeholder="e.g., My Personal Brand"
                      value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      disabled={isCreating}
                    />
                  </div>

                  {/* Icon Selection */}
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <div className="flex flex-wrap gap-2">
                      {WORKSPACE_ICONS.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setSelectedIcon(icon)}
                          className={cn(
                            "w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all",
                            selectedIcon === icon
                              ? "bg-primary/10 ring-2 ring-primary ring-offset-1"
                              : "bg-zinc-100 hover:bg-zinc-200"
                          )}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex flex-wrap gap-2">
                      {WORKSPACE_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={cn(
                            "w-7 h-7 rounded-full transition-all",
                            selectedColor === color
                              ? "ring-2 ring-offset-2 ring-zinc-400 scale-110"
                              : "hover:scale-105"
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="p-3 bg-zinc-50 rounded-lg">
                    <Label className="text-xs text-zinc-500 mb-2 block">Preview</Label>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                        style={{ backgroundColor: `${selectedColor}20` }}
                      >
                        {selectedIcon}
                      </span>
                      <span className="font-medium">
                        {newWorkspaceName || "Your Workspace"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateWorkspace}
                    disabled={isCreating || !newWorkspaceName.trim()}
                  >
                    {isCreating ? (
                      <>
                        <Spinner className="h-4 w-4 mr-2" />
                        Creating...
                      </>
                    ) : (
                      "Create Workspace"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white border border-zinc-100 rounded-xl shadow-sm overflow-hidden min-h-[500px]">
          {isLoading ? (
            <div className="h-[500px] flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-900" />
              <p className="text-zinc-500 font-medium">Loading your posts...</p>
            </div>
          ) : isError ? (
            <div className="h-[500px] flex flex-col items-center justify-center text-center p-8">
              <div className="h-12 w-12 bg-red-50 rounded-lg flex items-center justify-center mb-4 border border-red-100">
                <LayoutGrid className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-1">
                Unable to load posts
              </h3>
              <p className="text-zinc-500 max-w-xs mx-auto mb-6">
                Connection issue detected. Please try again.
              </p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="rounded-lg border-zinc-200"
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="relative">
              {posts && posts.length === 0 ? (
                <div className="h-[400px] flex flex-col items-center justify-center text-center p-8">
                  <div className="h-16 w-16 bg-zinc-50 rounded-xl flex items-center justify-center mb-6 border border-zinc-100">
                    <List className="h-8 w-8 text-zinc-400" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-2">
                    No posts yet
                  </h3>
                  <p className="text-zinc-500 max-w-sm mx-auto mb-8">
                    Your dashboard is empty. Create your first high-impact
                    LinkedIn post now.
                  </p>
                  <Link href="/generator">
                    <Button
                      size="lg"
                      className="rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-semibold"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Start Creating
                    </Button>
                  </Link>
                </div>
              ) : (
                <DataTable columns={columns} data={posts || []} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
