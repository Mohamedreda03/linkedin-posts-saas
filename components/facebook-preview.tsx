"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getTextDirection } from "@/lib/utils";
import {
  Globe,
  MoreHorizontal,
  X,
  ThumbsUp,
  MessageCircle,
  Share2,
} from "lucide-react";
import { useState } from "react";

interface FacebookPreviewProps {
  content: string;
  authorName?: string;
  authorImage?: string;
}

export function FacebookPreview({
  content,
  authorName = "Facebook User",
  authorImage,
}: FacebookPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const textDirection = getTextDirection(content);

  // Facebook truncates at around 500 characters
  const shouldTruncate = content.length > 400;
  const displayContent =
    !isExpanded && shouldTruncate ? content.slice(0, 400) : content;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-full bg-white rounded-lg overflow-hidden font-sans shadow-md border border-zinc-200">
      {/* Header */}
      <div className="p-3 flex gap-3">
        <Avatar className="w-10 h-10 cursor-pointer">
          {authorImage ? (
            <AvatarImage
              src={authorImage}
              alt={authorName}
              className="object-cover"
            />
          ) : null}
          <AvatarFallback className="bg-[#1877F2] text-white font-semibold text-sm">
            {getInitials(authorName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <h3 className="font-semibold text-[15px] text-zinc-900 hover:underline cursor-pointer">
                {authorName}
              </h3>
              <div className="flex items-center gap-1 text-[13px] text-zinc-500">
                <span>Just now</span>
                <span>·</span>
                <Globe className="w-3 h-3" />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-500 hover:bg-zinc-100 rounded-full"
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-500 hover:bg-zinc-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        dir={textDirection}
        className={`px-4 pb-3 text-[15px] text-zinc-900 whitespace-pre-wrap leading-relaxed break-words ${
          textDirection === "rtl" ? "text-right" : "text-left"
        }`}
      >
        {displayContent}
        {shouldTruncate && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-zinc-500 hover:underline font-medium ml-1"
          >
            ... See more
          </button>
        )}
      </div>

      {/* Engagement Stats */}
      <div className="px-4 py-2 flex items-center justify-between text-[13px] text-zinc-500 border-b border-zinc-200">
        <div className="flex items-center gap-1 cursor-pointer hover:underline">
          <div className="flex -space-x-1">
            <div className="w-[18px] h-[18px] rounded-full bg-[#1877F2] flex items-center justify-center border-2 border-white">
              <ThumbsUp className="w-2.5 h-2.5 text-white fill-current" />
            </div>
            <div className="w-[18px] h-[18px] rounded-full bg-red-500 flex items-center justify-center border-2 border-white">
              <span className="text-[10px]">❤️</span>
            </div>
          </div>
          <span className="ml-1">You and 42 others</span>
        </div>
        <div className="flex gap-2">
          <span className="hover:underline cursor-pointer">8 comments</span>
          <span className="hover:underline cursor-pointer">3 shares</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-2 py-1 flex justify-between items-center">
        <ActionButton
          icon={<ThumbsUp className="w-5 h-5" />}
          label="Like"
          color="text-zinc-600"
        />
        <ActionButton
          icon={<MessageCircle className="w-5 h-5" />}
          label="Comment"
          color="text-zinc-600"
        />
        <ActionButton
          icon={<Share2 className="w-5 h-5" />}
          label="Share"
          color="text-zinc-600"
        />
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
}) {
  return (
    <Button
      variant="ghost"
      className={`flex-1 flex items-center justify-center gap-2 ${color} hover:bg-zinc-100 font-semibold text-[14px] h-10 rounded-md transition-colors`}
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
}
