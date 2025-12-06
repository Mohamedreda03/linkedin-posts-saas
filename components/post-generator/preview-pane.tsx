"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Copy,
  MoreHorizontal,
  Globe,
  ThumbsUp,
  MessageSquare,
  Repeat,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { PreviewPaneProps } from "./types";

export function PreviewPane({
  isVisible,
  content,
  authorName,
  authorImage,
  onCopy,
}: PreviewPaneProps) {
  if (!isVisible) return null;

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      toast.success("Content copied to clipboard!");
      onCopy?.();
    }
  };

  return (
    <div className="w-[400px] border-l border-border bg-[#f3f2ef] dark:bg-black flex flex-col h-full">
      {/* Tool Header */}
      <div className="p-4 bg-background border-b flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600" />
          <span className="font-semibold text-sm">Live Preview</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="h-8 gap-2"
        >
          <Copy className="w-3.5 h-3.5" />
          Copy Text
        </Button>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* LinkedIn Post Card */}
        <div className="bg-white dark:bg-[#1b1f23] rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden shadow-sm">
          {/* Post Header */}
          <div className="p-3 flex gap-3">
            <Avatar className="w-12 h-12 cursor-pointer">
              <AvatarImage src={authorImage || ""} />
              <AvatarFallback className="bg-blue-600 text-white font-semibold">
                {authorName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-gray-900 dark:text-white hover:text-blue-600 hover:underline cursor-pointer truncate">
                    {authorName || "Your Name"}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    Content Creator | LinkedIn Enthusiast
                  </span>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    <span>Just now</span>
                    <span>•</span>
                    <Globe className="w-3 h-3" />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="px-4 pb-2">
            {content ? (
              <div
                className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed break-words"
                dir="auto"
              >
                {content}
              </div>
            ) : (
              <div className="text-sm text-gray-400 italic py-8 text-center">
                Start writing to see your preview here...
              </div>
            )}
          </div>

          {/* Engagement Stats */}
          <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600 hover:underline">
              <div className="flex -space-x-1">
                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center z-20 ring-2 ring-white dark:ring-[#1b1f23]">
                  <ThumbsUp className="w-2.5 h-2.5 text-white fill-current" />
                </div>
                <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center z-10 ring-2 ring-white dark:ring-[#1b1f23]">
                  <span className="text-[8px] text-white">❤️</span>
                </div>
                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center ring-2 ring-white dark:ring-[#1b1f23]">
                  <span className="text-[8px] text-white">👏</span>
                </div>
              </div>
              <span className="ml-1">124</span>
            </div>
            <div className="flex gap-2">
              <span className="hover:text-blue-600 hover:underline cursor-pointer">
                42 comments
              </span>
              <span>•</span>
              <span className="hover:text-blue-600 hover:underline cursor-pointer">
                12 reposts
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-2 py-1 flex items-center justify-between">
            <Button
              variant="ghost"
              className="flex-1 gap-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md h-12"
            >
              <ThumbsUp className="w-5 h-5" />
              <span className="font-semibold text-sm">Like</span>
            </Button>
            <Button
              variant="ghost"
              className="flex-1 gap-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md h-12"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="font-semibold text-sm">Comment</span>
            </Button>
            <Button
              variant="ghost"
              className="flex-1 gap-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md h-12"
            >
              <Repeat className="w-5 h-5" />
              <span className="font-semibold text-sm">Repost</span>
            </Button>
            <Button
              variant="ghost"
              className="flex-1 gap-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md h-12"
            >
              <Send className="w-5 h-5" />
              <span className="font-semibold text-sm">Send</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
