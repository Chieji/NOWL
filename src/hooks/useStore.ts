import { create } from 'zustand';
import { AppState, LLMProvider, MCPServer, ChatMessage, ScheduledPost } from '@/types';
import { StorageService } from '@/services/storage';

interface StoreActions {
  // Providers
  addProvider: (provider: LLMProvider) => void;
  updateProvider: (id: string, updates: Partial<LLMProvider>) => void;
  removeProvider: (id: string) => void;
  setCurrentProvider: (id: string) => void;
  loadProviders: () => Promise<void>;
  
  // MCP Servers
  addMCPServer: (server: MCPServer) => void;
  updateMCPServer: (id: string, updates: Partial<MCPServer>) => void;
  removeMCPServer: (id: string) => void;
  loadMCPServers: () => Promise<void>;
  
  // Chat
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  
  // Facebook
  setIsOnFacebook: (isOn: boolean) => void;
  
  // Scheduling
  addScheduledPost: (post: ScheduledPost) => void;
  updateScheduledPost: (id: string, updates: Partial<ScheduledPost>) => void;
  removeScheduledPost: (id: string) => void;
  loadScheduledPosts: () => Promise<void>;
}

const defaultProviders: LLMProvider[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Access to 100+ models through one API',
    icon: '🌐',
    enabled: false
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Fastest inference for real-time chat',
    icon: '⚡',
    enabled: false
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    description: 'Best reasoning for complex tasks',
    icon: '🧠',
    enabled: false
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Industry standard, reliable',
    icon: '🤖',
    enabled: false
  },
  {
    id: 'together',
    name: 'Together AI',
    description: 'Good balance of speed and quality',
    icon: '🔗',
    enabled: false
  },
  {
    id: 'cohere',
    name: 'Cohere',
    description: 'Great for generation tasks',
    icon: '📝',
    enabled: false
  },
  {
    id: 'deepinfra',
    name: 'DeepInfra',
    description: 'Affordable, wide model selection',
    icon: '💰',
    enabled: false
  },
  {
    id: 'xai',
    name: 'XAI (Grok)',
    description: 'Latest from X/Twitter team',
    icon: '🚀',
    enabled: false
  }
];

const defaultMCPServers: MCPServer[] = [
  {
    id: 'replicate',
    name: 'Replicate AI',
    description: 'Image generation and processing',
    icon: '🎨',
    enabled: false
  },
  {
    id: 'firecrawl',
    name: 'Firecrawl MCP',
    description: 'Web scraping for content research',
    icon: '🔥',
    enabled: false
  },
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Database for storing data',
    icon: '🗄️',
    enabled: false
  },
  {
    id: 'notion',
    name: 'Notion API',
    description: 'Content calendar integration',
    icon: '📋',
    enabled: false
  }
];

export const useStore = create<AppState & StoreActions>((set, get) => ({
  // Initial state
  providers: defaultProviders,
  mcpServers: defaultMCPServers,
  messages: [],
  currentProvider: null,
  isOnFacebook: false,
  scheduledPosts: [],

  // Provider actions
  addProvider: (provider) => {
    const providers = [...get().providers, provider];
    set({ providers });
    StorageService.saveProviders(providers);
  },

  updateProvider: (id, updates) => {
    const providers = get().providers.map(p => 
      p.id === id ? { ...p, ...updates } : p
    );
    set({ providers });
    StorageService.saveProviders(providers);
  },

  removeProvider: (id) => {
    const providers = get().providers.filter(p => p.id !== id);
    set({ providers });
    StorageService.saveProviders(providers);
  },

  setCurrentProvider: (id) => {
    set({ currentProvider: id });
    StorageService.saveCurrentProvider(id);
  },

  loadProviders: async () => {
    const savedProviders = await StorageService.getProviders();
    if (savedProviders.length > 0) {
      // Merge saved providers with defaults to ensure new providers are added
      const mergedProviders = defaultProviders.map(defaultProvider => {
        const savedProvider = savedProviders.find(p => p.id === defaultProvider.id);
        return savedProvider || defaultProvider;
      });
      set({ providers: mergedProviders });
    }
    
    const currentProvider = await StorageService.getCurrentProvider();
    if (currentProvider) {
      set({ currentProvider });
    }
  },

  // MCP Server actions
  addMCPServer: (server) => {
    const mcpServers = [...get().mcpServers, server];
    set({ mcpServers });
    StorageService.saveMCPServers(mcpServers);
  },

  updateMCPServer: (id, updates) => {
    const mcpServers = get().mcpServers.map(s => 
      s.id === id ? { ...s, ...updates } : s
    );
    set({ mcpServers });
    StorageService.saveMCPServers(mcpServers);
  },

  removeMCPServer: (id) => {
    const mcpServers = get().mcpServers.filter(s => s.id !== id);
    set({ mcpServers });
    StorageService.saveMCPServers(mcpServers);
  },

  loadMCPServers: async () => {
    const savedServers = await StorageService.getMCPServers();
    if (savedServers.length > 0) {
      const mergedServers = defaultMCPServers.map(defaultServer => {
        const savedServer = savedServers.find(s => s.id === defaultServer.id);
        return savedServer || defaultServer;
      });
      set({ mcpServers: mergedServers });
    }
  },

  // Chat actions
  addMessage: (message) => {
    set({ messages: [...get().messages, message] });
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  // Facebook actions
  setIsOnFacebook: (isOn) => {
    set({ isOnFacebook: isOn });
  },

  // Scheduling actions
  addScheduledPost: (post) => {
    const scheduledPosts = [...get().scheduledPosts, post];
    set({ scheduledPosts });
    StorageService.saveScheduledPosts(scheduledPosts);
  },

  updateScheduledPost: (id, updates) => {
    const scheduledPosts = get().scheduledPosts.map(p => 
      p.id === id ? { ...p, ...updates } : p
    );
    set({ scheduledPosts });
    StorageService.saveScheduledPosts(scheduledPosts);
  },

  removeScheduledPost: (id) => {
    const scheduledPosts = get().scheduledPosts.filter(p => p.id !== id);
    set({ scheduledPosts });
    StorageService.saveScheduledPosts(scheduledPosts);
  },

  loadScheduledPosts: async () => {
    const savedPosts = await StorageService.getScheduledPosts();
    set({ scheduledPosts: savedPosts });
  }
}));