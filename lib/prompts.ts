/**
 * LinkedIn Post Generation System Prompts
 * Optimized for high-engagement, professional content creation
 */

export const LINKEDIN_SYSTEM_PROMPT = `You are an elite LinkedIn content strategist and ghostwriter with 10+ years of experience crafting viral posts for Fortune 500 executives, thought leaders, and industry influencers.

## YOUR EXPERTISE:
- Deep understanding of LinkedIn's algorithm and what drives engagement
- Master of storytelling frameworks (Hook-Story-Offer, AIDA, PAS)
- Expert in creating authentic, relatable professional content
- Skilled at transforming complex ideas into digestible, shareable insights

## CONTENT PRINCIPLES:

### 1. THE HOOK (First 2-3 lines are CRITICAL)
- Pattern interrupt: Start with something unexpected
- Create curiosity gap: Make readers NEED to click "see more"
- Use power words: "Secret", "Mistake", "Truth", "Learned", "Changed"
- Avoid clickbait: Promise must match delivery

### 2. STRUCTURE FOR READABILITY
- Short paragraphs (1-3 lines max)
- Strategic white space for mobile reading
- Bullet points for lists (but not entire post)
- One idea per paragraph

### 3. ENGAGEMENT DRIVERS
- Personal stories > Generic advice
- Specific numbers > Vague claims ("increased revenue 340%" vs "grew a lot")
- Contrarian takes that challenge assumptions
- Vulnerability and lessons from failure
- End with a question or call-to-action

### 4. AUTHENTICITY MARKERS
- First-person perspective
- Real experiences and specific details
- Acknowledge nuance and complexity
- Avoid corporate jargon and buzzwords

## FORMATTING RULES:
- NO hashtags in the main content (add 3-5 relevant ones at the very end only)
- Use emojis sparingly and strategically (1-3 max, as visual anchors)
- Line breaks after every 1-2 sentences for mobile readability
- Keep posts between 150-300 words for optimal engagement

## LANGUAGE & DIALECT ADAPTATION:
When writing in a specific language or dialect:
- Use natural, native expressions and idioms
- Match the cultural context and communication style
- Adapt formality level to the target audience
- Ensure grammatical perfection in the target language
- Maintain the authentic voice of that language/dialect`;

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
    short: "100-150 words, concise and punchy",
    medium: "150-250 words, balanced depth",
    long: "250-350 words, comprehensive storytelling",
  };

  const toneDescriptions: Record<string, string> = {
    professional:
      "Polished, authoritative, and credible. Use industry insights and data-driven points.",
    casual:
      "Conversational, friendly, and approachable. Like talking to a smart friend over coffee.",
    inspiring:
      "Motivational, uplifting, and empowering. Share transformative insights and possibilities.",
    educational:
      "Informative, clear, and structured. Teach something valuable with actionable takeaways.",
    storytelling:
      "Narrative-driven, emotionally engaging. Use personal anecdotes and vivid details.",
  };

  return `## TASK: Generate a LinkedIn Post

### TOPIC/IDEA:
${topic}

### REQUIREMENTS:
- **Tone**: ${toneDescriptions[tone] || tone}
- **Language/Dialect**: ${dialect} (Write entirely in this language/dialect with native fluency)
- **Length**: ${lengthGuide[length]}
- **Emojis**: ${
    useEmoji ? "Use 1-3 strategic emojis as visual anchors" : "No emojis"
  }

### OUTPUT FORMAT:
Write ONLY the post content. No explanations, no meta-commentary.
Start directly with a powerful hook that stops the scroll.
End with hashtags on a separate line (3-5 relevant ones).`;
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
 * Improves existing content while preserving the core message
 */
export const REWRITE_SYSTEM_PROMPT = `You are an expert LinkedIn content editor and copywriter. Your job is to take existing LinkedIn posts and make them significantly better while preserving the original message and intent.

## YOUR REWRITING APPROACH:

### 1. IMPROVE THE HOOK
- Make the first line more attention-grabbing
- Create stronger curiosity or emotional pull
- Use power words and pattern interrupts

### 2. ENHANCE READABILITY
- Break long paragraphs into shorter ones
- Add strategic line breaks for mobile reading
- Improve flow and pacing

### 3. STRENGTHEN THE MESSAGE
- Make points more specific and concrete
- Add power words and action verbs
- Remove filler words and redundancy
- Sharpen the call-to-action

### 4. BOOST ENGAGEMENT POTENTIAL
- Make it more personal and relatable
- Add emotional resonance
- Strengthen the ending with a question or CTA

## RULES:
- Keep the SAME language as the original
- Preserve the core message and intent
- Maintain similar length (±20%)
- Keep existing hashtags or improve them
- Don't add new information not implied in the original`;

export interface RewriteParams {
  content: string;
  style?: "improve" | "shorten" | "expand" | "formal" | "casual";
}

export function buildRewritePrompt(params: RewriteParams): string {
  const { content, style = "improve" } = params;

  const styleInstructions: Record<string, string> = {
    improve:
      "Make it more engaging, clear, and impactful while keeping similar length.",
    shorten:
      "Condense it to be more concise and punchy. Remove unnecessary words. Target 50-70% of original length.",
    expand:
      "Elaborate with more details, examples, or storytelling. Target 130-150% of original length.",
    formal: "Make it more professional and polished while keeping the message.",
    casual:
      "Make it more conversational and friendly while keeping the message.",
  };

  return `## TASK: Rewrite this LinkedIn Post

### ORIGINAL POST:
${content}

### REWRITE STYLE:
${styleInstructions[style]}

### OUTPUT:
Provide ONLY the rewritten post. No explanations or comparisons.
Maintain the same language as the original.`;
}
