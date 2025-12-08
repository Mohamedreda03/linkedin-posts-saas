"use client";

import { SocialAccount, SocialPlatform, PLATFORM_CONFIG } from "@/lib/appwrite";
import { cn } from "@/lib/utils";
import { Check, AlertCircle, ChevronDown } from "lucide-react";
import { FaLinkedin, FaXTwitter, FaFacebook, FaInstagram } from "react-icons/fa6";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface CompactPlatformSelectorProps {
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

export function CompactPlatformSelector({
  selectedPlatforms,
  onPlatformToggle,
  connectedAccounts,
  isLoading = false,
}: CompactPlatformSelectorProps) {
  const platforms: SocialPlatform[] = ["linkedin", "twitter", "facebook", "instagram"];

  const getAccountForPlatform = (platform: SocialPlatform): SocialAccount | undefined => {
    return connectedAccounts.find((acc) => acc.platform === platform);
  };

  // Get connected platforms only
  const connectedPlatforms = platforms.filter((p) => getAccountForPlatform(p));
  const allConnectedSelected = connectedPlatforms.every((p) => selectedPlatforms.includes(p));

  const handleSelectAll = () => {
    if (allConnectedSelected) {
      // Deselect all
      connectedPlatforms.forEach((p) => {
        if (selectedPlatforms.includes(p)) {
          onPlatformToggle(p);
        }
      });
    } else {
      // Select all connected
      connectedPlatforms.forEach((p) => {
        if (!selectedPlatforms.includes(p)) {
          onPlatformToggle(p);
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 gap-2 border-zinc-200 hover:border-zinc-300"
        >
          <div className="flex items-center -space-x-1">
            {selectedPlatforms.length > 0 ? (
              selectedPlatforms.slice(0, 3).map((platform) => (
                <span
                  key={platform}
                  className="w-5 h-5 rounded-full flex items-center justify-center bg-white border border-zinc-200"
                  style={{ color: PLATFORM_CONFIG[platform].color }}
                >
                  {PLATFORM_ICONS[platform]}
                </span>
              ))
            ) : (
              <span className="text-zinc-400 text-xs">No platforms</span>
            )}
            {selectedPlatforms.length > 3 && (
              <span className="w-5 h-5 rounded-full flex items-center justify-center bg-zinc-100 text-[10px] font-medium text-zinc-600 border border-zinc-200">
                +{selectedPlatforms.length - 3}
              </span>
            )}
          </div>
          {selectedPlatforms.length > 0 && (
            <span className="text-xs font-medium text-zinc-600 hidden sm:inline">
              {selectedPlatforms.length}
            </span>
          )}
          <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="end">
          <div className="flex items-center justify-between px-2 py-1.5 mb-1">
            <span className="text-xs font-medium text-zinc-500">
              Publish to ({selectedPlatforms.length} selected)
            </span>
            {connectedPlatforms.length > 1 && (
              <button
                onClick={handleSelectAll}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                {allConnectedSelected ? "Deselect all" : "Select all"}
              </button>
            )}
          </div>
          <div className="space-y-1">
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
                    "w-full flex items-center gap-3 px-2 py-2 rounded-md transition-all",
                    isConnected
                      ? isSelected
                        ? "bg-zinc-100"
                        : "hover:bg-zinc-50"
                      : "opacity-50 cursor-not-allowed"
                  )}
                >
                  <span
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                      isSelected && isConnected ? "bg-white shadow-sm" : "bg-zinc-100"
                    )}
                    style={{ color: isConnected ? config.color : undefined }}
                  >
                    {PLATFORM_ICONS[platform]}
                  </span>
                  <div className="flex-1 text-left">
                    <span
                      className={cn(
                        "text-sm font-medium block",
                        isConnected ? "text-zinc-900" : "text-zinc-400"
                      )}
                    >
                      {config.name}
                    </span>
                    {account && (
                      <span className="text-xs text-zinc-500 truncate block">
                        @{account.accountName || account.$id}
                      </span>
                    )}
                    {!isConnected && (
                      <span className="text-xs text-amber-600">Not connected</span>
                    )}
                  </div>
                  {isConnected && isSelected && (
                    <Check className="w-4 h-4 text-green-600" />
                  )}
                  {!isConnected && (
                    <AlertCircle className="w-4 h-4 text-zinc-300" />
                  )}
                </button>
              );
            })}
          </div>
          {connectedAccounts.length === 0 && (
            <div className="text-xs text-amber-600 px-2 py-2 mt-1 border-t border-zinc-100">
              Connect accounts in settings
            </div>
          )}
        </PopoverContent>
      </Popover>
  );
}
