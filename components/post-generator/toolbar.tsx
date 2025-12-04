"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, X, RefreshCw, Flame, SpellCheck } from "lucide-react";
import { ToolbarProps } from "./types";

export function Toolbar({
  isDialogOpen,
  charCount,
  wordCount,
  onToggleAI,
  onRewrite,
}: ToolbarProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-primary/10 bg-white/80 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        {/* AI Toggle Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleAI}
          className={`rounded-none font-medium transition-all h-9 px-4 ${
            isDialogOpen
              ? "bg-[#1e1e1e] text-white border-[#1e1e1e] hover:bg-[#2a2a2a] hover:text-white hover:border-[#2a2a2a]"
              : "bg-[#2e2e2e] text-white border-[#2e2e2e] hover:bg-[#3b3b3b] hover:text-white hover:border-[#3b3b3b]"
          }`}
        >
          {isDialogOpen ? (
            <>
              <X className="w-4 h-4 mr-1.5" />
              Close AI
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-1.5" />
              AI
            </>
          )}
        </Button>

        {/* Rewrite Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRewrite}
          className="border-[#2e2e2e]/30 text-[#2e2e2e] hover:bg-[#2e2e2e] hover:text-white hover:border-[#2e2e2e] rounded-none font-medium h-9 px-4 transition-all"
        >
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Rewrite
        </Button>

        {/* Viral Hook Button */}
        <Button
          variant="outline"
          size="sm"
          className="border-[#C76A00]/30 text-[#C76A00] hover:bg-[#C76A00] hover:text-white hover:border-[#C76A00] rounded-none font-medium h-9 px-4 transition-all"
        >
          <Flame className="w-4 h-4 mr-1.5" />
          Viral Hook
        </Button>

        {/* Fix Grammar Button */}
        <Button
          variant="outline"
          size="sm"
          className="border-[#2e2e2e]/30 text-[#2e2e2e] hover:bg-[#2e2e2e] hover:text-white hover:border-[#2e2e2e] rounded-none font-medium h-9 px-4 transition-all"
        >
          <SpellCheck className="w-4 h-4 mr-1.5" />
          Fix Grammar
        </Button>
      </div>

      {/* Character/Word Count */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span
          className={`font-medium ${charCount > 2800 ? "text-red-500" : ""}`}
        >
          {charCount}/3000
        </span>
        <span className="text-primary/30">•</span>
        <span>{wordCount} words</span>
      </div>
    </div>
  );
}
