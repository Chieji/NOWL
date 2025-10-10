import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Bot, Palette, Clock, UserCheck } from 'lucide-react';

const ExpertAgents: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const agents = [
    {
      id: 'content-creator',
      name: 'Content Creator',
      description: 'Writes engaging posts and captions',
      icon: <Palette className="w-5 h-5" />,
      personality: 'Creative and engaging',
      status: 'available'
    },
    {
      id: 'scheduler',
      name: 'Scheduler',
      description: 'Optimizes timing and posting schedules',
      icon: <Clock className="w-5 h-5" />,
      personality: 'Strategic and analytical',
      status: 'available'
    },
    {
      id: 'profile-manager',
      name: 'Profile Manager',
      description: 'Provides branding and profile advice',
      icon: <UserCheck className="w-5 h-5" />,
      personality: 'Professional and insightful',
      status: 'available'
    }
  ];

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg mx-4 mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors rounded-lg"
      >
        <div className="flex items-center space-x-3">
          <Bot className="w-5 h-5 text-primary-500" />
          <div className="text-left">
            <h3 className="font-medium text-white">Expert Agents</h3>
            <p className="text-sm text-gray-400">Specialized AI personas for different tasks</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-white/10 pt-4">
          <div className="space-y-3">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-primary-500">
                    {agent.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-white text-sm">{agent.name}</h4>
                    <p className="text-xs text-gray-400">{agent.description}</p>
                    <p className="text-xs text-gray-500 italic">{agent.personality}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-xs text-green-400">Available</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertAgents;