"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { SocialPlatform } from "@/lib/appwrite";
import { WORKSPACE_ICONS, WORKSPACE_COLORS } from "@/lib/constants/workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Linkedin, 
  Twitter, 
  Facebook, 
  Instagram, 
  Trash2,
  ArrowLeft,
  Loader2,
  Save,
  Globe,
  Layout,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

interface SocialAccountPublic {
  $id: string;
  $createdAt: string;
  userId: string;
  platform: SocialPlatform;
  platformUserId: string;
  accountName: string;
  accountEmail?: string;
  accountImage?: string;
}

const platformIcons: Record<SocialPlatform, React.ReactNode> = {
  linkedin: <Linkedin className="h-5 w-5" />,
  twitter: <Twitter className="h-5 w-5" />,
  facebook: <Facebook className="h-5 w-5" />,
  instagram: <Instagram className="h-5 w-5" />,
};

const platformLabels: Record<SocialPlatform, string> = {
  linkedin: "LinkedIn",
  twitter: "Twitter / X",
  facebook: "Facebook",
  instagram: "Instagram",
};

async function fetchAccounts(workspaceId: string): Promise<SocialAccountPublic[]> {
  const res = await fetch(`/api/accounts?workspaceId=${workspaceId}`);
  if (!res.ok) throw new Error("Failed to fetch accounts");
  const data = await res.json();
  return data.accounts;
}

