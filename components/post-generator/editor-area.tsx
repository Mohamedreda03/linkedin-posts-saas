"use client";

import { useEffect } from "react";
import { EditorAreaProps } from "./types";

export function EditorArea({
  content,
  setContent,
  textDirection,
  textareaRef,
}: EditorAreaProps) {
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [content, textareaRef]);

  return (
    <div className="flex-1 overflow-y-auto bg-white/60">
      <div className="max-w-3xl mx-auto py-12 px-8">
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
    </div>
  );
}
