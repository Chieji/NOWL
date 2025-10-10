import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UseCases from './components/UseCases';
import ConnectApps from './components/ConnectApps';
import ExpertAgents from './components/ExpertAgents';
import ChatInterface from './components/ChatInterface';
import { useStore } from './hooks/useStore';

const App: React.FC = () => {
  const [isConnectAppsOpen, setIsConnectAppsOpen] = useState(false);
  const { loadProviders, loadMCPServers, loadScheduledPosts, setIsOnFacebook } = useStore();

  useEffect(() => {
    // Load saved data on startup
    const initializeApp = async () => {
      await Promise.all([
        loadProviders(),
        loadMCPServers(),
        loadScheduledPosts()
      ]);

      // Check if user is on Facebook
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const isOnFacebookPage = tab?.url?.includes('facebook.com') || false;
        setIsOnFacebook(isOnFacebookPage);
      } catch (error) {
        console.log('Could not check current tab:', error);
      }
    };

    initializeApp();
  }, [loadProviders, loadMCPServers, loadScheduledPosts, setIsOnFacebook]);

  return (
    <div className="w-[400px] h-[600px] bg-gradient-dark text-white flex flex-col">
      <Header />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-shrink-0">
          <UseCases />
          
          <div className="px-4 mb-4">
            <button
              onClick={() => setIsConnectAppsOpen(true)}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">🔌</span>
                <div>
                  <h3 className="font-medium text-white">Connect Apps</h3>
                  <p className="text-sm text-gray-400">Add LLM providers and MCP servers</p>
                </div>
              </div>
            </button>
          </div>
          
          <ExpertAgents />
        </div>
        
        <div className="flex-1 flex flex-col min-h-0">
          <ChatInterface onOpenSettings={() => setIsConnectAppsOpen(true)} />
        </div>
      </div>

      <ConnectApps
        isOpen={isConnectAppsOpen}
        onClose={() => setIsConnectAppsOpen(false)}
      />
    </div>
  );
};

export default App;