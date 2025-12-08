"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { PLATFORM_CONFIG, SocialPlatform } from "@/lib/appwrite";
import { WORKSPACE_ICONS, WORKSPACE_COLORS } from "@/lib/constants/workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  Plus, 
  Trash2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Check,
  Link2,
  Palette,
  AlertTriangle,
  Save,
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

  const availablePlatforms: { platform: SocialPlatform; available: boolean }[] = [
    { platform: "linkedin", available: true },
    { platform: "twitter", available: false },
    { platform: "facebook", available: false },
    { platform: "instagram", available: false },
  ];

  // Show loading while checking workspace
  if (workspacesLoading || (!currentWorkspace && workspaces.length > 0)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-900" />
          <p className="text-zinc-500 font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!currentWorkspace && !workspacesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Workspace Selected</CardTitle>
            <CardDescription>
              Please create or select a workspace to view settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/onboarding">
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Workspace
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 lg:p-10 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/ws/${workspaceId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              {currentWorkspace && (
                <span
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${currentWorkspace.color}20` }}
                >
                  {currentWorkspace.icon}
                </span>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Workspace Settings</h1>
                <p className="text-gray-500">{currentWorkspace?.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Details Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-gray-500" />
              <CardTitle>Workspace Details</CardTitle>
            </div>
            <CardDescription>
              Customize your workspace name, icon, and color
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Workspace Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Workspace Name</Label>
              <Input
                id="name"
                placeholder="e.g., My Personal Brand"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                disabled={isSaving}
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
                      "w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all",
                      selectedIcon === icon
                        ? "bg-primary/10 ring-2 ring-primary ring-offset-2"
                        : "bg-gray-100 hover:bg-gray-200"
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
                      "w-8 h-8 rounded-full transition-all",
                      selectedColor === color
                        ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                        : "hover:scale-105"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="p-4 bg-gray-50 rounded-lg border">
              <Label className="text-xs text-gray-500 mb-2 block">Preview</Label>
              <div className="flex items-center gap-3">
                <span
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${selectedColor}20` }}
                >
                  {selectedIcon}
                </span>
                <span className="font-medium">
                  {workspaceName || "Your Workspace"}
                </span>
              </div>
            </div>

            {/* Save Button */}
            {hasChanges && (
              <Button onClick={handleSaveWorkspace} disabled={isSaving || !workspaceName.trim()}>
                {isSaving ? (
                  <>
                    <Spinner className="h-4 w-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Connected Accounts Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-gray-500" />
              <CardTitle>Connected Accounts</CardTitle>
            </div>
            <CardDescription>
              Manage social media accounts for this workspace. Each platform can have only one connected account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : accounts && accounts.length > 0 ? (
              <div className="space-y-4">
                {accounts.map((account) => (
                  <div
                    key={account.$id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={account.accountImage} alt={account.accountName} />
                      <AvatarFallback>
                        {account.accountName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 truncate">
                          {account.accountName}
                        </span>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          <Check className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span
                          style={{ color: PLATFORM_CONFIG[account.platform].color }}
                          className="flex items-center gap-1"
                        >
                          {platformIcons[account.platform]}
                          {PLATFORM_CONFIG[account.platform].name}
                        </span>
                        {account.accountEmail && (
                          <>
                            <span>•</span>
                            <span className="truncate">{account.accountEmail}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteAccountClick(account)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No accounts connected to this workspace.</p>
                <p className="text-sm">Connect your first account to start publishing.</p>
              </div>
            )}

            {/* Connect Buttons */}
            <div className="pt-4">
              <Label className="text-sm font-medium mb-3 block">Connect Account</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availablePlatforms.map(({ platform, available }) => {
                  const isConnected = connectedPlatforms.has(platform);
                  
                  return (
                    <Button
                      key={platform}
                      variant="outline"
                      className={`h-auto py-3 justify-start gap-3 ${isConnected ? 'opacity-50' : ''}`}
                      disabled={!available || isConnected}
                      onClick={platform === "linkedin" ? handleConnectLinkedIn : undefined}
                    >
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${PLATFORM_CONFIG[platform].color}20` }}
                      >
                        <span style={{ color: PLATFORM_CONFIG[platform].color }}>
                          {platformIcons[platform]}
                        </span>
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-sm">{PLATFORM_CONFIG[platform].name}</div>
                        <div className="text-xs text-gray-500">
                          {isConnected 
                            ? "Already connected" 
                            : available 
                              ? "Click to connect" 
                              : "Coming soon"}
                        </div>
                      </div>
                      {isConnected ? (
                        <Check className="h-4 w-4 ml-auto text-green-500" />
                      ) : available ? (
                        <Plus className="h-4 w-4 ml-auto" />
                      ) : null}
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </div>
            <CardDescription>
              Irreversible actions that affect your workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <h4 className="font-medium text-gray-900">Delete Workspace</h4>
                <p className="text-sm text-gray-500">
                  Permanently delete this workspace and all associated data
                </p>
              </div>
              <Button 
                variant="destructive"
                onClick={() => setDeleteWorkspaceDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Delete Account Dialog */}
        <Dialog open={deleteAccountDialogOpen} onOpenChange={setDeleteAccountDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Disconnect Account</DialogTitle>
              <DialogDescription>
                Are you sure you want to disconnect{" "}
                <span className="font-medium">{accountToDelete?.accountName}</span>? You will
                need to reconnect to publish to this platform again.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteAccountDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDeleteAccount}
                className="bg-red-500 hover:bg-red-600"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Disconnect
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Workspace Dialog */}
        <Dialog open={deleteWorkspaceDialogOpen} onOpenChange={setDeleteWorkspaceDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete Workspace</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the workspace{" "}
                <span className="font-medium">{currentWorkspace?.name}</span> and all
                associated posts and connected accounts.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>
                  Type <span className="font-mono font-bold">{currentWorkspace?.name}</span> to confirm
                </Label>
                <Input
                  placeholder="Workspace name"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setDeleteWorkspaceDialogOpen(false);
                setDeleteConfirmText("");
              }}>
                Cancel
              </Button>
              <Button
                onClick={handleDeleteWorkspace}
                className="bg-red-500 hover:bg-red-600"
                disabled={deleteConfirmText !== currentWorkspace?.name || isDeletingWorkspace}
              >
                {isDeletingWorkspace ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Delete Workspace
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
