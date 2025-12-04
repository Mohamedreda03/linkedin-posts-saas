"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Sparkles } from "lucide-react";
import { AIPanelProps } from "./types";

const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "inspiring", label: "Inspiring" },
  { value: "educational", label: "Educational" },
  { value: "storytelling", label: "Storytelling" },
];

export function AIPanel({
  isOpen,
  topic,
  tone,
  isGenerating,
  onTopicChange,
  onToneChange,
  onGenerate,
}: AIPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="border-b border-[#2e2e2e]/20 bg-[#f8f8f8] overflow-hidden animate-in slide-in-from-top duration-300">
      <div className="p-5">
        {/* Panel Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-[#2e2e2e] rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#2e2e2e] text-sm">
              AI Content Generator
            </h3>
            <p className="text-xs text-muted-foreground">
              Describe your topic and let AI create engaging content
            </p>
          </div>
        </div>

        {/* Topic Input */}
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-[#2e2e2e]">
              Topic or Idea
            </Label>
            <Input
              placeholder="e.g., Tips for remote work productivity..."
              value={topic}
              onChange={(e) => onTopicChange(e.target.value)}
              className="border-[#2e2e2e]/20 focus:border-[#2e2e2e] focus:ring-[#2e2e2e]/20 rounded-none h-10 bg-white placeholder:text-[#9ca3af]"
            />
          </div>

          {/* Tone Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-[#2e2e2e]">Tone</Label>
            <div className="flex flex-wrap gap-2">
              {toneOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onToneChange(option.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-none transition-all ${
                    tone === option.value
                      ? "bg-[#2e2e2e] text-white"
                      : "bg-white border border-[#2e2e2e]/20 text-[#2e2e2e] hover:border-[#2e2e2e]/40"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={onGenerate}
            disabled={isGenerating || !topic.trim()}
            className="w-full bg-[#2e2e2e] hover:bg-[#3b3b3b] text-white rounded-none h-10 font-medium transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Spinner size="sm" className="text-white mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
