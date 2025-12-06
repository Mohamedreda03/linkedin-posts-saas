/**
 * LinkedIn Post Generation System Prompts
 * Optimized for high-efficiency and low token usage
 */

export const LINKEDIN_SYSTEM_PROMPT = `Role: Expert LinkedIn Ghostwriter.
Goal: Create viral, high-engagement professional posts.

CORE RULES:
1. HOOK: First 2 lines must grab attention (pattern interrupt, curiosity, strong statement).
2. FORMAT: Short paragraphs (1-3 lines). White space for mobile. Bullet points for lists.
3. CONTENT: Specific numbers, personal stories, contrarian takes. No corporate jargon.
4. STYLE: Authentic, first-person, relatable.
5. LENGTH: 150-300 words.

STRICT CONSTRAINTS:
- NO hashtags in body (only 3-5 at end).
- Max 3 emojis.
- Native fluency in target language/dialect.
- One idea per paragraph.`;

export interface GenerationParams {
  topic: string;
  tone: string;
  dialect: string;
  length: "short" | "medium" | "long";
  useEmoji: boolean;
}

export function buildUserPrompt(params: GenerationParams): string {
  const { topic, tone, dialect, length, useEmoji } = params;

  const lengthGuide = {
    short: "100-150 words",
    medium: "150-250 words",
    long: "250-350 words",
  };

  const toneDescriptions: Record<string, string> = {
    professional: "Polished, authoritative, data-driven.",
    casual: "Conversational, friendly, like a smart friend.",
    inspiring: "Motivational, uplifting, transformative.",
    educational: "Informative, clear, actionable.",
    storytelling: "Narrative-driven, emotional, vivid.",
  };

  return `TASK: Generate LinkedIn Post
TOPIC: ${topic}
SPECS:
- Tone: ${toneDescriptions[tone] || tone}
- Lang: ${dialect} (Native fluency)
- Len: ${lengthGuide[length]}
- Emoji: ${useEmoji ? "1-3 max" : "None"}

OUTPUT: Post content ONLY. Start with Hook. End with hashtags.`;
}

export const DIALECT_OPTIONS = [
  { value: "en-us", label: "English (US)", flag: "🇺🇸" },
  { value: "en-uk", label: "English (UK)", flag: "🇬🇧" },
  { value: "ar-eg", label: "العربية (مصري)", flag: "🇪🇬" },
  { value: "ar-sa", label: "العربية (سعودي)", flag: "🇸🇦" },
  { value: "ar-gulf", label: "العربية (خليجي)", flag: "🇦🇪" },
  { value: "ar-leb", label: "العربية (لبناني)", flag: "🇱🇧" },
  { value: "ar-msa", label: "العربية (فصحى)", flag: "🌍" },
  { value: "fr-fr", label: "Français (France)", flag: "🇫🇷" },
  { value: "de-de", label: "Deutsch", flag: "🇩🇪" },
  { value: "es-es", label: "Español (España)", flag: "🇪🇸" },
  { value: "es-latam", label: "Español (Latinoamérica)", flag: "🇲🇽" },
  { value: "pt-br", label: "Português (Brasil)", flag: "🇧🇷" },
  { value: "hi-in", label: "हिंदी", flag: "🇮🇳" },
  { value: "zh-cn", label: "中文 (简体)", flag: "🇨🇳" },
  { value: "ja-jp", label: "日本語", flag: "🇯🇵" },
  { value: "ko-kr", label: "한국어", flag: "🇰🇷" },
  { value: "tr-tr", label: "Türkçe", flag: "🇹🇷" },
  { value: "ru-ru", label: "Русский", flag: "🇷🇺" },
  { value: "it-it", label: "Italiano", flag: "🇮🇹" },
  { value: "nl-nl", label: "Nederlands", flag: "🇳🇱" },
];

/**
 * Rewrite System Prompt
 * Optimized for efficiency
 */
export const REWRITE_SYSTEM_PROMPT = `Role: LinkedIn Content Editor.
Task: Rewrite posts to boost engagement while preserving core message.

OPTIMIZATION RULES:
1. HOOK: Make first line irresistible.
2. FLOW: Break long text. Use short, punchy sentences.
3. CLARITY: Remove fluff. Use power words.
4. ENGAGEMENT: Add emotional resonance. End with strong CTA/Question.

CONSTRAINTS:
- Keep original language.
- Maintain core meaning.
- No new info.
- Output ONLY the rewritten post.`;

export interface RewriteParams {
  content: string;
  style?: "improve" | "shorten" | "expand" | "formal" | "casual";
}

export function buildRewritePrompt(params: RewriteParams): string {
  const { content, style = "improve" } = params;

  const styleInstructions: Record<string, string> = {
    improve: "More engaging, clear, impactful.",
    shorten: "Condense to 50-70% length. Punchy.",
    expand: "Elaborate details. 130-150% length.",
    formal: "Professional, polished.",
    casual: "Conversational, friendly.",
  };

  return `TASK: Rewrite LinkedIn Post
ORIGINAL: ${content}
STYLE: ${styleInstructions[style]}
OUTPUT: Rewritten post ONLY. Same language.`;
}
