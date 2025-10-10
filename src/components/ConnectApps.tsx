import React, { useState } from 'react'
import { Plug, X, Eye, EyeOff, Check, ChevronDown } from 'lucide-react'
import { useAppStore } from '../store/appStore'

const ConnectApps: React.FC = () => {
  const {
    llmProviders,
    updateProvider,
    testProviderConnection,
    isConnectAppsOpen,
    setConnectAppsOpen
  } = useAppStore()
  
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({})
  const [testingConnections, setTestingConnections] = useState<Record<string, boolean>>({})

  const toggleApiKeyVisibility = (providerId: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [providerId]: !prev[providerId]
    }))
  }

  const handleTestConnection = async (providerId: string) => {
    setTestingConnections(prev => ({ ...prev, [providerId]: true }))
    
    try {
      const success = await testProviderConnection(providerId)
      if (success) {
        // Show success feedback
        setTimeout(() => {
          setTestingConnections(prev => ({ ...prev, [providerId]: false }))
        }, 2000)
      }
    } catch (error) {
      setTestingConnections(prev => ({ ...prev, [providerId]: false }))
    }
  }

  const maskApiKey = (key: string) => {
    if (key.length <= 4) return key
    return '•'.repeat(key.length - 4) + key.slice(-4)
  }

  if (!isConnectAppsOpen) {
    return (
      <div className="card">
        <button
          onClick={() => setConnectAppsOpen(true)}
          className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <Plug className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-white">Connect Apps</h3>
              <p className="text-xs text-gray-400">LLM providers and MCP servers</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">
              {llmProviders.filter(p => p.enabled).length} connected
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Apps</h2>
            <p className="text-sm text-gray-400">Connect your apps to let FACE work for you</p>
          </div>
          <button
            onClick={() => setConnectAppsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {llmProviders.map((provider) => (
          <div key={provider.id} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {provider.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-white">{provider.name}</h3>
                  <p className="text-xs text-gray-400">{provider.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {provider.isConnected && (
                  <div className="flex items-center space-x-1 text-green-400">
                    <Check className="w-4 h-4" />
                    <span className="text-xs">Connected</span>
                  </div>
                )}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={provider.enabled}
                    onChange={(e) => updateProvider(provider.id, { enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {provider.enabled && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKeys[provider.id] ? 'text' : 'password'}
                      value={provider.apiKey}
                      onChange={(e) => updateProvider(provider.id, { apiKey: e.target.value })}
                      placeholder="Enter your API key"
                      className="input-field w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleApiKeyVisibility(provider.id)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showApiKeys[provider.id] ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {provider.apiKey && (
                    <p className="text-xs text-gray-400 mt-1">
                      Masked: {maskApiKey(provider.apiKey)}
                    </p>
                  )}
                </div>

                {provider.config && Object.keys(provider.config).length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Model Preference
                    </label>
                    <select
                      value={provider.config.modelPreference || provider.config.modelVersion || ''}
                      onChange={(e) => updateProvider(provider.id, {
                        config: { ...provider.config, modelPreference: e.target.value }
                      })}
                      className="input-field w-full"
                    >
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="gpt-4">GPT-4</option>
                      <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                      <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                    </select>
                  </div>
                )}

                <button
                  onClick={() => handleTestConnection(provider.id)}
                  disabled={!provider.apiKey || testingConnections[provider.id]}
                  className="w-full button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testingConnections[provider.id] ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Testing...</span>
                    </div>
                  ) : (
                    'Test Connection'
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ConnectApps