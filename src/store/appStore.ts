import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface LLMProvider {
  id: string
  name: string
  description: string
  enabled: boolean
  apiKey: string
  config: Record<string, any>
  isConnected: boolean
}

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  attachments?: File[]
}

export interface UseCase {
  id: string
  title: string
  description: string
  icon: string
  enabled: boolean
}

export interface ExpertAgent {
  id: string
  name: string
  description: string
  icon: string
  prompt: string
  enabled: boolean
}

interface AppState {
  // UI State
  isConnectAppsOpen: boolean
  isUseCasesExpanded: boolean
  isExpertAgentsExpanded: boolean
  
  // Data
  llmProviders: LLMProvider[]
  messages: Message[]
  useCases: UseCase[]
  expertAgents: ExpertAgent[]
  selectedProvider: string | null
  selectedAgent: string | null
  
  // Actions
  setConnectAppsOpen: (open: boolean) => void
  setUseCasesExpanded: (expanded: boolean) => void
  setExpertAgentsExpanded: (expanded: boolean) => void
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  updateProvider: (id: string, updates: Partial<LLMProvider>) => void
  setSelectedProvider: (id: string | null) => void
  setSelectedAgent: (id: string | null) => void
  testProviderConnection: (id: string) => Promise<boolean>
}

const defaultProviders: LLMProvider[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Access to 100+ models through one API',
    enabled: false,
    apiKey: '',
    config: { modelPreference: 'gpt-3.5-turbo' },
    isConnected: false
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Fastest inference for real-time chat',
    enabled: false,
    apiKey: '',
    config: {},
    isConnected: false
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Best reasoning for complex tasks',
    enabled: false,
    apiKey: '',
    config: { modelVersion: 'claude-3-sonnet-20240229' },
    isConnected: false
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Industry standard, reliable',
    enabled: false,
    apiKey: '',
    config: { organizationId: '' },
    isConnected: false
  }
]

const defaultUseCases: UseCase[] = [
  {
    id: 'daily-poster',
    title: 'Daily Photo Poster',
    description: 'Automatically post daily photos with AI captions',
    icon: '📸',
    enabled: false
  },
  {
    id: 'content-backfiller',
    title: 'Content Backfiller',
    description: 'Add backdated posts to fill timeline gaps',
    icon: '📅',
    enabled: false
  },
  {
    id: 'profile-refresh',
    title: 'Profile Refresh',
    description: 'Update bio and pictures with AI assistance',
    icon: '✨',
    enabled: false
  }
]

const defaultExpertAgents: ExpertAgent[] = [
  {
    id: 'content-creator',
    name: 'Content Creator',
    description: 'Writes engaging posts and captions',
    icon: '✍️',
    prompt: 'You are a creative content creator who writes engaging, authentic social media posts. Focus on storytelling, emotional connection, and platform-appropriate tone.',
    enabled: false
  },
  {
    id: 'scheduler',
    name: 'Scheduler',
    description: 'Optimizes posting times and frequency',
    icon: '⏰',
    prompt: 'You are a social media scheduling expert who optimizes posting times, frequency, and content distribution for maximum engagement.',
    enabled: false
  },
  {
    id: 'photo-editor',
    name: 'Photo Editor',
    description: 'Enhances and optimizes images',
    icon: '🎨',
    prompt: 'You are a photo editing expert who can enhance images, suggest improvements, and optimize photos for social media platforms.',
    enabled: false
  },
  {
    id: 'profile-manager',
    name: 'Profile Manager',
    description: 'Provides branding and profile advice',
    icon: '👤',
    prompt: 'You are a personal branding expert who helps optimize social media profiles, bios, and overall online presence.',
    enabled: false
  }
]

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // UI State
      isConnectAppsOpen: false,
      isUseCasesExpanded: false,
      isExpertAgentsExpanded: false,
      
      // Data
      llmProviders: defaultProviders,
      messages: [],
      useCases: defaultUseCases,
      expertAgents: defaultExpertAgents,
      selectedProvider: null,
      selectedAgent: null,
      
      // Actions
      setConnectAppsOpen: (open) => set({ isConnectAppsOpen: open }),
      setUseCasesExpanded: (expanded) => set({ isUseCasesExpanded: expanded }),
      setExpertAgentsExpanded: (expanded) => set({ isExpertAgentsExpanded: expanded }),
      
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, {
          ...message,
          id: Date.now().toString(),
          timestamp: new Date()
        }]
      })),
      
      updateProvider: (id, updates) => set((state) => ({
        llmProviders: state.llmProviders.map(provider =>
          provider.id === id ? { ...provider, ...updates } : provider
        )
      })),
      
      setSelectedProvider: (id) => set({ selectedProvider: id }),
      setSelectedAgent: (id) => set({ selectedAgent: id }),
      
      testProviderConnection: async (id) => {
        const provider = get().llmProviders.find(p => p.id === id)
        if (!provider || !provider.apiKey) return false
        
        try {
          // TODO: Implement actual API testing
          // For now, just simulate a successful connection
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          set((state) => ({
            llmProviders: state.llmProviders.map(p =>
              p.id === id ? { ...p, isConnected: true } : p
            )
          }))
          
          return true
        } catch (error) {
          console.error('Provider connection test failed:', error)
          return false
        }
      }
    }),
    {
      name: 'face-app-storage',
      partialize: (state) => ({
        llmProviders: state.llmProviders,
        messages: state.messages,
        useCases: state.useCases,
        expertAgents: state.expertAgents,
        selectedProvider: state.selectedProvider,
        selectedAgent: state.selectedAgent
      })
    }
  )
)