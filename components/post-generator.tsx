"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { getTextDirection } from "@/lib/utils";
import { toast } from "sonner";
import { SocialAccount, SocialPlatform } from "@/lib/appwrite";
import { PlatformContent } from "@/lib/types/post";

// Import sub-components
import {
  Header,
  Toolbar,
  AIPanel,
  EditorArea,
  PreviewPane,
  PreviewToggle,
  PlatformSelector,
  PlatformTabs,
  ScheduleDialog,
  UnsavedChangesDialog,
  SaveStatus,
} from "./post-generator/index";

interface PostGeneratorProps {
  postId: string;
}

export function PostGenerator({ postId: initialPostId }: PostGeneratorProps) {
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const { user, loading, currentWorkspace } = useAuth();
  
  const [content, setContent] = useState("");
  const [platformContent, setPlatformContent] = useState<PlatformContent>({});
  const [activePlatform, setActivePlatform] = useState<SocialPlatform>("linkedin");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  
  // Post management state
  const [postId] = useState<string>(initialPostId);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isUnsavedDialogOpen, setIsUnsavedDialogOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  
  // Multi-platform accounts
  const [connectedAccounts, setConnectedAccounts] = useState<SocialAccount[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(["linkedin"]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  // AI Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [dialect, setDialect] = useState("en-us");
  const [dialectOpen, setDialectOpen] = useState(false);
  const [postLength, setPostLength] = useState<"short" | "medium" | "long">("medium");
  const [isRewriting, setIsRewriting] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isNavigatingRef = useRef(false);

  // Fetch post data using React Query
  const { data: postData, isLoading: isLoadingPost, error: postError } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${postId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to load post: ${response.status}`);
      }
      const data = await response.json();
      return data.post;
    },
    enabled: !!postId && !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Set post data when loaded
  useEffect(() => {
    if (postData && !hasUnsavedChanges) {
      setContent(postData.content || "");
      setPlatformContent(postData.platformContent || {});
      setTopic(postData.topic || "");
      setTone(postData.tone || "professional");
      setSaveStatus("saved");
      setLastSavedAt(new Date(postData.$updatedAt));
      setHasUnsavedChanges(false);
    }
  }, [postData]);

  // Handle post loading error
  useEffect(() => {
    if (postError) {
      console.error("Error loading post:", postError);
      toast.error("Failed to load post");
      router.replace(`/ws/${workspaceId}`);
    }
  }, [postError, router, workspaceId]);

  // Protect against data loss - beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isNavigatingRef.current) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Intercept navigation attempts
  useEffect(() => {
    const handlePopState = () => {
      if (hasUnsavedChanges && !isNavigatingRef.current) {
        // Push the state back to prevent navigation
        window.history.pushState(null, "", window.location.href);
        // Show unsaved changes dialog
        setPendingNavigation(() => () => {
          isNavigatingRef.current = true;
          window.history.back();
        });
        setIsUnsavedDialogOpen(true);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [hasUnsavedChanges]);

  // Fetch all connected accounts for current workspace
  useEffect(() => {
    async function fetchWorkspaceAccounts() {
      if (!currentWorkspace) {
        setConnectedAccounts([]);
        return;
      }
      
      setIsLoadingAccounts(true);
      try {
        const response = await fetch(
          `/api/accounts?workspaceId=${currentWorkspace.$id}`
        );
        const data = await response.json();
        
        if (data.accounts && data.accounts.length > 0) {
          setConnectedAccounts(data.accounts);
          // Auto-select connected platforms
          const platforms = data.accounts.map((acc: SocialAccount) => acc.platform);
          setSelectedPlatforms(platforms.filter((p: SocialPlatform, i: number, arr: SocialPlatform[]) => arr.indexOf(p) === i));
        } else {
          setConnectedAccounts([]);
          setSelectedPlatforms([]);
        }
      } catch (error) {
        console.error("Failed to fetch workspace accounts:", error);
        setConnectedAccounts([]);
      } finally {
        setIsLoadingAccounts(false);
      }
    }
    
    fetchWorkspaceAccounts();
  }, [currentWorkspace]);

  const handlePlatformToggle = (platform: SocialPlatform) => {
    setSelectedPlatforms((prev) => {
      const newPlatforms = prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform];
      
      // If we're removing the active platform, switch to another one
      if (activePlatform === platform && !newPlatforms.includes(platform)) {
        const nextPlatform = newPlatforms[0] || "linkedin";
        setActivePlatform(nextPlatform);
        setContent(platformContent[nextPlatform] || "");
      }
      
      return newPlatforms;
    });
  };

  // Ensure active platform is valid when selected platforms change
  useEffect(() => {
    if (selectedPlatforms.length > 0 && !selectedPlatforms.includes(activePlatform)) {
      const nextPlatform = selectedPlatforms[0];
      setActivePlatform(nextPlatform);
      setContent(platformContent[nextPlatform] || "");
    }
  }, [selectedPlatforms, activePlatform, platformContent]);

  const handlePlatformTabChange = (platform: SocialPlatform) => {
    // Save current content to the previous platform (just in case)
    setPlatformContent(prev => ({
      ...prev,
      [activePlatform]: content
    }));
    
    setActivePlatform(platform);
    setContent(platformContent[platform] || "");
  };

  // Get LinkedIn account for backwards compatibility
  const linkedInAccount = connectedAccounts.find((acc) => acc.platform === "linkedin") || null;

  const textDirection = getTextDirection(content);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          tone,
          dialect,
          length: postLength,
          useEmoji: true,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      const post = data.posts[0];
      const newPlatformContent = post.platformContent || {};
      
      // Update all platform content
      setPlatformContent(newPlatformContent);
      
      // Set content for the active platform
      // If active platform has no content, fallback to linkedin or first available
      const activeContent = newPlatformContent[activePlatform] || 
                           newPlatformContent.linkedin || 
                           post.content || "";
                           
      setContent(activeContent);
      setHasUnsavedChanges(true);
      setSaveStatus("unsaved");
      setIsDialogOpen(false);
      toast.success("Draft created for all platforms!");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate draft");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRewrite = async () => {
    if (!content.trim()) {
      toast.error("Write some content first to rewrite");
      return;
    }

    setIsRewriting(true);
    try {
      const response = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, style: "improve" }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setContent(data.rewrittenContent);
      setHasUnsavedChanges(true);
      setSaveStatus("unsaved");
      toast.success("Post rewritten successfully!");
    } catch {
      toast.error("Failed to rewrite post");
    } finally {
      setIsRewriting(false);
    }
  };

  // Unsaved changes dialog handlers
  const handleSaveAndLeave = async () => {
    await handleSaveDraft();
    if (pendingNavigation) {
      isNavigatingRef.current = true;
      setIsUnsavedDialogOpen(false);
      pendingNavigation();
      setPendingNavigation(null);
    }
  };

  const handleDiscardAndLeave = () => {
    setHasUnsavedChanges(false);
    setIsUnsavedDialogOpen(false);
    if (pendingNavigation) {
      isNavigatingRef.current = true;
      pendingNavigation();
      setPendingNavigation(null);
    }
  };

  const handleCancelNavigation = () => {
    setIsUnsavedDialogOpen(false);
    setPendingNavigation(null);
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      setPendingNavigation(() => () => router.push(`/ws/${workspaceId}`));
      setIsUnsavedDialogOpen(true);
      return;
    }

    router.push(`/ws/${workspaceId}`);
  };

  // Auto-save functionality
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    
    // Sync with platform content
    setPlatformContent(prev => ({
      ...prev,
      [activePlatform]: newContent
    }));
    
    // Mark as unsaved if content changed
    if (newContent !== content) {
      setHasUnsavedChanges(true);
      setSaveStatus("unsaved");
    }
    
    // Clear previous timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Don't auto-save, only save when user clicks save button
  };

  const handleTopicChange = (value: string) => {
    if (value === topic) return;
    setTopic(value);
    setHasUnsavedChanges(true);
    setSaveStatus("unsaved");
  };

  // Save draft function - only manual save
  const handleSaveDraft = useCallback(async (isAutoSave = false) => {
    if (!user || !currentWorkspace) {
      if (!isAutoSave) toast.error("Please sign in to save");
      return;
    }

    if (!postId) {
      if (!isAutoSave) toast.error("Post not initialized");
      return;
    }

    setSaveStatus("saving");

    try {
      // Always update existing post
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          topic,
          tone,
          platformContent,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update draft");
      }

      setSaveStatus("saved");
      setLastSavedAt(new Date());
      setHasUnsavedChanges(false);
      if (!isAutoSave) toast.success("Draft saved successfully!");
    } catch (error) {
      setSaveStatus("error");
      if (!isAutoSave) {
        toast.error(error instanceof Error ? error.message : "Failed to save draft");
      }
    }
  }, [content, topic, tone, postId, user, currentWorkspace]);

  const handleTopicBlur = () => {
    if (saveStatus === "unsaved") {
      handleSaveDraft(true);
    }
  };

  // Schedule post function
  const handleSchedulePost = async (scheduledAt: string) => {
    if (!content.trim()) return;
    if (!user || !currentWorkspace) {
      toast.error("Please sign in to schedule");
      return;
    }

    if (!postId) {
      toast.error("Post not initialized");
      return;
    }

    setIsScheduling(true);

    try {
      // Update existing post with scheduled status
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "scheduled",
          scheduledAt,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to schedule post");
      }

      toast.success("Post scheduled successfully!");
      setIsScheduleDialogOpen(false);
      setSaveStatus("saved");
      setLastSavedAt(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to schedule post");
    } finally {
      setIsScheduling(false);
    }
  };

  const handlePublish = async () => {
    if (!content.trim()) return;
    if (!user) {
      toast.error("Please sign in to publish");
      return;
    }
    if (!currentWorkspace) {
      toast.error("Please select a workspace");
      return;
    }
    if (selectedPlatforms.length === 0) {
      toast.error("Please select at least one platform");
      return;
    }

    // Check if all selected platforms have connected accounts
    const missingPlatforms = selectedPlatforms.filter(
      (platform) => !connectedAccounts.find((acc) => acc.platform === platform)
    );
    if (missingPlatforms.length > 0) {
      toast.error(`Please connect accounts for: ${missingPlatforms.join(", ")}`);
      return;
    }

    if (!postId) {
      toast.error("Post not initialized");
      return;
    }
    
    setIsPosting(true);

    try {
      // Use the new publish API endpoint
      const response = await fetch(`/api/posts/${postId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platforms: selectedPlatforms,
          userId: user.$id,
          workspaceId: currentWorkspace.$id,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to publish post");
      }

      // Show results
      if (data.success) {
        toast.success(data.message);
        setSaveStatus("saved");
        setLastSavedAt(new Date());
        setHasUnsavedChanges(false);
      } else {
        toast.error(data.message);
      }

      // Show individual platform results if any failed
      if (data.failed > 0 && data.results) {
        data.results
          .filter((r: { success: boolean }) => !r.success)
          .forEach((r: { platform: string; error: string }) => {
            toast.error(`${r.platform}: ${r.error}`);
          });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to publish post");
    } finally {
      setIsPosting(false);
    }
  };

  // Cleanup auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-linear-to-br from-[#f8fafc] via-[#fafafa] to-[#f4f4f5]">
      {/* Header Component with Platform Selector */}
      <Header
        isPosting={isPosting}
        hasContent={content.trim().length > 0}
        topic={topic}
        onTopicChange={handleTopicChange}
        onTopicBlur={handleTopicBlur}
        onPublish={handlePublish}
        onSaveDraft={() => handleSaveDraft(false)}
        onSchedule={() => setIsScheduleDialogOpen(true)}
        saveStatus={saveStatus}
        lastSavedAt={lastSavedAt}
        onBack={handleBack}
        selectedPlatforms={selectedPlatforms}
        onPlatformToggle={handlePlatformToggle}
        connectedAccounts={connectedAccounts}
        isLoadingAccounts={isLoadingAccounts}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Editor Area */}
        <div
          className={`flex-1 flex flex-col relative transition-all duration-500 ease-out ${
            showPreview ? "w-1/2" : "w-full"
          }`}
        >
          {/* Toolbar */}
          <Toolbar
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            isRewriting={isRewriting}
            content={content}
            onRewrite={handleRewrite}
            charCount={charCount}
            wordCount={wordCount}
          />

          {/* Platform Tabs */}
          <PlatformTabs
            activePlatform={activePlatform}
            onPlatformChange={handlePlatformTabChange}
            selectedPlatforms={selectedPlatforms}
          />

          {/* AI Inline Expandable Panel */}
          <AIPanel
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            topic={topic}
            setTopic={handleTopicChange}
            tone={tone}
            setTone={setTone}
            dialect={dialect}
            setDialect={setDialect}
            dialectOpen={dialectOpen}
            setDialectOpen={setDialectOpen}
            postLength={postLength}
            setPostLength={setPostLength}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
          />

          {/* Text Editor */}
          <EditorArea
            content={content}
            setContent={handleContentChange}
            textDirection={textDirection}
            textareaRef={textareaRef}
            activePlatform={activePlatform}
          />

          {/* Toggle Preview Button */}
          <PreviewToggle
            showPreview={showPreview}
            setShowPreview={setShowPreview}
          />
        </div>

        {/* Live Preview Pane */}
        <PreviewPane
          showPreview={showPreview}
          content={content}
          platformContent={platformContent}
          user={user}
          selectedPlatforms={selectedPlatforms}
          activePlatform={activePlatform}
          onPreviewChange={setActivePlatform}
        />
      </div>

      {/* Schedule Dialog */}
      <ScheduleDialog
        isOpen={isScheduleDialogOpen}
        onClose={() => setIsScheduleDialogOpen(false)}
        onSchedule={handleSchedulePost}
        isScheduling={isScheduling}
      />

      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        isOpen={isUnsavedDialogOpen}
        onSave={handleSaveAndLeave}
        onDiscard={handleDiscardAndLeave}
        onCancel={handleCancelNavigation}
        isSaving={saveStatus === "saving"}
      />
    </div>
  );
}
