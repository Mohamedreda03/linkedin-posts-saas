"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getTextDirection } from "@/lib/utils";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";

interface InstagramPreviewProps {
  content: string;
  authorName?: string;
  authorImage?: string;
  authorHandle?: string;
}

export function InstagramPreview({
  content,
  authorName = "instagram_user",
  authorImage,
  authorHandle,
}: InstagramPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const textDirection = getTextDirection(content);
  const displayHandle = authorHandle || authorName.toLowerCase().replace(/\s+/g, "_");

  // Instagram captions can be 2200 characters but truncate at around 125
  const shouldTruncate = content.length > 125;
  const displayContent =
    !isExpanded && shouldTruncate ? content.slice(0, 125) : content;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-full bg-white rounded-lg overflow-hidden font-sans border border-zinc-200">
      {/* Header */}
      <div className="px-3 py-2 flex items-center justify-between border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full">
            <Avatar className="w-8 h-8 cursor-pointer border-2 border-white">
              {authorImage ? (
                <AvatarImage
                  src={authorImage}
                  alt={authorName}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold text-xs">
                {getInitials(authorName)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-[13px] text-zinc-900 hover:opacity-60 cursor-pointer">
              {displayHandle}
            </span>
          </div>
        </div>
        <button className="p-2 hover:opacity-60 transition-opacity">
          <MoreHorizontal className="w-5 h-5 text-zinc-900" />
        </button>
      </div>

      {/* Image Placeholder (for text-only posts, show a gradient) */}
      <div className="aspect-square bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 flex items-center justify-center relative">
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <p
            dir={textDirection}
            className={`text-lg font-medium text-zinc-800 text-center leading-relaxed ${
              textDirection === "rtl" ? "text-right" : "text-left"
            }`}
            style={{ 
              display: "-webkit-box",
              WebkitLineClamp: 8,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {content.slice(0, 300)}
          </p>
        </div>
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#0095f6]" />
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className="hover:opacity-60 transition-opacity"
          >
            <Heart 
              className={`w-6 h-6 ${isLiked ? "fill-red-500 text-red-500" : "text-zinc-900"}`} 
            />
          </button>
          <button className="hover:opacity-60 transition-opacity">
            <MessageCircle className="w-6 h-6 text-zinc-900" />
          </button>
          <button className="hover:opacity-60 transition-opacity">
            <Send className="w-6 h-6 text-zinc-900" />
          </button>
        </div>
        <button className="hover:opacity-60 transition-opacity">
          <Bookmark className="w-6 h-6 text-zinc-900" />
        </button>
      </div>

      {/* Likes */}
      <div className="px-3 pb-1">
        <p className="font-semibold text-[13px] text-zinc-900">
          1,234 likes
        </p>
      </div>

      {/* Caption */}
      <div className="px-3 pb-2">
        <p
          dir={textDirection}
          className={`text-[13px] text-zinc-900 whitespace-pre-wrap ${
            textDirection === "rtl" ? "text-right" : "text-left"
          }`}
        >
          <span className="font-semibold hover:opacity-60 cursor-pointer mr-1">
            {displayHandle}
          </span>
          {displayContent}
          {shouldTruncate && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-zinc-400 hover:text-zinc-600 ml-1"
            >
              more
            </button>
          )}
        </p>
      </div>

      {/* Comments link */}
      <div className="px-3 pb-2">
        <button className="text-[13px] text-zinc-400 hover:text-zinc-600">
          View all 24 comments
        </button>
      </div>

      {/* Timestamp */}
      <div className="px-3 pb-3">
        <span className="text-[10px] text-zinc-400 uppercase tracking-wide">
          Just now
        </span>
      </div>
    </div>
  );
}
