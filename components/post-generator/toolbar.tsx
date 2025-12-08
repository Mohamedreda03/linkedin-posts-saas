"use client";

import { Button } from "@/components/ui/button";
import {
  Sparkles,
  RefreshCw,
  Zap,
  Wand2,
  ChevronDown,
  History,
  Settings,
} from "lucide-react";
import { ToolbarProps } from "./types";

export function Toolbar({
  isDialogOpen,
  setIsDialogOpen,
  isRewriting,
  content,
  onRewrite,
  charCount,
  wordCount,
}: ToolbarProps) {
  return (
    <div className="h-14 border-b border-primary/10 flex items-center px-6 gap-2 bg-white/80 backdrop-blur-sm z-10 shadow-sm">
      <Button
        onClick={() => setIsDialogOpen(!isDialogOpen)}
        className={`inline-flex items-center px-5 py-2 h-10 gap-2 font-bold rounded-none transition-colors duration-200 select-none border border-[#2b2b2b] ${
          isDialogOpen
            ? "bg-[#e5e5e5] text-[#101010] hover:bg-[#d4d4d4]"
            : "bg-[#1f1f1f] text-white hover:bg-[#2a2a2a] shadow-md"
        }`}
        aria-expanded={isDialogOpen}
      >
        <Sparkles className="w-4 h-4" />
        <span className="whitespace-nowrap text-xs uppercase tracking-wider">
          {isDialogOpen ? "Close AI" : "AI"}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 ml-1 ${
            isDialogOpen ? "rotate-180" : ""
          }`}
        />
      </Button>

      <div className="w-px h-8 bg-primary/10 mx-3" />

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          onClick={onRewrite}
          disabled={isRewriting || !content.trim()}
          className={`gap-2 font-medium transition-all duration-200 ${
            isRewriting
              ? "text-[#2e2e2e] bg-[#2e2e2e]/10"
              : "text-muted-foreground hover:text-[#2e2e2e] hover:bg-[#2e2e2e]/10"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <RefreshCw
            className={`w-4 h-4 transition-transform ${
              isRewriting ? "animate-spin" : ""
            }`}
          />
          {isRewriting ? "Rewriting..." : "Rewrite"}
        </Button>
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-[#C76A00] hover:bg-[#C76A00]/10 gap-2 font-medium"
        >
          <Zap className="w-4 h-4" />
          Viral Hook
        </Button>
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 gap-2 font-medium"
        >
          <Wand2 className="w-4 h-4" />
          Fix Grammar
        </Button>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Character Counter */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full">
          <span
            className={`text-xs font-semibold ${
              charCount > 3000
                ? "text-red-500"
                : charCount > 2500
                ? "text-[#C76A00]"
                : "text-muted-foreground"
            }`}
          >
            {charCount.toLocaleString()} chars
          </span>
          <span className="text-muted-foreground/40"></span>
          <span className="text-xs font-medium text-muted-foreground">
            {wordCount} words
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-primary/10"
        >
          <History className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-primary/10"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
