"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Send, Save, Clock, ChevronDown, Check, AlertCircle } from "lucide-react";
import { HeaderProps } from "./types";
import { CompactPlatformSelector } from "./compact-platform-selector";

export function Header({
  isPosting,
  hasContent,
  topic,
  onTopicChange,
  onTopicBlur,
  onPublish,
  onSaveDraft,
  onSchedule,
  saveStatus,
  lastSavedAt,
  onBack,
  selectedPlatforms,
  onPlatformToggle,
  connectedAccounts,
  isLoadingAccounts,
}: HeaderProps) {
  // Format last saved time
  const getLastSavedText = () => {
    if (!lastSavedAt) return "";
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSavedAt.getTime()) / 1000);
    
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return lastSavedAt.toLocaleDateString();
  };

  // Save status indicator
  const SaveStatusIndicator = () => {
    switch (saveStatus) {
      case "saving":
        return (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Spinner size="sm" />
            <span>Saving...</span>
          </div>
        );
      case "saved":
        return (
          <div className="flex items-center gap-2 text-xs text-green-600">
            <Check className="w-3 h-3" />
            <span>Saved {getLastSavedText()}</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center gap-2 text-xs text-red-600">
            <AlertCircle className="w-3 h-3" />
            <span>Save failed</span>
          </div>
        );
      case "unsaved":
        return (
          <div className="flex items-center gap-2 text-xs text-amber-600">
            <AlertCircle className="w-3 h-3" />
            <span>Unsaved changes</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <header className="h-16 border-b border-primary/10 bg-white/90 backdrop-blur-xl flex items-center justify-between px-6 z-20 sticky top-0 shadow-sm">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full border border-transparent hover:border-zinc-200 hover:bg-zinc-50"
          aria-label="Back to workspace"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="grid items-center">
          <span className="col-start-1 row-start-1 invisible whitespace-pre text-lg font-semibold px-0 py-0 pointer-events-none">
            {topic || "Edit post title"}
          </span>
          <input
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            onBlur={onTopicBlur}
            placeholder="Edit post title"
            className="col-start-1 row-start-1 w-full min-w-[120px] text-lg font-semibold bg-transparent border-b border-transparent focus:border-zinc-900 focus:outline-none px-0 py-0 placeholder:text-zinc-400"
          />
        </div>
        <div className="hidden md:block pl-3 border-l border-primary/10">
          <SaveStatusIndicator />
        </div>
      </div>

      <div className="flex items-center gap-3 pl-4 border-l border-primary/10">
        {/* Platform Selector */}
        <CompactPlatformSelector
          selectedPlatforms={selectedPlatforms}
          onPlatformToggle={onPlatformToggle}
          connectedAccounts={connectedAccounts}
          isLoading={isLoadingAccounts}
        />

        {/* Save Draft Button */}
        <Button
          onClick={onSaveDraft}
          disabled={!hasContent || saveStatus === "saving"}
          variant="outline"
          className="rounded-full px-5 font-semibold transition-all hover:scale-105 active:scale-95"
        >
          {saveStatus === "saving" ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </>
          )}
        </Button>

        {/* Publish Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              disabled={isPosting || !hasContent || selectedPlatforms.length === 0}
              className="bg-linear-to-r from-[#C76A00] to-[#E67E00] hover:from-[#B85F00] hover:to-[#D47000] text-white shadow-lg shadow-[#C76A00]/30 rounded-full px-6 font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isPosting ? (
                <>
                  <Spinner size="sm" className="text-white mr-2" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Publish
                  <ChevronDown className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={onPublish}
              disabled={isPosting || !hasContent || selectedPlatforms.length === 0}
              className="cursor-pointer"
            >
              <Send className="w-4 h-4 mr-2" />
              Publish Now
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onSchedule}
              disabled={isPosting || !hasContent || selectedPlatforms.length === 0}
              className="cursor-pointer"
            >
              <Clock className="w-4 h-4 mr-2" />
              Schedule Post
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
