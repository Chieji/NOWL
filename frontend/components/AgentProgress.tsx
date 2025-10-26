/**
 * AgentProgress Component - Displays real-time ReAct execution progress
 * 
 * This component visualizes the agent's thinking process by showing the
 * Thought, Action, and Observation steps as they occur in real-time.
 */

import React from 'react';
import { Brain, Play, Eye, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface AgentStep {
  step: number;
  thought?: string;
  action?: {
    tool: string;
    parameters?: Record<string, any>;
  };
  observation?: string;
  status: 'in_progress' | 'completed' | 'error';
  timestamp: string;
}

interface AgentProgressProps {
  steps: AgentStep[];
  currentStep?: number;
  isActive: boolean;
  sessionId?: string;
}

export const AgentProgress: React.FC<AgentProgressProps> = ({
  steps,
  currentStep,
  isActive,
  sessionId
}) => {
  const getStepIcon = (type: 'thought' | 'action' | 'observation', status: string) => {
    const iconClass = "w-4 h-4";
    
    if (status === 'in_progress') {
      return <Loader2 className={`${iconClass} animate-spin text-blue-500`} />;
    } else if (status === 'error') {
      return <AlertCircle className={`${iconClass} text-red-500`} />;
    } else if (status === 'completed') {
      return <CheckCircle2 className={`${iconClass} text-green-500`} />;
    }

    switch (type) {
      case 'thought':
        return <Brain className={`${iconClass} text-purple-500`} />;
      case 'action':
        return <Play className={`${iconClass} text-blue-500`} />;
      case 'observation':
        return <Eye className={`${iconClass} text-green-500`} />;
      default:
        return null;
    }
  };

  const formatActionParameters = (params: Record<string, any>) => {
    return Object.entries(params)
      .map(([key, value]) => `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`)
      .join(', ');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Agent Progress
        </h2>
        {sessionId && (
          <span className="text-xs text-gray-500 font-mono">
            Session: {sessionId.slice(0, 8)}...
          </span>
        )}
      </div>

      {steps.length === 0 && !isActive && (
        <div className="text-center py-12 text-gray-500">
          <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Agent is ready to process your query</p>
        </div>
      )}

      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={`${step.step}-${index}`} className="border-l-2 border-gray-200 pl-6 relative">
            {/* Step Number Badge */}
            <div className="absolute -left-3 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
              {step.step}
            </div>

            {/* Thought Section */}
            {step.thought && (
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  {getStepIcon('thought', step.status)}
                  <span className="ml-2 text-sm font-medium text-purple-700">
                    Thought
                  </span>
                  <span className="ml-auto text-xs text-gray-500">
                    {new Date(step.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="bg-purple-50 p-4 rounded-md border-l-4 border-purple-200">
                  <p className="text-gray-800 italic">{step.thought}</p>
                </div>
              </div>
            )}

            {/* Action Section */}
            {step.action && (
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  {getStepIcon('action', step.status)}
                  <span className="ml-2 text-sm font-medium text-blue-700">
                    Action
                  </span>
                </div>
                <div className="bg-blue-50 p-4 rounded-md border-l-4 border-blue-200">
                  <div className="font-mono text-sm">
                    <span className="font-bold text-blue-800">
                      {step.action.tool}
                    </span>
                    {step.action.parameters && (
                      <div className="mt-2 text-gray-700">
                        <span className="text-xs text-gray-500">Parameters:</span>
                        <div className="mt-1 text-xs bg-white p-2 rounded border">
                          {formatActionParameters(step.action.parameters)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Observation Section */}
            {step.observation && (
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  {getStepIcon('observation', step.status)}
                  <span className="ml-2 text-sm font-medium text-green-700">
                    Observation
                  </span>
                </div>
                <div className="bg-green-50 p-4 rounded-md border-l-4 border-green-200">
                  <p className="text-gray-800">{step.observation}</p>
                </div>
              </div>
            )}

            {/* Status Indicator */}
            <div className="flex items-center text-xs text-gray-500 mb-2">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                step.status === 'completed' ? 'bg-green-500' :
                step.status === 'error' ? 'bg-red-500' :
                'bg-yellow-500'
              }`} />
              Status: {step.status.replace('_', ' ')}
            </div>
          </div>
        ))}

        {/* Current Processing Indicator */}
        {isActive && currentStep && (
          <div className="border-l-2 border-blue-300 pl-6 relative">
            <div className="absolute -left-3 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center">
              <Loader2 className="w-3 h-3 animate-spin" />
            </div>
            <div className="text-blue-600 font-medium">
              Processing step {currentStep}...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
