"use client";

import { SocialPlatform, PLATFORM_CONFIG } from "@/lib/appwrite";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaLinkedin, FaXTwitter, FaFacebook, FaInstagram } from "react-icons/fa6";

interface PlatformTabsProps {
  activePlatform: SocialPlatform;
  onPlatformChange: (platform: SocialPlatform) => void;
  selectedPlatforms: SocialPlatform[];
}

const PLATFORM_ICONS: Record<SocialPlatform, React.ReactNode> = {
  linkedin: <FaLinkedin className="w-4 h-4" />,
  twitter: <FaXTwitter className="w-4 h-4" />,
  facebook: <FaFacebook className="w-4 h-4" />,
  instagram: <FaInstagram className="w-4 h-4" />,
};

export function PlatformTabs({
  activePlatform,
  onPlatformChange,
  selectedPlatforms,
}: PlatformTabsProps) {
  // If no platforms are selected, show at least LinkedIn or the active one
  const tabsToShow = selectedPlatforms.length > 0 ? selectedPlatforms : [activePlatform];

  return (
    <Tabs
      value={activePlatform}
      onValueChange={(v) => onPlatformChange(v as SocialPlatform)}
      className="w-full"
    >
      <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-zinc-200 rounded-none overflow-x-auto no-scrollbar">
        {tabsToShow.map((platform) => {
          const config = PLATFORM_CONFIG[platform];
          return (
            <TabsTrigger
              key={platform}
              value={platform}
              className={cn(
                "rounded-none border-b-2 border-transparent px-4 py-3",
                "data-[state=active]:border-primary data-[state=active]:bg-zinc-50/50",
                "flex items-center gap-2 transition-all hover:bg-zinc-50/50"
              )}
            >
              <span style={{ color: config.color }}>{PLATFORM_ICONS[platform]}</span>
              <span className="font-medium">{config.name}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
