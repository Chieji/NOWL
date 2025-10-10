import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Target, Calendar, Camera, User, Zap } from 'lucide-react';

const UseCases: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const useCases = [
    {
      id: 'daily-poster',
      name: 'Daily Photo Poster',
      description: 'Automatically post daily photos with AI-generated captions',
      icon: <Camera className="w-5 h-5" />,
      status: 'coming-soon'
    },
    {
      id: 'content-backfiller',
      name: 'Content Backfiller',
      description: 'Add backdated posts to fill gaps in your timeline',
      icon: <Calendar className="w-5 h-5" />,
      status: 'coming-soon'
    },
    {
      id: 'profile-refresh',
      name: 'Profile Refresh',
      description: 'Update bio, pictures, and profile information',
      icon: <User className="w-5 h-5" />,
      status: 'coming-soon'
    },
    {
      id: 'bulk-operations',
      name: 'Bulk Operations',
      description: 'Edit multiple posts, change privacy settings in bulk',
      icon: <Zap className="w-5 h-5" />,
      status: 'coming-soon'
    }
  ];

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg mx-4 mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors rounded-lg"
      >
        <div className="flex items-center space-x-3">
          <Target className="w-5 h-5 text-primary-500" />
          <div className="text-left">
            <h3 className="font-medium text-white">Use Cases</h3>
            <p className="text-sm text-gray-400">Pre-built automation workflows</p>
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
            {useCases.map((useCase) => (
              <div
                key={useCase.id}
                className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-primary-500">
                    {useCase.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-white text-sm">{useCase.name}</h4>
                    <p className="text-xs text-gray-400">{useCase.description}</p>
                  </div>
                </div>
                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                  Coming Soon
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UseCases;