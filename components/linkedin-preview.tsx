"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Globe,
  MoreHorizontal,
  ThumbsUp,
  MessageSquare,
  Repeat2,
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
    <Card className="w-full bg-white border border-[#d3d3d3] shadow-sm overflow-hidden rounded-lg font-[system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif]">
      {/* Header */}
      <div className="p-4 pb-0 flex gap-2">
        <Avatar className="w-12 h-12 rounded-full shrink-0">
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
            <div className="flex flex-col leading-tight">
              <h3 className="font-semibold text-[14px] text-[#000000e6] hover:text-[#0a66c2] hover:underline cursor-pointer">
                {authorName}
              </h3>
              <p className="text-[12px] text-[#00000099] line-clamp-1 mt-0.5">
                {authorHeadline}
              </p>
              <div className="flex items-center gap-1 text-[12px] text-[#00000099] mt-0.5">
                <span>Just now</span>
                <span>•</span>
                <Globe className="w-3 h-3" />
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[#00000099] hover:bg-[#00000014] rounded-full -mr-2"
            >
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        dir={textDirection}
        className={`px-4 py-3 text-[14px] text-[#000000e6] whitespace-pre-line leading-[1.42857] wrap-break-word ${
          textDirection === "rtl" ? "text-right" : "text-left"
        }`}
      >
        {displayContent}
        {shouldTruncate && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-[#00000099] hover:text-[#0a66c2] hover:underline font-semibold"
          >
            ...see more
          </button>
        )}
      </div>

      {/* Engagement Stats */}
      <div className="px-4 py-2 flex items-center justify-between text-[12px] text-[#00000099]">
        <div className="flex items-center gap-0.5 hover:text-[#0a66c2] hover:underline cursor-pointer">
          <div className="flex -space-x-0.5">
            <div className="w-4 h-4 rounded-full bg-[#378fe9] flex items-center justify-center z-10">
              <ThumbsUp className="w-2.5 h-2.5 text-white fill-white" />
            </div>
          </div>
          <span className="ml-1">24</span>
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

      <div className="px-4">
        <Separator className="bg-[#00000026]" />
      </div>

      {/* Action Buttons */}
      <div className="px-2 py-1 flex justify-around">
        <ActionButton icon={<ThumbsUp className="w-5 h-5" />} label="Like" />
        <ActionButton
          icon={<MessageSquare className="w-5 h-5" />}
          label="Comment"
        />
        <ActionButton icon={<Repeat2 className="w-5 h-5" />} label="Repost" />
        <ActionButton icon={<Send className="w-5 h-5" />} label="Send" />
      </div>
    </Card>
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
      className="flex-1 flex items-center justify-center gap-1.5 text-[#00000099] hover:bg-[#00000014] hover:text-[#000000e6] font-semibold text-[14px] h-11 rounded-md transition-colors px-2"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}
