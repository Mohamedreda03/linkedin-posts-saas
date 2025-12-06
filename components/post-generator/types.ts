import { Models } from "appwrite";

export interface UserSession {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
}

export interface AIGenerationState {
  isDialogOpen: boolean;
  topic: string;
  tone: string;
  isGenerating: boolean;
}

export interface EditorState {
  content: string;
  charCount: number;
  wordCount: number;
}

export interface HeaderProps {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  isPosting: boolean;
  hasContent: boolean;
  onPublish: () => void;
}

export interface ToolbarProps {
  isDialogOpen: boolean;
  charCount: number;
  wordCount: number;
  onToggleAI: () => void;
  onRewrite: () => void;
}

export interface AIPanelProps {
  isOpen: boolean;
  topic: string;
  tone: string;
  isGenerating: boolean;
  onTopicChange: (topic: string) => void;
  onToneChange: (tone: string) => void;
  onGenerate: () => void;
  onClose: () => void;
}

export interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export interface PreviewPaneProps {
  isVisible: boolean;
  content: string;
  authorName: string;
  authorImage?: string;
  onCopy: () => void;
}

export interface PreviewToggleProps {
  showPreview: boolean;
  onToggle: () => void;
}
