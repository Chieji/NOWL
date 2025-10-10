import React, { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Mic, Shuffle, Settings, X } from 'lucide-react'
import { useAppStore } from '../store/appStore'

const ChatInterface: React.FC = () => {
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [showModelPicker, setShowModelPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const {
    messages,
    addMessage,
    llmProviders,
    selectedProvider,
    setSelectedProvider,
    setConnectAppsOpen
  } = useAppStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!message.trim()) return

    // Add user message
    addMessage({
      content: message,
      role: 'user'
    })

    const userMessage = message
    setMessage('')

    // Add typing indicator
    addMessage({
      content: 'Thinking...',
      role: 'assistant'
    })

    try {
      // TODO: Implement actual LLM API call
      // For now, simulate a response
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Remove typing indicator and add actual response
      const responses = [
        "I'd be happy to help you with that! What would you like to do on Facebook today?",
        "Great! I can help you post content, schedule posts, or manage your profile. What's your goal?",
        "I'm here to assist with your Facebook automation needs. What can I do for you?",
        "Let's make your Facebook posting easier! What would you like to accomplish?"
      ]
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      
      // Remove the last message (typing indicator) and add the real response
      const newMessages = messages.slice(0, -1)
      newMessages.push({
        id: Date.now().toString(),
        content: randomResponse,
        role: 'assistant',
        timestamp: new Date()
      })
      
      // Update the store with the new messages
      // This is a bit hacky - in a real app, we'd have a proper update method
      console.log('Simulated response:', randomResponse)
      
    } catch (error) {
      console.error('Error sending message:', error)
      // Remove typing indicator and add error message
      const newMessages = messages.slice(0, -1)
      newMessages.push({
        id: Date.now().toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileUpload = () => {
    // TODO: Implement file upload
    console.log('File upload clicked')
  }

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording)
    // TODO: Implement voice recording
    console.log('Voice recording:', !isRecording)
  }

  const activeProvider = llmProviders.find(p => p.id === selectedProvider)
  const enabledProviders = llmProviders.filter(p => p.enabled && p.isConnected)

  return (
    <div className="border-t border-white/10 bg-gray-900/50">
      {/* Messages Area */}
      <div className="h-48 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p className="text-sm">Start a conversation with your AI assistant</p>
            <p className="text-xs mt-1">Ask me to help with Facebook posting, scheduling, or profile management</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-white'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Model Picker */}
      {showModelPicker && (
        <div className="border-t border-white/10 p-3 bg-gray-800/50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-white">Select Model</h4>
            <button
              onClick={() => setShowModelPicker(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {enabledProviders.map((provider) => (
              <button
                key={provider.id}
                onClick={() => {
                  setSelectedProvider(provider.id)
                  setShowModelPicker(false)
                }}
                className={`w-full text-left p-2 rounded-lg transition-colors ${
                  selectedProvider === provider.id
                    ? 'bg-blue-500/20 border border-blue-500/50'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="text-sm font-medium text-white">{provider.name}</div>
                <div className="text-xs text-gray-400">{provider.description}</div>
              </button>
            ))}
            {enabledProviders.length === 0 && (
              <div className="text-center text-gray-400 py-4">
                <p className="text-sm">No providers connected</p>
                <button
                  onClick={() => {
                    setConnectAppsOpen(true)
                    setShowModelPicker(false)
                  }}
                  className="text-blue-400 hover:text-blue-300 text-sm mt-1"
                >
                  Connect a provider
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3">
        <div className="flex items-center space-x-2">
          {/* Left side buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowModelPicker(!showModelPicker)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Change model"
            >
              <Shuffle className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => setConnectAppsOpen(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Text input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything..."
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handleFileUpload}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Attach file"
            >
              <Paperclip className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={handleVoiceRecord}
              className={`p-2 rounded-lg transition-colors ${
                isRecording
                  ? 'bg-red-500 text-white'
                  : 'hover:bg-white/10 text-gray-400'
              }`}
              title="Voice input"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="p-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              title="Send message"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Status indicator */}
        {activeProvider && (
          <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
            <span>Using: {activeProvider.name}</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Connected</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatInterface