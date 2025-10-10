import React from 'react'
import { Sparkles, Settings } from 'lucide-react'
import { useAppStore } from '../store/appStore'

const Header: React.FC = () => {
  const { setConnectAppsOpen } = useAppStore()

  return (
    <div className="px-4 py-3 border-b border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">FACE</h1>
            <p className="text-xs text-gray-300">Your AI Social Assistant</p>
          </div>
        </div>
        
        <button
          onClick={() => setConnectAppsOpen(true)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-300" />
        </button>
      </div>
      
      <div className="mt-3">
        <p className="text-sm text-gray-300">The Best of AI Unified Into One</p>
        <div className="flex items-center space-x-2 mt-2">
          <div className="flex space-x-1">
            {['OpenAI', 'Anthropic', 'Groq', 'Cohere'].map((provider) => (
              <div
                key={provider}
                className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300"
              >
                {provider}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header