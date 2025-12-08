"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { X, Wand2, ChevronsUpDown, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { DIALECT_OPTIONS } from "@/lib/prompts";
import { AIPanelProps, TONE_OPTIONS, LENGTH_OPTIONS } from "./types";

export function AIPanel({
  isOpen,
  onClose,
  topic,
  setTopic,
  tone,
  setTone,
  dialect,
  setDialect,
  dialectOpen,
  setDialectOpen,
  postLength,
  setPostLength,
  isGenerating,
  onGenerate,
}: AIPanelProps) {
  return (
    <div
      className={`
        overflow-hidden transition-all duration-400 ease-out
        ${isOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"}
      `}
    >
      <div className="bg-linear-to-r from-[#fafafa] via-white to-[#f4f4f5] border-b border-[#2e2e2e]/10">
        <div className="max-w-4xl mx-auto p-6 space-y-4">
          {/* Row 1: Topic Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-foreground">
                What&apos;s your topic?
              </Label>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-7 w-7 rounded-full hover:bg-red-50 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <Textarea
              placeholder="e.g., 3 lessons from scaling my startup to $1M ARR..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="min-h-20 text-base resize-none rounded-none border border-gray-200 focus:border-[#2e2e2e] focus:ring-1 focus:ring-[#2e2e2e]/20 bg-white placeholder:text-gray-400"
            />
          </div>

          {/* Row 2: Style Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              Style
            </Label>
            <div className="flex gap-2">
              {TONE_OPTIONS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTone(t.value)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-none border transition-all duration-150
                    ${
                      tone === t.value
                        ? "border-[#2e2e2e] bg-[#2e2e2e] text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                    }
                  `}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Language, Length, and Generate Button */}
          <div className="flex items-end gap-3">
            {/* Language / Dialect */}
            <div className="flex-1 space-y-2">
              <Label className="text-sm font-semibold text-foreground">
                Language
              </Label>
              <Popover open={dialectOpen} onOpenChange={setDialectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={dialectOpen}
                    className="w-full h-10 justify-between rounded-none border border-gray-200 hover:border-gray-400 hover:bg-gray-50 bg-white text-sm font-medium transition-colors duration-150"
                  >
                    {dialect ? (
                      <span className="flex items-center gap-2">
                        <span>
                          {DIALECT_OPTIONS.find((d) => d.value === dialect)?.flag}
                        </span>
                        <span className="text-gray-700">
                          {DIALECT_OPTIONS.find((d) => d.value === dialect)?.label}
                        </span>
                      </span>
                    ) : (
                      <span className="text-gray-500">Select...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-gray-400" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[250px] p-0 rounded-none border border-gray-200 bg-white shadow-lg"
                  align="start"
                  sideOffset={4}
                >
                  <Command className="bg-white rounded-none">
                    <CommandInput
                      placeholder="Search language..."
                      className="h-9 border-b border-gray-100 rounded-none text-sm"
                    />
                    <CommandList className="max-h-[200px] overflow-auto">
                      <CommandEmpty className="py-3 text-center text-sm text-gray-500">
                        No language found.
                      </CommandEmpty>
                      <CommandGroup>
                        {DIALECT_OPTIONS.map((option) => (
                          <CommandItem
                            key={option.value}
                            value={`${option.label} ${option.value}`}
                            onSelect={() => {
                              setDialect(option.value);
                              setDialectOpen(false);
                            }}
                            className="flex items-center gap-2 cursor-pointer py-2 px-3 text-gray-700 hover:bg-gray-50 data-[selected=true]:bg-gray-100 rounded-none text-sm"
                          >
                            <span className="text-base">{option.flag}</span>
                            <span>{option.label}</span>
                            {dialect === option.value && (
                              <Check className="ml-auto h-4 w-4 text-gray-600" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Post Length */}
            <div className="flex-1 space-y-2">
              <Label className="text-sm font-semibold text-foreground">
                Length
              </Label>
              <div className="flex h-10 rounded-none border border-gray-200 overflow-hidden">
                {LENGTH_OPTIONS.map((len) => (
                  <button
                    key={len.value}
                    type="button"
                    onClick={() => setPostLength(len.value)}
                    className={`flex-1 text-sm font-medium transition-colors duration-150
                      ${
                        postLength === len.value
                          ? "bg-[#2e2e2e] text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      }
                    `}
                  >
                    {len.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={onGenerate}
              disabled={isGenerating || !topic.trim()}
              className="h-10 px-8 bg-[#1e1e1e] hover:bg-[#2c2c2c] text-white rounded-none font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
