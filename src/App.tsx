import React from 'react'
import Header from './components/Header'
import UseCases from './components/UseCases'
import ConnectApps from './components/ConnectApps'
import ExpertAgents from './components/ExpertAgents'
import ChatInterface from './components/ChatInterface'
import { useAppStore } from './store/appStore'

function App() {
  const { isConnectAppsOpen } = useAppStore()

  return (
    <div className="w-full h-full bg-gradient-primary flex flex-col">
      <Header />
      
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        <UseCases />
        <ConnectApps />
        <ExpertAgents />
      </div>
      
      <ChatInterface />
      
      {isConnectAppsOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-gray-900 rounded-t-2xl w-full max-w-md h-3/4 transform transition-transform duration-300 ease-out">
            <ConnectApps />
          </div>
        </div>
      )}
    </div>
  )
}

export default App