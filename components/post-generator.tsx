"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getTextDirection } from "@/lib/utils";
import { toast } from "sonner";
import { SocialAccount, SocialPlatform } from "@/lib/appwrite";

// Import sub-components
import {
  Header,
  Toolbar,
  AIPanel,
  EditorArea,
  PreviewPane,
  PreviewToggle,
} from "./post-generator/index";

export function PostGenerator() {
  const { user, loading, currentWorkspace } = useAuth();
  const [content, setContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  
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
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
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

      const draft = data.posts[0]?.content || "";
      setContent(draft);
      setIsDialogOpen(false);
      toast.success("Draft created!");
    } catch {
      toast.error("Failed to generate draft");
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
      toast.success("Post rewritten successfully!");
    } catch {
      toast.error("Failed to rewrite post");
    } finally {
      setIsRewriting(false);
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
    
    setIsPosting(true);
    const results: { platform: string; success: boolean; error?: string }[] = [];

    // Publish to each selected platform
    for (const platform of selectedPlatforms) {
      const account = connectedAccounts.find((acc) => acc.platform === platform);
      if (!account) continue;

      try {
        let endpoint = "";
        let body: Record<string, unknown> = {
          content,
          userId: user.$id,
          workspaceId: currentWorkspace.$id,
          accountId: account.$id,
        };

        switch (platform) {
          case "linkedin":
            endpoint = "/api/linkedin/post";
            break;
          case "twitter":
            endpoint = "/api/twitter/post";
            break;
          case "facebook":
            endpoint = "/api/facebook/post";
            break;
          case "instagram":
            endpoint = "/api/instagram/post";
            // Instagram requires an image - for now we'll skip if no image
            // You can add image upload functionality later
            toast.error("Instagram posting requires an image. Coming soon!");
            results.push({ platform, success: false, error: "Requires image" });
            continue;
          default:
            results.push({ platform, success: false, error: "Not supported" });
            continue;
        }

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to post");
        }
        results.push({ platform, success: true });
      } catch (error) {
        results.push({ 
          platform, 
          success: false, 
          error: error instanceof Error ? error.message : "Failed" 
        });
      }
    }

    // Show results
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    if (successful.length > 0) {
      toast.success(`Published to ${successful.map((r) => r.platform).join(", ")}!`);
    }
    if (failed.length > 0) {
      failed.forEach((r) => {
        toast.error(`${r.platform}: ${r.error}`);
      });
    }

    setIsPosting(false);
  };

  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-linear-to-br from-[#f8fafc] via-[#fafafa] to-[#f4f4f5]">
      {/* Header Component with Platform Selector */}
      <Header
        user={user}
        loading={loading}
        isPosting={isPosting}
        hasContent={content.trim().length > 0}
        onPublish={handlePublish}
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

          {/* AI Inline Expandable Panel */}
          <AIPanel
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            topic={topic}
            setTopic={setTopic}
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
            setContent={setContent}
            textDirection={textDirection}
            textareaRef={textareaRef}
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
          user={user}
          selectedPlatforms={selectedPlatforms}
        />
      </div>
    </div>
  );
}
