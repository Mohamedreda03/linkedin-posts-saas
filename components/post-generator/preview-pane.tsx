"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Linkedin, Copy } from "lucide-react";
import { toast } from "sonner";
import { LinkedInPreview } from "../linkedin-preview";
import { PreviewPaneProps } from "./types";

export function PreviewPane({ showPreview, content, user }: PreviewPaneProps) {
  return (
    <div
      className={`
        border-l border-primary/10 bg-linear-to-b from-[#fafafa] to-[#f8fafc] transition-all duration-500 ease-out flex flex-col
        ${
          showPreview
            ? "w-[480px] translate-x-0 opacity-100"
            : "w-0 translate-x-full opacity-0 overflow-hidden"
        }
      `}
    >
      <div className="h-14 border-b border-primary/10 flex items-center justify-between px-6 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Live Preview
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-[#2e2e2e]/10 text-[#2e2e2e] border-[#2e2e2e]/20 font-medium">
            <Linkedin className="w-3 h-3 mr-1" />
            Feed
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(content);
              toast.success("Copied to clipboard!");
            }}
            className="text-muted-foreground hover:text-[#2e2e2e] hover:bg-[#2e2e2e]/10"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
        <div className="w-full max-w-[400px] space-y-4">
          <LinkedInPreview
            content={
              content ||
              "Your post content will appear here as you type...\n\nStart writing to see the magic happen! "
            }
            authorName={user?.name || "Your Name"}
            authorImage={undefined}
            authorHeadline="Creator & Thought Leader"
          />

          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground">
              This is how your post will look in the LinkedIn feed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
