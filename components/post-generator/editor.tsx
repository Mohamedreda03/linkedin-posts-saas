"use client";

import { Textarea } from "@/components/ui/textarea";
import { EditorProps } from "./types";

export function Editor({ content, onChange, textareaRef }: EditorProps) {
  return (
    <div className="flex-1 p-6 bg-white overflow-y-auto">
      <Textarea
        ref={textareaRef}
        placeholder="Start writing your LinkedIn post here...

Share your thoughts, insights, or stories. Use AI to help you generate engaging content.

Tips for a great post:
• Start with a hook to grab attention
• Share personal experiences or insights  
• End with a question or call to action"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[400px] resize-none border-0 focus-visible:ring-0 text-base leading-relaxed bg-transparent p-0 placeholder:text-[#9ca3af] placeholder:leading-relaxed"
      />
    </div>
  );
}
