import React, { useState } from 'react';
import { Settings, Plus, X, ChevronDown, ChevronRight, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { LLMProvider, MCPServer } from '@/types';
import { LLMService } from '@/services/llm';
import { maskApiKey } from '@/utils/encryption';

interface ConnectAppsProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConnectApps: React.FC<ConnectAppsProps> = ({ isOpen, onClose }) => {
  const { providers, mcpServers, updateProvider, updateMCPServer } = useStore();
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const [expandedServer, setExpandedServer] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [testingConnection, setTestingConnection] = useState<Record<string, boolean>>({});
  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'success' | 'error' | null>>({});

  if (!isOpen) return null;

  const handleProviderToggle = (id: string) => {
    const provider = providers.find(p => p.id === id);
    if (provider) {
      updateProvider(id, { enabled: !provider.enabled });
    }
  };

  const handleServerToggle = (id: string) => {
    const server = mcpServers.find(s => s.id === id);
    if (server) {
      updateMCPServer(id, { enabled: !server.enabled });
    }
  };

  const handleApiKeyChange = (id: string, apiKey: string) => {
    updateProvider(id, { apiKey });
    // Clear previous connection status when API key changes
    setConnectionStatus(prev => ({ ...prev, [id]: null }));
  };

  const handleTestConnection = async (provider: LLMProvider) => {
    if (!provider.apiKey) return;

    setTestingConnection(prev => ({ ...prev, [provider.id]: true }));
    
    try {
      const success = await LLMService.testConnection(provider);
      setConnectionStatus(prev => ({ 
        ...prev, 
        [provider.id]: success ? 'success' : 'error' 
      }));
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, [provider.id]: 'error' }));
    } finally {
      setTestingConnection(prev => ({ ...prev, [provider.id]: false }));
    }
  };

  const toggleShowApiKey = (id: string) => {
    setShowApiKey(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-dark border border-white/20 rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Apps</h2>
            <p className="text-sm text-gray-400">Connect your apps to let FACE work for you</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* LLM Providers Section */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-white mb-3 flex items-center">
              <span className="mr-2">🤖</span>
              LLM Providers
            </h3>
            
            <div className="space-y-2">
              {providers.map((provider) => (
                <div key={provider.id} className="bg-white/5 border border-white/10 rounded-lg">
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-lg">{provider.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{provider.name}</h4>
                        <p className="text-sm text-gray-400">{provider.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={provider.enabled}
                          onChange={() => handleProviderToggle(provider.id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                      
                      <button
                        onClick={() => setExpandedProvider(
                          expandedProvider === provider.id ? null : provider.id
                        )}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        {expandedProvider === provider.id ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Configuration */}
                  {expandedProvider === provider.id && (
                    <div className="px-3 pb-3 border-t border-white/10 pt-3">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            API Key
                          </label>
                          <div className="relative">
                            <input
                              type={showApiKey[provider.id] ? 'text' : 'password'}
                              value={provider.apiKey || ''}
                              onChange={(e) => handleApiKeyChange(provider.id, e.target.value)}
                              placeholder="Enter your API key"
                              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 pr-20"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                              <button
                                onClick={() => toggleShowApiKey(provider.id)}
                                className="p-1 hover:bg-white/10 rounded transition-colors"
                              >
                                {showApiKey[provider.id] ? (
                                  <EyeOff className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <Eye className="w-4 h-4 text-gray-400" />
                                )}
                              </button>
                              
                              {connectionStatus[provider.id] === 'success' && (
                                <Check className="w-4 h-4 text-green-500" />
                              )}
                              {connectionStatus[provider.id] === 'error' && (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                          </div>
                          
                          {provider.apiKey && (
                            <p className="text-xs text-gray-500 mt-1">
                              Key: {maskApiKey(provider.apiKey)}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => handleTestConnection(provider)}
                          disabled={!provider.apiKey || testingConnection[provider.id]}
                          className="w-full px-3 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
                        >
                          {testingConnection[provider.id] ? 'Testing...' : 'Test Connection'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* MCP Servers Section */}
          <div>
            <h3 className="text-md font-medium text-white mb-3 flex items-center">
              <span className="mr-2">🔌</span>
              MCP Servers
            </h3>
            
            <div className="space-y-2">
              {mcpServers.map((server) => (
                <div key={server.id} className="bg-white/5 border border-white/10 rounded-lg">
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-lg">{server.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{server.name}</h4>
                        <p className="text-sm text-gray-400">{server.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={server.enabled}
                          onChange={() => handleServerToggle(server.id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                      
                      <button
                        onClick={() => setExpandedServer(
                          expandedServer === server.id ? null : server.id
                        )}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        {expandedServer === server.id ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Configuration */}
                  {expandedServer === server.id && (
                    <div className="px-3 pb-3 border-t border-white/10 pt-3">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Configuration
                          </label>
                          <textarea
                            placeholder="Enter server configuration (JSON)"
                            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none h-20"
                          />
                        </div>

                        <button
                          disabled
                          className="w-full px-3 py-2 bg-gray-600 cursor-not-allowed text-white rounded-lg text-sm font-medium"
                        >
                          Connect Server (Coming Soon)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectApps;