"use client";

import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { PreviewToggleProps } from "./types";

export function PreviewToggle({ showPreview, onToggle }: PreviewToggleProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className="border-[#2e2e2e]/30 text-[#2e2e2e] hover:bg-[#2e2e2e] hover:text-white hover:border-[#2e2e2e] rounded-none font-medium h-9 px-4 transition-all"
    >
      {showPreview ? (
        <>
          <EyeOff className="w-4 h-4 mr-1.5" />
          Hide Preview
        </>
      ) : (
        <>
          <Eye className="w-4 h-4 mr-1.5" />
          Show Preview
        </>
      )}
    </Button>
  );
}
