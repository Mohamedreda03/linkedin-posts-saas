"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  MoreHorizontal,
  Globe,
  ThumbsUp,
  MessageCircle,
  Repeat2,
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
    <div className="w-[400px] border-l border-primary/10 bg-[#f3f2ef] overflow-hidden flex flex-col">
      {/* Preview Header */}
      <div className="p-4 bg-white border-b border-primary/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#C76A00]" />
          <span className="font-semibold text-sm text-[#2e2e2e]">
            LinkedIn Preview
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="text-[#2e2e2e] hover:bg-[#2e2e2e]/10 rounded-none h-8"
        >
          <Copy className="w-4 h-4 mr-1.5" />
          Copy
        </Button>
      </div>

      {/* LinkedIn Post Preview */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Post Header */}
          <div className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="w-12 h-12 border-2 border-white shadow-md">
                <AvatarImage src={authorImage || ""} />
                <AvatarFallback className="bg-linear-to-br from-[#2e2e2e] to-[#3b3b3b] text-white font-bold">
                  {authorName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">
                      {authorName || "Your Name"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Professional Title • 1st
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <span>Just now</span>
                      <span>•</span>
                      <Globe className="w-3 h-3" />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-gray-400"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="mt-4">
              {content ? (
                <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {content}
                </div>
              ) : (
                <div className="text-sm text-gray-400 italic">
                  Your post preview will appear here...
                </div>
              )}
            </div>
          </div>

          {/* Engagement Stats */}
          <div className="px-4 py-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="flex -space-x-1">
                  <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                    <ThumbsUp className="w-2.5 h-2.5 text-white" />
                  </div>
                  <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                    <span className="text-[8px]">❤️</span>
                  </div>
                </div>
                <span>0</span>
              </div>
              <span>0 comments • 0 reposts</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-2 py-1 border-t border-gray-100">
            <div className="flex items-center justify-between">
              {[
                { icon: ThumbsUp, label: "Like" },
                { icon: MessageCircle, label: "Comment" },
                { icon: Repeat2, label: "Repost" },
                { icon: Send, label: "Send" },
              ].map((action) => (
                <button
                  key={action.label}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-gray-600 hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  <action.icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pro Badge */}
        <div className="mt-4 text-center">
          <Badge className="bg-linear-to-r from-[#C76A00] to-[#E67E00] text-white text-[10px] font-bold border-0">
            PostCraft Pro Preview
          </Badge>
        </div>
      </div>
    </div>
  );
}
