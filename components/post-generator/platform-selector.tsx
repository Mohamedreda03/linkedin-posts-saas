"use client";

import { SocialAccount, SocialPlatform, PLATFORM_CONFIG } from "@/lib/appwrite";
import { cn } from "@/lib/utils";
import { Check, AlertCircle } from "lucide-react";
import { FaLinkedin, FaXTwitter, FaFacebook, FaInstagram } from "react-icons/fa6";

interface PlatformSelectorProps {
  selectedPlatforms: SocialPlatform[];
  onPlatformToggle: (platform: SocialPlatform) => void;
  connectedAccounts: SocialAccount[];
  isLoading?: boolean;
}

const PLATFORM_ICONS: Record<SocialPlatform, React.ReactNode> = {
  linkedin: <FaLinkedin className="w-4 h-4" />,
  twitter: <FaXTwitter className="w-4 h-4" />,
  facebook: <FaFacebook className="w-4 h-4" />,
  instagram: <FaInstagram className="w-4 h-4" />,
};

export function PlatformSelector({
  selectedPlatforms,
  onPlatformToggle,
  connectedAccounts,
  isLoading = false,
}: PlatformSelectorProps) {
  const platforms: SocialPlatform[] = ["linkedin", "twitter", "facebook", "instagram"];

  const getAccountForPlatform = (platform: SocialPlatform): SocialAccount | undefined => {
    return connectedAccounts.find((acc) => acc.platform === platform);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 p-4 bg-zinc-50 border-b border-zinc-200">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
        <span className="text-sm text-zinc-500">Loading platforms...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-4 bg-zinc-50/50 border-b border-zinc-200">
      <span className="text-sm font-medium text-zinc-600 mr-2">Publish to:</span>
      <div className="flex items-center gap-2 flex-wrap">
        {platforms.map((platform) => {
          const config = PLATFORM_CONFIG[platform];
          const account = getAccountForPlatform(platform);
          const isConnected = !!account;
          const isSelected = selectedPlatforms.includes(platform);

          return (
            <button
              key={platform}
              onClick={() => isConnected && onPlatformToggle(platform)}
              disabled={!isConnected}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200",
                isConnected
                  ? isSelected
                    ? "border-current bg-white shadow-sm"
                    : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm"
                  : "border-zinc-100 bg-zinc-100 opacity-50 cursor-not-allowed"
              )}
              style={{
                color: isSelected && isConnected ? config.color : undefined,
                borderColor: isSelected && isConnected ? config.color : undefined,
              }}
            >
              <span
                className={cn(
                  "transition-colors",
                  isConnected ? (isSelected ? "" : "text-zinc-500") : "text-zinc-400"
                )}
                style={{ color: isSelected && isConnected ? config.color : undefined }}
              >
                {PLATFORM_ICONS[platform]}
              </span>
              <span
                className={cn(
                  "text-sm font-medium transition-colors",
                  isConnected ? (isSelected ? "" : "text-zinc-600") : "text-zinc-400"
                )}
              >
                {config.name}
              </span>
              {isConnected ? (
                isSelected && (
                  <Check
                    className="w-4 h-4"
                    style={{ color: config.color }}
                  />
                )
              ) : (
                <AlertCircle className="w-4 h-4 text-zinc-400" />
              )}
            </button>
          );
        })}
      </div>
      {connectedAccounts.length === 0 && (
        <span className="text-sm text-amber-600 ml-2">
          No accounts connected. Connect accounts in settings.
        </span>
      )}
    </div>
  );
}
