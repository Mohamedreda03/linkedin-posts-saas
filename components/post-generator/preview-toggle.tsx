"use client";

import { Button } from "@/components/ui/button";
import { Maximize2, LayoutTemplate } from "lucide-react";
import { PreviewToggleProps } from "./types";

export function PreviewToggle({ showPreview, setShowPreview }: PreviewToggleProps) {
  return (
    <div className="absolute bottom-8 right-8 z-20">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setShowPreview(!showPreview)}
        className="rounded-full shadow-xl w-12 h-12 bg-white border-primary/20 hover:bg-primary/5 hover:border-[#2e2e2e] hover:scale-110 transition-all duration-300"
      >
        {showPreview ? (
          <Maximize2 className="w-5 h-5 text-[#2e2e2e]" />
        ) : (
          <LayoutTemplate className="w-5 h-5 text-[#2e2e2e]" />
        )}
      </Button>
    </div>
  );
}
