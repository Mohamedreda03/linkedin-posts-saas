"use client";

import { useEffect } from "react";
import { EditorAreaProps } from "./types";
import { cn } from "@/lib/utils";

export function EditorArea({
  content,
  setContent,
  textDirection,
  textareaRef,
  activePlatform,
}: EditorAreaProps) {
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [content, textareaRef]);

  const getCharacterLimit = (platform?: string) => {
    switch (platform) {
      case "twitter": return 280;
      case "instagram": return 2200;
      case "linkedin": return 3000;
      default: return 0;
    }
  };

  const limit = getCharacterLimit(activePlatform);
  const isOverLimit = limit > 0 && content.length > limit;
  const remaining = limit > 0 ? limit - content.length : 0;

  return (
    <div className="flex-1 overflow-y-auto bg-white/60 relative">
      <div className="max-w-4xl mx-auto py-6 px-6 pb-12">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start typing here..."
          dir={textDirection}
          className={`w-full min-h-full resize-none bg-transparent border-none focus:ring-0 focus:outline-none text-lg leading-relaxed text-foreground placeholder:text-muted-foreground/20 placeholder:font-normal placeholder:italic overflow-hidden ${
            textDirection === "rtl" ? "text-right" : "text-left"
          }`}
          spellCheck={false}
        />
      </div>
      
      {limit > 0 && (
        <div className="absolute bottom-4 right-6 pointer-events-none">
          <div className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md border shadow-sm transition-colors",
            isOverLimit 
              ? "bg-red-50/90 text-red-600 border-red-200" 
              : remaining < 20 
                ? "bg-amber-50/90 text-amber-600 border-amber-200"
                : "bg-white/90 text-zinc-500 border-zinc-200"
          )}>
            {remaining} chars remaining
          </div>
        </div>
      )}
    </div>
  );
}
