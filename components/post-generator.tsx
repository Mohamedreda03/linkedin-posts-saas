"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getTextDirection } from "@/lib/utils";
import { toast } from "sonner";
import { SocialAccount } from "@/lib/appwrite";

// Import sub-components
import {
  Header,
  Toolbar,
  AIPanel,
  EditorArea,
  PreviewPane,
  PreviewToggle,
  AccountStatusBar,
} from "./post-generator/index";

export function PostGenerator() {
  const { user, loading, currentWorkspace } = useAuth();
  const [content, setContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  
  // Workspace LinkedIn account
  const [linkedInAccount, setLinkedInAccount] = useState<SocialAccount | null>(null);
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);

  // AI Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [dialect, setDialect] = useState("en-us");
  const [dialectOpen, setDialectOpen] = useState(false);
  const [postLength, setPostLength] = useState<"short" | "medium" | "long">("medium");
  const [isRewriting, setIsRewriting] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch LinkedIn account for current workspace
  useEffect(() => {
    async function fetchWorkspaceAccount() {
      if (!currentWorkspace) {
        setLinkedInAccount(null);
        return;
      }
      
      setIsLoadingAccount(true);
      try {
        const response = await fetch(
          `/api/accounts?workspaceId=${currentWorkspace.$id}&platform=linkedin`
        );
        const data = await response.json();
        
        if (data.accounts && data.accounts.length > 0) {
          setLinkedInAccount(data.accounts[0]);
        } else {
          setLinkedInAccount(null);
        }
      } catch (error) {
        console.error("Failed to fetch workspace account:", error);
        setLinkedInAccount(null);
      } finally {
        setIsLoadingAccount(false);
      }
    }
    
    fetchWorkspaceAccount();
  }, [currentWorkspace]);

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
    if (!linkedInAccount) {
      toast.error("Please connect a LinkedIn account in settings");
      return;
    }
    
    setIsPosting(true);
    try {
      const response = await fetch("/api/linkedin/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content,
          userId: user.$id,
          workspaceId: currentWorkspace.$id,
          accountId: linkedInAccount.$id,
        }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to post");
      }
      
      const accountName = data.accountName || linkedInAccount?.accountName || "LinkedIn";
      toast.success(`Published to ${accountName}!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to publish");
    } finally {
      setIsPosting(false);
    }
  };

  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-linear-to-br from-[#f8fafc] via-[#fafafa] to-[#f4f4f5]">
      {/* Header Component */}
      <Header
        user={user}
        loading={loading}
        isPosting={isPosting}
        hasContent={content.trim().length > 0}
        onPublish={handlePublish}
      />

      {/* Workspace Account Status Bar */}
      {user && currentWorkspace && (
        <AccountStatusBar
          linkedInAccount={linkedInAccount}
          isLoadingAccount={isLoadingAccount}
          workspaceId={currentWorkspace.$id}
          workspaceName={currentWorkspace.name}
        />
      )}

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
        />
      </div>
    </div>
  );
}
