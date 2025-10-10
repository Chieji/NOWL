import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Settings, Shuffle, ChevronDown } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { LLMService } from '@/services/llm';
import { ChatMessage } from '@/types';

interface ChatInterfaceProps {
  onOpenSettings: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onOpenSettings }) => {
  const {
    messages,
    addMessage,
    providers,
    currentProvider,
    setCurrentProvider,
    isOnFacebook
  } = useStore();

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModelPickerOpen, setIsModelPickerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeProvider = providers.find(p => p.id === currentProvider);
  const enabledProviders = providers.filter(p => p.enabled && p.apiKey);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-select first enabled provider if none selected
  useEffect(() => {
    if (!currentProvider && enabledProviders.length > 0) {
      setCurrentProvider(enabledProviders[0].id);
    }
  }, [enabledProviders, currentProvider, setCurrentProvider]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !activeProvider || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    addMessage(userMessage);
    setInputValue('');
    setIsLoading(true);

    try {
      // Create system message based on context
      const systemMessage = {
        role: 'system',
        content: `You are FACE, a Facebook AI Chrome Extension assistant. You help users automate Facebook tasks like posting photos, scheduling content, editing profiles, and generating captions. 

${isOnFacebook ? 'The user is currently on Facebook.' : 'The user is not currently on Facebook.'}

Be conversational, helpful, and proactive. Ask clarifying questions when needed. For Facebook automation tasks, guide the user through the process step by step.

Key capabilities:
- Photo posting with AI-generated captions
- Content scheduling 
- Profile management
- Bulk operations
- Caption generation

Always confirm before taking any actions that would post or modify content on Facebook.`
      };

      const conversationMessages = [
        systemMessage,
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: userMessage.role, content: userMessage.content }
      ];

      let assistantContent = '';
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };

      addMessage(assistantMessage);

      const response = await LLMService.sendMessage(
        activeProvider,
        conversationMessages,
        (chunk) => {
          assistantContent += chunk;
          // Update the message in real-time
          assistantMessage.content = assistantContent;
          addMessage({ ...assistantMessage });
        }
      );

      if (response.error) {
        assistantMessage.content = `Sorry, I encountered an error: ${response.error}`;
        addMessage({ ...assistantMessage });
      } else if (!assistantContent) {
        assistantMessage.content = response.content;
        addMessage({ ...assistantMessage });
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileAttach = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Handle file attachment
      console.log('Files selected:', files);
      // TODO: Implement file handling
    }
  };

  const getWelcomeMessage = () => {
    if (isOnFacebook) {
      return "Hi! I see you're on Facebook. I can help you post photos, schedule content, edit your profile, or generate captions. What would you like to do?";
    }
    return "Hello! I'm FACE, your AI social assistant. I can help you with Facebook automation when you're on facebook.com. What can I help you with today?";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🤖</div>
            <p className="text-gray-400 text-sm mb-4">
              {getWelcomeMessage()}
            </p>
            {!enabledProviders.length && (
              <button
                onClick={onOpenSettings}
                className="text-primary-500 hover:text-primary-400 text-sm underline"
              >
                Connect an AI provider to get started
              </button>
            )}
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white/10 text-gray-100 border border-white/20'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 border border-white/20 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center space-x-2 mb-2">
          {/* Model Picker */}
          <div className="relative">
            <button
              onClick={() => setIsModelPickerOpen(!isModelPickerOpen)}
              disabled={enabledProviders.length === 0}
              className="flex items-center space-x-1 px-2 py-1 bg-white/5 border border-white/20 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Shuffle className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-300">
                {activeProvider?.name || 'No Provider'}
              </span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {isModelPickerOpen && enabledProviders.length > 0 && (
              <div className="absolute bottom-full left-0 mb-2 bg-gray-800 border border-white/20 rounded-lg shadow-lg min-w-[150px] z-10">
                {enabledProviders.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => {
                      setCurrentProvider(provider.id);
                      setIsModelPickerOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      currentProvider === provider.id ? 'bg-primary-500/20 text-primary-300' : 'text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{provider.icon}</span>
                      <span>{provider.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <Settings className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything..."
              className="w-full px-4 py-3 pr-20 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none min-h-[48px] max-h-32"
              rows={1}
              disabled={!activeProvider || isLoading}
            />
            
            <div className="absolute right-2 bottom-2 flex items-center space-x-1">
              <button
                onClick={handleFileAttach}
                disabled={isLoading}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
              >
                <Paperclip className="w-4 h-4 text-gray-400" />
              </button>
              
              <button
                disabled={isLoading}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
              >
                <Mic className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || !activeProvider || isLoading}
            className="p-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ChatInterface;