import { LLMProvider } from '@/types';

export interface LLMResponse {
  content: string;
  error?: string;
}

export class LLMService {
  private static async makeRequest(
    provider: LLMProvider,
    messages: Array<{ role: string; content: string }>,
    onStream?: (chunk: string) => void
  ): Promise<LLMResponse> {
    try {
      switch (provider.id) {
        case 'openrouter':
          return await this.callOpenRouter(provider, messages, onStream);
        case 'groq':
          return await this.callGroq(provider, messages, onStream);
        case 'claude':
          return await this.callClaude(provider, messages, onStream);
        case 'openai':
          return await this.callOpenAI(provider, messages, onStream);
        case 'together':
          return await this.callTogether(provider, messages, onStream);
        case 'cohere':
          return await this.callCohere(provider, messages, onStream);
        case 'deepinfra':
          return await this.callDeepInfra(provider, messages, onStream);
        case 'xai':
          return await this.callXAI(provider, messages, onStream);
        default:
          throw new Error(`Unknown provider: ${provider.id}`);
      }
    } catch (error) {
      return { content: '', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private static async callOpenRouter(
    provider: LLMProvider,
    messages: Array<{ role: string; content: string }>,
    onStream?: (chunk: string) => void
  ): Promise<LLMResponse> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': chrome.runtime.getURL(''),
        'X-Title': 'FACE Chrome Extension'
      },
      body: JSON.stringify({
        model: provider.config?.model || 'meta-llama/llama-3.1-8b-instruct:free',
        messages,
        stream: !!onStream
      })
    });

    if (onStream) {
      return await this.handleStreamResponse(response, onStream);
    } else {
      const data = await response.json();
      return { content: data.choices[0]?.message?.content || '' };
    }
  }

  private static async callGroq(
    provider: LLMProvider,
    messages: Array<{ role: string; content: string }>,
    onStream?: (chunk: string) => void
  ): Promise<LLMResponse> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: provider.config?.model || 'llama-3.1-70b-versatile',
        messages,
        stream: !!onStream
      })
    });

    if (onStream) {
      return await this.handleStreamResponse(response, onStream);
    } else {
      const data = await response.json();
      return { content: data.choices[0]?.message?.content || '' };
    }
  }

  private static async callClaude(
    provider: LLMProvider,
    messages: Array<{ role: string; content: string }>,
    onStream?: (chunk: string) => void
  ): Promise<LLMResponse> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': provider.apiKey!,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: provider.config?.model || 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        messages: messages.filter(m => m.role !== 'system'),
        system: messages.find(m => m.role === 'system')?.content,
        stream: !!onStream
      })
    });

    if (onStream) {
      return await this.handleClaudeStream(response, onStream);
    } else {
      const data = await response.json();
      return { content: data.content[0]?.text || '' };
    }
  }

  private static async callOpenAI(
    provider: LLMProvider,
    messages: Array<{ role: string; content: string }>,
    onStream?: (chunk: string) => void
  ): Promise<LLMResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: provider.config?.model || 'gpt-4o-mini',
        messages,
        stream: !!onStream
      })
    });

    if (onStream) {
      return await this.handleStreamResponse(response, onStream);
    } else {
      const data = await response.json();
      return { content: data.choices[0]?.message?.content || '' };
    }
  }

  private static async callTogether(
    provider: LLMProvider,
    messages: Array<{ role: string; content: string }>,
    onStream?: (chunk: string) => void
  ): Promise<LLMResponse> {
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: provider.config?.model || 'meta-llama/Llama-3-8b-chat-hf',
        messages,
        stream: !!onStream
      })
    });

    if (onStream) {
      return await this.handleStreamResponse(response, onStream);
    } else {
      const data = await response.json();
      return { content: data.choices[0]?.message?.content || '' };
    }
  }

  private static async callCohere(
    provider: LLMProvider,
    messages: Array<{ role: string; content: string }>,
    onStream?: (chunk: string) => void
  ): Promise<LLMResponse> {
    // Cohere has a different API format
    const lastMessage = messages[messages.length - 1];
    const chatHistory = messages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'CHATBOT' : 'USER',
      message: m.content
    }));

    const response = await fetch('https://api.cohere.ai/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: provider.config?.model || 'command-r',
        message: lastMessage.content,
        chat_history: chatHistory,
        stream: !!onStream
      })
    });

    if (onStream) {
      return await this.handleCohereStream(response, onStream);
    } else {
      const data = await response.json();
      return { content: data.text || '' };
    }
  }

  private static async callDeepInfra(
    provider: LLMProvider,
    messages: Array<{ role: string; content: string }>,
    onStream?: (chunk: string) => void
  ): Promise<LLMResponse> {
    const response = await fetch('https://api.deepinfra.com/v1/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: provider.config?.model || 'meta-llama/Meta-Llama-3-8B-Instruct',
        messages,
        stream: !!onStream
      })
    });

    if (onStream) {
      return await this.handleStreamResponse(response, onStream);
    } else {
      const data = await response.json();
      return { content: data.choices[0]?.message?.content || '' };
    }
  }

  private static async callXAI(
    provider: LLMProvider,
    messages: Array<{ role: string; content: string }>,
    onStream?: (chunk: string) => void
  ): Promise<LLMResponse> {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: provider.config?.model || 'grok-beta',
        messages,
        stream: !!onStream
      })
    });

    if (onStream) {
      return await this.handleStreamResponse(response, onStream);
    } else {
      const data = await response.json();
      return { content: data.choices[0]?.message?.content || '' };
    }
  }

  private static async handleStreamResponse(
    response: Response,
    onStream: (chunk: string) => void
  ): Promise<LLMResponse> {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    let fullContent = '';
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return { content: fullContent };

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                fullContent += content;
                onStream(content);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return { content: fullContent };
  }

  private static async handleClaudeStream(
    response: Response,
    onStream: (chunk: string) => void
  ): Promise<LLMResponse> {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    let fullContent = '';
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'content_block_delta') {
                const content = parsed.delta?.text || '';
                if (content) {
                  fullContent += content;
                  onStream(content);
                }
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return { content: fullContent };
  }

  private static async handleCohereStream(
    response: Response,
    onStream: (chunk: string) => void
  ): Promise<LLMResponse> {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    let fullContent = '';
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.event_type === 'text-generation') {
              const content = parsed.text || '';
              if (content) {
                fullContent += content;
                onStream(content);
              }
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return { content: fullContent };
  }

  static async sendMessage(
    provider: LLMProvider,
    messages: Array<{ role: string; content: string }>,
    onStream?: (chunk: string) => void
  ): Promise<LLMResponse> {
    return await this.makeRequest(provider, messages, onStream);
  }

  static async testConnection(provider: LLMProvider): Promise<boolean> {
    try {
      const response = await this.makeRequest(provider, [
        { role: 'user', content: 'Hello, can you respond with just "OK"?' }
      ]);
      return !response.error && response.content.length > 0;
    } catch (error) {
      return false;
    }
  }
}