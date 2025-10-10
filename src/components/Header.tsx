import React from 'react';

const Header: React.FC = () => {
  const providers = [
    { name: 'OpenAI', logo: '🤖' },
    { name: 'Anthropic', logo: '🧠' },
    { name: 'Groq', logo: '⚡' },
    { name: 'OpenRouter', logo: '🌐' },
    { name: 'Together', logo: '🔗' }
  ];

  return (
    <div className="bg-gradient-dark p-4 border-b border-white/10">
      <div className="text-center mb-3">
        <h1 className="text-xl font-bold text-white mb-1">
          The Best of AI Unified Into One
        </h1>
        <p className="text-sm text-gray-400">Your AI Social Assistant</p>
      </div>
      
      <div className="flex justify-center items-center space-x-2">
        {providers.map((provider, index) => (
          <div
            key={provider.name}
            className="flex items-center space-x-1 px-2 py-1 bg-white/5 rounded-lg border border-white/10"
          >
            <span className="text-sm">{provider.logo}</span>
            <span className="text-xs text-gray-300">{provider.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Header;