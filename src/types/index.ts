export interface LLMProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  apiKey?: string;
  config?: Record<string, any>;
  testConnection?: () => Promise<boolean>;
}

export interface MCPServer {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  url?: string;
  config?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: File[];
}

export interface ScheduledPost {
  id: string;
  content: string;
  images?: string[];
  scheduledTime: Date;
  privacy: 'public' | 'friends' | 'only_me';
  status: 'pending' | 'posted' | 'failed';
}

export interface AppState {
  providers: LLMProvider[];
  mcpServers: MCPServer[];
  messages: ChatMessage[];
  currentProvider: string | null;
  isOnFacebook: boolean;
  scheduledPosts: ScheduledPost[];
}