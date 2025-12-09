"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Sparkles, ArrowRight, Briefcase } from "lucide-react";
import { WORKSPACE_ICONS, WORKSPACE_COLORS } from "@/lib/constants/workspace";

export default function OnboardingPage() {
  const { user, loading, workspaces, refreshWorkspaces } = useAuth();
  const router = useRouter();
  
  const [workspaceName, setWorkspaceName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("💼");
  const [selectedColor, setSelectedColor] = useState("#3B82F6");
  const [isCreating, setIsCreating] = useState(false);

  // Redirect to workspace if user already has workspaces
  useEffect(() => {
    if (!loading && workspaces.length > 0) {
      router.replace(`/ws/${workspaces[0].$id}`);
    }
  }, [loading, workspaces, router]);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/sign-in");
    }
  }, [loading, user, router]);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workspaceName.trim()) {
      toast.error("Please enter a workspace name");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workspaceName.trim(),
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
      toast.success("Workspace created successfully!");
      router.push(`/ws/${data.workspace.$id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create workspace");
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4">
      <div className="w-full max-w-lg">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to LinkedIn Publisher!
          </h1>
          <p className="text-gray-600">
            Let&apos;s set up your first workspace to get started
          </p>
        </div>

        {/* Create Workspace Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Create Your Workspace
            </CardTitle>
            <CardDescription>
              A workspace is where you manage your social media presence. You can create multiple workspaces for different brands or clients.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateWorkspace} className="space-y-6">
              {/* Workspace Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Workspace Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., My Personal Brand, Client XYZ"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  disabled={isCreating}
                  className="h-11"
                />
              </div>

              {/* Icon Selection */}
              <div className="space-y-2">
                <Label>Choose an Icon</Label>
                <div className="flex flex-wrap gap-2">
                  {WORKSPACE_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setSelectedIcon(icon)}
                      className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                        selectedIcon === icon
                          ? "bg-primary/10 ring-2 ring-primary ring-offset-2"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="space-y-2">
                <Label>Choose a Color</Label>
                <div className="flex flex-wrap gap-2">
                  {WORKSPACE_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        selectedColor === color
                          ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <Label className="text-xs text-gray-500 mb-2 block">Preview</Label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${selectedColor}20` }}
                  >
                    {selectedIcon}
                  </div>
                  <span className="font-medium">
                    {workspaceName || "Your Workspace"}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isCreating || !workspaceName.trim()}
                className="w-full h-11"
              >
                {isCreating ? (
                  <>
                    <Spinner className="h-4 w-4 mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Workspace
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          After creating your workspace, you&apos;ll be able to connect your social media accounts.
        </p>
      </div>
    </div>
  );
}