async function deleteAccount(accountId: string, userId: string, workspaceId: string): Promise<void> {
  const res = await fetch(`/api/accounts?accountId=${accountId}&userId=${userId}&workspaceId=${workspaceId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to disconnect account");
}

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  
  const { user, loading: authLoading, workspaces, currentWorkspace, setCurrentWorkspaceById, workspacesLoading, refreshWorkspaces } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  
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
  
  // Account deletion dialog
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<SocialAccountPublic | null>(null);
  
  // Workspace deletion dialog
  const [deleteWorkspaceDialogOpen, setDeleteWorkspaceDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeletingWorkspace, setIsDeletingWorkspace] = useState(false);
  
  // Workspace edit state
  const [workspaceName, setWorkspaceName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("💼");
  const [selectedColor, setSelectedColor] = useState("#3B82F6");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize edit state from current workspace
  useEffect(() => {
    if (currentWorkspace) {
      setWorkspaceName(currentWorkspace.name);
      setSelectedIcon(currentWorkspace.icon || "💼");
      setSelectedColor(currentWorkspace.color || "#3B82F6");
      setHasChanges(false);
    }
  }, [currentWorkspace]);

  // Track changes
  useEffect(() => {
    if (currentWorkspace) {
      const changed = 
        workspaceName !== currentWorkspace.name ||
        selectedIcon !== (currentWorkspace.icon || "💼") ||
        selectedColor !== (currentWorkspace.color || "#3B82F6");
      setHasChanges(changed);
    }
  }, [workspaceName, selectedIcon, selectedColor, currentWorkspace]);

  // Show success/error messages from OAuth callback
  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success) {
      toast.success(success);
      queryClient.invalidateQueries({ queryKey: ["socialAccounts"] });
      window.history.replaceState({}, "", `/ws/${workspaceId}/settings`);
    }

    if (error) {
      toast.error(error);
      window.history.replaceState({}, "", `/ws/${workspaceId}/settings`);
    }
  }, [searchParams, queryClient, workspaceId]);

  const { data: accounts, isLoading: isAccountsLoading } = useQuery({
    queryKey: ["socialAccounts", workspaceId],
    queryFn: () => fetchAccounts(workspaceId),
    enabled: !!workspaceId,
  });

  const deleteMutation = useMutation({
    mutationFn: ({ accountId, userId, workspaceId }: { accountId: string; userId: string; workspaceId: string }) =>
      deleteAccount(accountId, userId, workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["socialAccounts"] });
      toast.success("Account disconnected successfully");
      setDeleteAccountDialogOpen(false);
      setAccountToDelete(null);
    },
    onError: () => {
      toast.error("Failed to disconnect account");
    },
  });

  const isLoading = authLoading || isAccountsLoading || workspacesLoading;

  const handleConnectLinkedIn = () => {
    if (!user || !workspaceId) return;
    window.location.href = `/api/auth/link/linkedin?userId=${user.$id}&workspaceId=${workspaceId}`;
  };

  const handleConnectTwitter = () => {
    if (!user || !workspaceId) return;
    window.location.href = `/api/auth/link/twitter?userId=${user.$id}&workspaceId=${workspaceId}`;
  };

  const handleConnectFacebook = () => {
    if (!user || !workspaceId) return;
    window.location.href = `/api/auth/link/facebook?userId=${user.$id}&workspaceId=${workspaceId}`;
  };

  const handleConnectInstagram = () => {
    if (!user || !workspaceId) return;
    window.location.href = `/api/auth/link/instagram?userId=${user.$id}&workspaceId=${workspaceId}`;
  };

  const handleDeleteAccountClick = (account: SocialAccountPublic) => {
    setAccountToDelete(account);
    setDeleteAccountDialogOpen(true);
  };

  const handleConfirmDeleteAccount = () => {
    if (!accountToDelete || !user) return;
    deleteMutation.mutate({ 
      accountId: accountToDelete.$id, 
      userId: user.$id,
      workspaceId: workspaceId 
    });
  };

  const handleSaveWorkspace = async () => {
    if (!workspaceId || !workspaceName.trim()) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workspaceName.trim(),
          icon: selectedIcon,
          color: selectedColor,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update workspace");
      }

      await refreshWorkspaces();
      setHasChanges(false);
      toast.success("Workspace updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update workspace");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!currentWorkspace || deleteConfirmText !== currentWorkspace.name) return;

    setIsDeletingWorkspace(true);
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete workspace");
      }

      await refreshWorkspaces();
      toast.success("Workspace deleted successfully");
      
      // Navigate to first available workspace or onboarding
      const remainingWorkspaces = workspaces.filter(w => w.$id !== workspaceId);
      if (remainingWorkspaces.length > 0) {
        router.push(`/ws/${remainingWorkspaces[0].$id}`);
      } else {
        router.push("/onboarding");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete workspace");
    } finally {
      setIsDeletingWorkspace(false);
      setDeleteWorkspaceDialogOpen(false);
    }
  };

  // Check which platforms are connected
  const connectedPlatforms = new Set(accounts?.map(a => a.platform) || []);

  const availablePlatforms = [
    { 
      platform: "linkedin" as SocialPlatform, 
      label: "LinkedIn",
      description: "Connect your personal profile or company page.",
      icon: <Linkedin className="h-5 w-5 text-[#0A66C2]" />,
      handler: handleConnectLinkedIn 
    },
    { 
      platform: "twitter" as SocialPlatform, 
      label: "Twitter / X",
      description: "Post tweets and threads directly.",
      icon: <Twitter className="h-5 w-5 text-black" />,
      handler: handleConnectTwitter 
    },
    { 
      platform: "facebook" as SocialPlatform, 
      label: "Facebook",
      description: "Share updates to your pages.",
      icon: <Facebook className="h-5 w-5 text-[#1877F2]" />,
      handler: handleConnectFacebook 
    },
    { 
      platform: "instagram" as SocialPlatform, 
      label: "Instagram",
      description: "Publish photos and captions.",
      icon: <Instagram className="h-5 w-5 text-[#E4405F]" />,
      handler: handleConnectInstagram 
    },
  ];

  // Show skeleton while loading
  if (authLoading || workspacesLoading || !currentWorkspace) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto p-6 lg:p-10 space-y-10">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Separator />
          <div className="space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="flex gap-3">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-10 rounded-lg" />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-10 pb-20">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Link href={`/ws/${workspaceId}`} className="text-zinc-500 hover:text-zinc-900 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="text-zinc-300">/</span>
            <span className="text-zinc-500 font-medium">Settings</span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">Workspace Settings</h1>
              <p className="text-zinc-500 text-lg">Manage your workspace preferences and connected accounts.</p>
            </div>
            {hasChanges && (
              <Button 
                onClick={handleSaveWorkspace} 
                disabled={isSaving}
                className="bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-200 w-full sm:w-auto"
              >
                {isSaving ? <Spinner className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-12">
          {/* General Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-zinc-900 font-semibold text-lg">
              <Layout className="h-5 w-5" />
              <h2>General</h2>
            </div>
            <Separator />
            
            <div className="grid gap-8">
              <div className="grid gap-3">
                <Label htmlFor="name" className="text-base">Workspace Name</Label>
                <Input
                  id="name"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="max-w-md h-11 text-base"
                  placeholder="e.g. Personal Brand"
                />
                <p className="text-sm text-zinc-500">This is the name visible in your dashboard.</p>
              </div>

              <div className="grid gap-3">
                <Label className="text-base">Workspace Icon</Label>
                <div className="flex flex-wrap gap-2">
                  {WORKSPACE_ICONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setSelectedIcon(icon)}
                      className={cn(
                        "w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all border",
                        selectedIcon === icon
                          ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900"
                          : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3">
                <Label className="text-base">Theme Color</Label>
                <div className="flex flex-wrap gap-3">
                  {WORKSPACE_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "w-8 h-8 rounded-full transition-all ring-offset-2",
                        selectedColor === color
                          ? "ring-2 ring-zinc-900 scale-110"
                          : "hover:scale-110 ring-1 ring-transparent hover:ring-zinc-200"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Integrations Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-zinc-900 font-semibold text-lg">
              <Globe className="h-5 w-5" />
              <h2>Integrations</h2>
            </div>
            <Separator />

            <div className="space-y-6">
              {/* Connected Accounts List */}
              {accounts && accounts.length > 0 && (
                <div className="grid gap-4">
                  <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Connected Accounts</h3>
                  <div className="grid gap-3">
                    {accounts.map((account) => (
                      <div 
                        key={account.$id} 
                        className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar className="h-10 w-10 border border-zinc-100">
                              <AvatarImage src={account.accountImage} />
                              <AvatarFallback>{account.accountName[0]}</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-zinc-100">
                              {platformIcons[account.platform]}
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-zinc-900">{account.accountName}</p>
                            <p className="text-sm text-zinc-500 capitalize">{platformLabels[account.platform]}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAccountClick(account)}
                          className="text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        >
                          Disconnect
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Platforms */}
              <div className="grid gap-4">
                <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Available Platforms</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {availablePlatforms.map((item) => {
                    const isConnected = connectedPlatforms.has(item.platform);
                    if (isConnected) return null;

                    return (
                      <button
                        key={item.platform}
                        onClick={item.handler}
                        className="flex items-start gap-4 p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-white hover:border-zinc-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div className="mt-1 p-2 bg-white rounded-lg border border-zinc-100 shadow-sm group-hover:scale-105 transition-transform">
                          {item.icon}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900">{item.label}</p>
                          <p className="text-sm text-zinc-500 leading-relaxed mt-1">{item.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="space-y-6 pt-10">
            <div className="flex items-center gap-2 text-red-600 font-semibold text-lg">
              <ShieldAlert className="h-5 w-5" />
              <h2>Danger Zone</h2>
            </div>
            <Separator className="bg-red-100" />
            
            <div className="rounded-xl border border-red-100 bg-red-50/30 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-medium text-red-900">Delete Workspace</h3>
                  <p className="text-sm text-red-700/80">
                    Permanently delete this workspace and all its data. This action cannot be undone.
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={() => setDeleteWorkspaceDialogOpen(true)}
                  className="bg-red-600 hover:bg-red-700 text-white shadow-sm shrink-0 w-full sm:w-auto"
                >
                  Delete Workspace
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={deleteAccountDialogOpen} onOpenChange={setDeleteAccountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect <strong>{accountToDelete?.accountName}</strong>? 
              Scheduled posts for this account may fail.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAccountDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDeleteAccount}>Disconnect</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteWorkspaceDialogOpen} onOpenChange={setDeleteWorkspaceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workspace</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Please type <strong>{currentWorkspace?.name}</strong> to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type workspace name to confirm"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDeleteWorkspaceDialogOpen(false);
              setDeleteConfirmText("");
            }}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteWorkspace}
              disabled={deleteConfirmText !== currentWorkspace?.name || isDeletingWorkspace}
            >
              {isDeletingWorkspace ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Delete Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
