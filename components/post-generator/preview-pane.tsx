"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { LinkedInPreview } from "../linkedin-preview";
import { TwitterPreview } from "../twitter-preview";
import { FacebookPreview } from "../facebook-preview";
import { InstagramPreview } from "../instagram-preview";
import { SocialPlatform, PLATFORM_CONFIG } from "@/lib/appwrite";
import { cn } from "@/lib/utils";
import { FaLinkedin, FaXTwitter, FaFacebook, FaInstagram } from "react-icons/fa6";
import { PlatformContent } from "@/lib/types/post";
import { Models } from "appwrite";

interface MultiPlatformPreviewPaneProps {
  showPreview: boolean;
  content: string; // Fallback content
  platformContent?: PlatformContent;
  user: Models.User<Models.Preferences> | null;
  selectedPlatforms: SocialPlatform[];
  activePlatform?: SocialPlatform;
  onPreviewChange?: (platform: SocialPlatform) => void;
}

const PLATFORM_ICONS: Record<SocialPlatform, React.ReactNode> = {
  linkedin: <FaLinkedin className="w-4 h-4" />,
  twitter: <FaXTwitter className="w-4 h-4" />,
  facebook: <FaFacebook className="w-4 h-4" />,
  instagram: <FaInstagram className="w-4 h-4" />,
};

export function PreviewPane({ 
  showPreview, 
  content, 
  platformContent = {},
  user,
  selectedPlatforms = ["linkedin"],
  activePlatform,
  onPreviewChange,
}: MultiPlatformPreviewPaneProps) {
  const [internalActivePreview, setInternalActivePreview] = useState<SocialPlatform>(
    selectedPlatforms[0] || "linkedin"
  );

  // Use controlled or uncontrolled state
  const currentPreview = activePlatform || internalActivePreview;
  
  // Ensure current preview is valid
  const validPreview = selectedPlatforms.includes(currentPreview) 
    ? currentPreview 
    : selectedPlatforms[0] || "linkedin";

  const handlePreviewChange = (platform: SocialPlatform) => {
    setInternalActivePreview(platform);
    onPreviewChange?.(platform);
  };

  const renderPreview = () => {
    // Get content for the specific platform, fallback to generic content
    const specificContent = platformContent[validPreview] || content;
    const previewContent = specificContent || "Your post content will appear here as you type...\n\nStart writing to see the magic happen! ✨";
    const authorName = user?.name || "Your Name";

    switch (validPreview) {
      case "linkedin":
        return (
          <LinkedInPreview
            content={previewContent}
            authorName={authorName}
            authorHeadline="Creator & Thought Leader"
          />
        );
      case "twitter":
        return (
          <TwitterPreview
            content={previewContent}
            authorName={authorName}
            authorHandle={`@${authorName.toLowerCase().replace(/\s+/g, "")}`}
          />
        );
      case "facebook":
        return (
          <FacebookPreview
            content={previewContent}
            authorName={authorName}
          />
        );
      case "instagram":
        return (
          <InstagramPreview
            content={previewContent}
            authorName={authorName}
          />
        );
      default:
        return null;
    }
  };

  const getCharacterLimit = (platform: SocialPlatform): number => {
    switch (platform) {
      case "twitter": return 280;
      case "linkedin": return 3000;
      case "facebook": return 63206;
      case "instagram": return 2200;
      default: return 3000;
    }
  };

  const charLimit = getCharacterLimit(validPreview);
  const currentContent = platformContent[validPreview] || content;
  const isOverLimit = currentContent.length > charLimit;

  return (
    <div
      className={`
        border-l border-primary/10 bg-linear-to-b from-[#fafafa] to-[#f8fafc] transition-all duration-500 ease-out flex flex-col
        ${
          showPreview
            ? "w-[480px] translate-x-0 opacity-100"
            : "w-0 translate-x-full opacity-0 overflow-hidden"
        }
      `}
    >
      {/* Header with platform tabs */}
      <div className="border-b border-primary/10 bg-white/80 backdrop-blur-sm">
        {/* Top bar */}
        <div className="h-12 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Preview
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const specificContent = platformContent[validPreview] || content;
              navigator.clipboard.writeText(specificContent);
              toast.success("Copied to clipboard!");
            }}
            className="text-muted-foreground hover:text-foreground h-8"
          >
            <Copy className="w-4 h-4 mr-1" />
            Copy
          </Button>
        </div>

        {/* Platform tabs */}
        {selectedPlatforms.length > 1 && (
          <div className="flex items-center gap-1 px-3 pb-2 overflow-x-auto">
            {selectedPlatforms.map((platform) => {
              const config = PLATFORM_CONFIG[platform];
              const isActive = validPreview === platform;
              
              return (
                <button
                  key={platform}
                  onClick={() => handlePreviewChange(platform)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                    isActive
                      ? "bg-white shadow-sm border"
                      : "text-muted-foreground hover:bg-white/50"
                  )}
                  style={{
                    color: isActive ? config.color : undefined,
                    borderColor: isActive ? config.color + "40" : undefined,
                  }}
                >
                  {PLATFORM_ICONS[platform]}
                  <span className="hidden sm:inline">{config.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
        <div className="w-full max-w-[400px] space-y-4">
          {renderPreview()}

          {/* Character count and platform info */}
          <div className="text-center py-3 space-y-2">
            <div className={cn(
              "text-sm font-medium",
              isOverLimit ? "text-red-500" : "text-muted-foreground"
            )}>
              {currentContent.length.toLocaleString()} / {charLimit.toLocaleString()} characters
              {isOverLimit && " (over limit!)"}
            </div>
            <p className="text-xs text-muted-foreground">
              Preview for {PLATFORM_CONFIG[validPreview].name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
