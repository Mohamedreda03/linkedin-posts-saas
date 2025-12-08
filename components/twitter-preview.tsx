"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getTextDirection } from "@/lib/utils";
import {
  MessageCircle,
  Repeat2,
  Heart,
  BarChart3,
  Share,
  MoreHorizontal,
  Bookmark,
} from "lucide-react";
import { useState } from "react";

interface TwitterPreviewProps {
  content: string;
  authorName?: string;
  authorImage?: string;
  authorHandle?: string;
}

export function TwitterPreview({
  content,
  authorName = "User",
  authorImage,
  authorHandle = "@user",
}: TwitterPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const textDirection = getTextDirection(content);
  
  // Twitter character limit is 280
  const isOverLimit = content.length > 280;
  const shouldTruncate = content.length > 200;
  const displayContent =
    !isExpanded && shouldTruncate ? content.slice(0, 200) : content;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-full bg-black text-white rounded-xl overflow-hidden font-sans border border-zinc-800">
      {/* Main tweet container */}
      <div className="p-4">
        <div className="flex gap-3">
          {/* Avatar */}
          <Avatar className="w-10 h-10 cursor-pointer flex-shrink-0">
            {authorImage ? (
              <AvatarImage
                src={authorImage}
                alt={authorName}
                className="object-cover"
              />
            ) : null}
            <AvatarFallback className="bg-[#1d9bf0] text-white font-semibold text-sm">
              {getInitials(authorName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[15px]">
                <span className="font-bold text-white hover:underline cursor-pointer truncate">
                  {authorName}
                </span>
                <span className="text-zinc-500 truncate">{authorHandle}</span>
                <span className="text-zinc-500">·</span>
                <span className="text-zinc-500 hover:underline cursor-pointer">now</span>
              </div>
              <button className="p-2 -mr-2 rounded-full hover:bg-zinc-800 text-zinc-500 transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div
              dir={textDirection}
              className={`mt-1 text-[15px] leading-relaxed whitespace-pre-wrap break-words ${
                textDirection === "rtl" ? "text-right" : "text-left"
              }`}
            >
              {displayContent}
              {shouldTruncate && !isExpanded && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-[#1d9bf0] hover:underline ml-1"
                >
                  Show more
                </button>
              )}
            </div>

            {/* Character count warning */}
            {isOverLimit && (
              <div className="mt-2 text-sm text-red-500">
                ⚠️ {content.length}/280 characters (over limit by {content.length - 280})
              </div>
            )}

            {/* Timestamp */}
            <div className="mt-3 text-[13px] text-zinc-500">
              <span>12:00 PM · Dec 8, 2025</span>
              <span className="mx-1">·</span>
              <span className="text-white font-bold">1.2K</span>
              <span> Views</span>
            </div>

            {/* Engagement Stats */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-zinc-800 text-[13px] text-zinc-500">
              <span><span className="text-white font-bold">24</span> Reposts</span>
              <span><span className="text-white font-bold">5</span> Quotes</span>
              <span><span className="text-white font-bold">128</span> Likes</span>
              <span><span className="text-white font-bold">3</span> Bookmarks</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800 text-zinc-500">
              <ActionButton icon={<MessageCircle className="w-5 h-5" />} count="12" hoverColor="text-[#1d9bf0]" />
              <ActionButton icon={<Repeat2 className="w-5 h-5" />} count="24" hoverColor="text-green-500" />
              <ActionButton icon={<Heart className="w-5 h-5" />} count="128" hoverColor="text-pink-500" />
              <ActionButton icon={<BarChart3 className="w-5 h-5" />} count="1.2K" hoverColor="text-[#1d9bf0]" />
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-full hover:bg-zinc-800 hover:text-[#1d9bf0] transition-colors">
                  <Bookmark className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-full hover:bg-zinc-800 hover:text-[#1d9bf0] transition-colors">
                  <Share className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  count,
  hoverColor,
}: {
  icon: React.ReactNode;
  count: string;
  hoverColor: string;
}) {
  return (
    <button className={`flex items-center gap-1 p-2 rounded-full hover:bg-zinc-800 ${hoverColor} transition-colors group`}>
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-[13px]">{count}</span>
    </button>
  );
}
