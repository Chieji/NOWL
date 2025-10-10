import React from 'react'
import { Bot, ChevronDown, ChevronUp } from 'lucide-react'
import { useAppStore } from '../store/appStore'

const ExpertAgents: React.FC = () => {
  const { isExpertAgentsExpanded, setExpertAgentsExpanded, expertAgents, selectedAgent, setSelectedAgent } = useAppStore()

  return (
    <div className="card">
      <button
        onClick={() => setExpertAgentsExpanded(!isExpertAgentsExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-white">Expert Agents</h3>
            <p className="text-xs text-gray-400">Specialized AI personas</p>
          </div>
        </div>
        {isExpertAgentsExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      
      {isExpertAgentsExpanded && (
        <div className="px-3 pb-3 space-y-2">
          {expertAgents.map((agent) => (
            <div
              key={agent.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer ${
                selectedAgent === agent.id
                  ? 'bg-blue-500/20 border border-blue-500/50'
                  : 'hover:bg-white/5'
              }`}
              onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{agent.icon}</span>
                <div>
                  <h4 className="text-sm font-medium text-white">{agent.name}</h4>
                  <p className="text-xs text-gray-400">{agent.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {selectedAgent === agent.id && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    // TODO: Implement agent activation
                    console.log('Activate agent:', agent.id)
                  }}
                  className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded-lg transition-colors"
                >
                  Chat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ExpertAgents