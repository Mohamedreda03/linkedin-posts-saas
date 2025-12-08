import { SocialAccount, SocialPlatform } from "@/lib/appwrite";
import { Models } from "appwrite";

// Common types used across post-generator components
export interface PostGeneratorState {
  content: string;
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
}

export interface HeaderProps {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  isPosting: boolean;
  hasContent: boolean;
  onPublish: () => void;
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
