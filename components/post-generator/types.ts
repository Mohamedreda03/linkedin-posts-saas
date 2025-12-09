import { SocialAccount, SocialPlatform } from "@/lib/appwrite";
import { PlatformContent } from "@/lib/types/post";

// Save status type
export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

// Common types used across post-generator components
export interface PostGeneratorState {
  content: string;
  platformContent: PlatformContent;
  isGenerating: boolean;
  isPosting: boolean;
  showPreview: boolean;
  linkedInAccount: SocialAccount | null;
  isLoadingAccount: boolean;
  isDialogOpen: boolean;
  topic: string;
  tone: string;
  dialect: string;
  dialectOpen: boolean;
  postLength: "short" | "medium" | "long";
  isRewriting: boolean;
  postId: string | null;
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
}

export interface HeaderProps {
  isPosting: boolean;
  hasContent: boolean;
  topic: string;
  onTopicChange: (topic: string) => void;
  onTopicBlur: () => void;
  onPublish: () => void;
  onSaveDraft: () => void;
  onSchedule: () => void;
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  onBack: () => void;
  // Platform selector props
  selectedPlatforms: SocialPlatform[];
  onPlatformToggle: (platform: SocialPlatform) => void;
  connectedAccounts: SocialAccount[];
  isLoadingAccounts?: boolean;
}

export interface ToolbarProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  isRewriting: boolean;
  content: string;
  onRewrite: () => void;
  charCount: number;
  wordCount: number;
}

export interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  setTopic: (topic: string) => void;
  tone: string;
  setTone: (tone: string) => void;
  dialect: string;
  setDialect: (dialect: string) => void;
  dialectOpen: boolean;
  setDialectOpen: (open: boolean) => void;
  postLength: "short" | "medium" | "long";
  setPostLength: (length: "short" | "medium" | "long") => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

export interface EditorAreaProps {
  content: string;
  setContent: (content: string) => void;
  textDirection: "rtl" | "ltr";
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  activePlatform?: SocialPlatform;
}

export interface PreviewPaneProps {
  showPreview: boolean;
  content: string;
  user: Models.User<Models.Preferences> | null;
}

export interface AccountStatusBarProps {
  linkedInAccount: SocialAccount | null;
  isLoadingAccount: boolean;
  workspaceId: string;
  workspaceName: string;
}

export interface PreviewToggleProps {
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
}

export interface ScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (scheduledAt: string) => void;
  isScheduling: boolean;
}

// Style options for AI generation
export const TONE_OPTIONS = [
  { value: "professional", label: "Professional", icon: "💼" },
  { value: "casual", label: "Casual", icon: "😊" },
  { value: "storytelling", label: "Storytelling", icon: "📖" },
  { value: "educational", label: "Educational", icon: "🎓" },
  { value: "inspiring", label: "Inspiring", icon: "✨" },
];

export const LENGTH_OPTIONS = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
] as const;
