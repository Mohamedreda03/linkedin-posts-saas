"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Sparkles,
  RefreshCw,
  Zap,
  Wand2,
  ChevronDown,
  ChevronsUpDown,
  Maximize2,
  LayoutTemplate,
  History,
  Settings,
  Check,
  X,
  Copy,
  Linkedin,
} from "lucide-react";
import { LinkedInPreview } from "./linkedin-preview";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Header } from "./post-generator/header";
import { DIALECT_OPTIONS } from "@/lib/prompts";
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

export function PostGenerator() {
  const { data: session, status } = useSession();
  const [content, setContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // AI Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [dialect, setDialect] = useState("en-us");
  const [dialectOpen, setDialectOpen] = useState(false);
  const [postLength, setPostLength] = useState<"short" | "medium" | "long">(
    "medium"
  );
  const [isRewriting, setIsRewriting] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Detect if text is Arabic (RTL)
  const isRTL = (text: string) => {
    const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    return arabicPattern.test(text.trim().charAt(0));
  };

  const textDirection = isRTL(content) ? "rtl" : "ltr";

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [content]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          tone,
          dialect,
          length: postLength,
          useEmoji: true,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      const draft = data.posts[0]?.content || "";
      setContent(draft);
      setIsDialogOpen(false);
      toast.success("Draft created!");
    } catch {
      toast.error("Failed to generate draft");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRewrite = async () => {
    if (!content.trim()) {
      toast.error("Write some content first to rewrite");
      return;
    }

    setIsRewriting(true);
    try {
      const response = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, style: "improve" }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setContent(data.rewrittenContent);
      toast.success("Post rewritten successfully!");
    } catch {
      toast.error("Failed to rewrite post");
    } finally {
      setIsRewriting(false);
    }
  };

  const handlePublish = async () => {
    if (!content.trim()) return;
    setIsPosting(true);
    try {
      const response = await fetch("/api/linkedin/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error("Failed to post");
      toast.success("Published to LinkedIn!");
    } catch {
      toast.error("Failed to publish");
    } finally {
      setIsPosting(false);
    }
  };

  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-linear-to-br from-[#f8fafc] via-[#fafafa] to-[#f4f4f5]">
      {/* Header Component */}
      <Header
        session={session}
        status={status}
        isPosting={isPosting}
        hasContent={content.trim().length > 0}
        onPublish={handlePublish}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Editor Area */}
        <div
          className={`flex-1 flex flex-col relative transition-all duration-500 ease-out ${
            showPreview ? "w-1/2" : "w-full"
          }`}
        >
          {/* Toolbar */}
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
                onClick={handleRewrite}
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

          {/* AI Inline Expandable Panel */}
          <div
            className={`
              overflow-hidden transition-all duration-400 ease-out
              ${
                isDialogOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
              }
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
                      onClick={() => setIsDialogOpen(false)}
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
                    {[
                      {
                        value: "professional",
                        label: "Professional",
                        icon: "💼",
                      },
                      { value: "casual", label: "Casual", icon: "😊" },
                      {
                        value: "storytelling",
                        label: "Storytelling",
                        icon: "📖",
                      },
                      {
                        value: "educational",
                        label: "Educational",
                        icon: "🎓",
                      },
                      { value: "inspiring", label: "Inspiring", icon: "✨" },
                    ].map((t) => (
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
                                {
                                  DIALECT_OPTIONS.find(
                                    (d) => d.value === dialect
                                  )?.flag
                                }
                              </span>
                              <span className="text-gray-700">
                                {
                                  DIALECT_OPTIONS.find(
                                    (d) => d.value === dialect
                                  )?.label
                                }
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
                                  <span className="text-base">
                                    {option.flag}
                                  </span>
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
                      {[
                        { value: "short", label: "Short" },
                        { value: "medium", label: "Medium" },
                        { value: "long", label: "Long" },
                      ].map((len) => (
                        <button
                          key={len.value}
                          type="button"
                          onClick={() =>
                            setPostLength(
                              len.value as "short" | "medium" | "long"
                            )
                          }
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
                    onClick={handleGenerate}
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

          {/* Text Editor */}
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

          {/* Toggle Preview Button */}
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
        </div>

        {/* Live Preview Pane */}
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
                authorName={session?.user?.name || "Your Name"}
                authorImage={session?.user?.image || undefined}
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
      </div>
    </div>
  );
}
