import { encryptData, decryptData } from '@/utils/encryption';
import { LLMProvider, MCPServer, ScheduledPost } from '@/types';

export class StorageService {
  private static async setEncrypted(key: string, value: any): Promise<void> {
    const encrypted = encryptData(JSON.stringify(value));
    await chrome.storage.local.set({ [key]: encrypted });
  }

  private static async getEncrypted<T>(key: string): Promise<T | null> {
    const result = await chrome.storage.local.get(key);
    if (!result[key]) return null;
    
    try {
      const decrypted = decryptData(result[key]);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error(`Failed to decrypt ${key}:`, error);
      return null;
    }
  }

  static async saveProviders(providers: LLMProvider[]): Promise<void> {
    await this.setEncrypted('llm_providers', providers);
  }

  static async getProviders(): Promise<LLMProvider[]> {
    return (await this.getEncrypted<LLMProvider[]>('llm_providers')) || [];
  }

  static async saveMCPServers(servers: MCPServer[]): Promise<void> {
    await this.setEncrypted('mcp_servers', servers);
  }

  static async getMCPServers(): Promise<MCPServer[]> {
    return (await this.getEncrypted<MCPServer[]>('mcp_servers')) || [];
  }

  static async saveScheduledPosts(posts: ScheduledPost[]): Promise<void> {
    await this.setEncrypted('scheduled_posts', posts);
  }

  static async getScheduledPosts(): Promise<ScheduledPost[]> {
    return (await this.getEncrypted<ScheduledPost[]>('scheduled_posts')) || [];
  }

  static async saveCurrentProvider(providerId: string): Promise<void> {
    await chrome.storage.local.set({ current_provider: providerId });
  }

  static async getCurrentProvider(): Promise<string | null> {
    const result = await chrome.storage.local.get('current_provider');
    return result.current_provider || null;
  }
}