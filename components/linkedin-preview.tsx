"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Globe,
  MoreHorizontal,
  ThumbsUp,
  MessageSquare,
  Repeat,
  Send,
} from "lucide-react";
import { useState } from "react";

interface LinkedInPreviewProps {
  content: string;
  authorName?: string;
  authorImage?: string;
  authorHeadline?: string;
}

export function LinkedInPreview({
  content,
  authorName = "LinkedIn User",
  authorImage,
  authorHeadline = "Content Creator | LinkedIn Enthusiast",
}: LinkedInPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Detect if text is Arabic (RTL)
  const isRTL = (text: string) => {
    const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    return arabicPattern.test(text.trim().charAt(0));
  };

  const textDirection = isRTL(content) ? "rtl" : "ltr";

  // Simple logic to truncate text for "See more"
  const shouldTruncate = content.length > 250;
  const displayContent =
    !isExpanded && shouldTruncate ? content.slice(0, 250) : content;

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-full bg-white border border-gray-300 rounded-lg overflow-hidden font-sans shadow-sm">
      {/* Header */}
      <div className="p-3 flex gap-3">
        <Avatar className="w-12 h-12 cursor-pointer">
          {authorImage ? (
            <AvatarImage
              src={authorImage}
              alt={authorName}
              className="object-cover"
            />
          ) : null}
          <AvatarFallback className="bg-[#0a66c2] text-white font-semibold text-sm">
            {getInitials(authorName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <h3 className="font-semibold text-[14px] text-gray-900 hover:text-[#0a66c2] hover:underline cursor-pointer truncate">
                {authorName}
              </h3>
              <p className="text-[12px] text-gray-500 truncate leading-tight">
                {authorHeadline}
              </p>
              <div className="flex items-center gap-1 text-[12px] text-gray-500 mt-0.5">
                <span>Just now</span>
                <span>•</span>
                <Globe className="w-3 h-3" />
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:bg-gray-100 rounded-full -mr-2"
            >
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        dir={textDirection}
        className={`px-4 pb-2 text-[14px] text-gray-900 whitespace-pre-wrap leading-relaxed break-words ${
          textDirection === "rtl" ? "text-right" : "text-left"
        }`}
      >
        {displayContent}
        {shouldTruncate && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-gray-500 hover:text-[#0a66c2] hover:underline font-semibold ml-1"
          >
            ...see more
          </button>
        )}
      </div>

      {/* Engagement Stats */}
      <div className="px-4 py-2 flex items-center justify-between text-[12px] text-gray-500 border-b border-gray-100">
        <div className="flex items-center gap-1 cursor-pointer hover:text-[#0a66c2] hover:underline">
          <div className="w-4 h-4 rounded-full bg-[#0a66c2] flex items-center justify-center">
            <ThumbsUp className="w-2.5 h-2.5 text-white fill-current" />
          </div>
          <span className="ml-1 hover:text-[#0a66c2] hover:underline">24</span>
        </div>
        <div className="flex gap-1">
          <span className="hover:text-[#0a66c2] hover:underline cursor-pointer">
            3 comments
          </span>
          <span>•</span>
          <span className="hover:text-[#0a66c2] hover:underline cursor-pointer">
            2 reposts
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-1 py-1 flex justify-between items-center">
        <ActionButton icon={<ThumbsUp className="w-5 h-5" />} label="Like" />
        <ActionButton
          icon={<MessageSquare className="w-5 h-5" />}
          label="Comment"
        />
        <ActionButton icon={<Repeat className="w-5 h-5" />} label="Repost" />
        <ActionButton icon={<Send className="w-5 h-5" />} label="Send" />
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Button
      variant="ghost"
      className="flex-1 flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-100 font-semibold text-[14px] h-12 rounded-md transition-colors"
    >
      {icon}
      <span className="text-gray-500 font-semibold">{label}</span>
    </Button>
  );
}
