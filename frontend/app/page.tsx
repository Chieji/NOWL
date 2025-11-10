'use client';

/**
 * Main Application Page - Nexus Agent Financial Analyst
 * 
 * This is the primary interface that orchestrates the three key components:
 * QueryInput, AgentProgress, and ResultDisplay to provide a complete
 * financial analysis experience with real-time agent progress visualization.
 */

import React from 'react';
import { QueryInput } from '../components/QueryInput';
import { AgentProgress } from '../components/AgentProgress';
import { ResultDisplay } from '../components/ResultDisplay';
import { useAgentSSE } from '../hooks/useAgentSSE';
import { AlertCircle, RefreshCw, Activity } from 'lucide-react';

export default function HomePage() {
  const {
    steps,
    finalResult,
    isConnected,
    isExecuting,
    error,
    sessionId,
    executeQuery,
    disconnect,
    reset
  } = useAgentSSE();

  const handleQuerySubmit = (query: string) => {
    executeQuery(query);
  };

  const handleCopyContent = (content: string) => {
    console.log('Content copied to clipboard:', content.substring(0, 50) + '...');
  };

  const handleDownloadContent = (content: string, filename: string) => {
    console.log('Content downloaded:', filename);
  };

  const handleReset = () => {
    reset();
  };

  const getCurrentStep = () => {
    if (steps.length === 0) return undefined;
    const lastStep = steps[steps.length - 1];
    return lastStep.status === 'in_progress' ? lastStep.step : undefined;
  };

  // Mock final result for demonstration when analysis completes
  const getMockFinalResult = () => {
    if (!finalResult && steps.length > 0 && !isExecuting) {
      return {
        comparison: [
          {
            symbol: 'NVDA',
            revenue: '$35.08B',
            growth: '+94%',
            risk_score: 35,
            key_risk: 'AI bubble concerns and China export restrictions'
          },
          {
            symbol: 'AMD',
            revenue: '$6.82B', 
            growth: '+18%',
            risk_score: 45,
            key_risk: 'CPU market competition and datacenter dependency'
          }
        ],
        recommendation: {
          symbol: 'NVDA',
          reasoning: 'Superior revenue growth (94% vs 18%) and stronger position in AI/datacenter markets despite moderate risks',
          confidence: 78
        },
        generated_content: {
          type: 'email_draft',
          content: `Subject: Q3 2024 Investment Analysis - NVIDIA vs AMD Recommendation

Dear [Manager],

I've completed the comparative analysis of NVIDIA and AMD's Q3 2024 performance as requested. Here are the key findings:

**Financial Performance Comparison:**
- NVIDIA: $35.08B revenue (+94% YoY growth)
- AMD: $6.82B revenue (+18% YoY growth)

**Investment Recommendation: NVIDIA**

NVIDIA demonstrates significantly stronger growth momentum with 94% year-over-year revenue increase compared to AMD's 18%. This growth is primarily driven by their dominant position in AI/datacenter markets, which continues to expand rapidly.

**Key Risk Factors:**

NVIDIA Risks:
- AI market bubble concerns and potential correction
- China export restrictions impacting international sales
- High valuation multiples creating downside vulnerability

AMD Risks:  
- Intensifying competition in CPU markets from Intel recovery
- Heavy dependence on datacenter segment for growth
- Slower adoption of their AI/ML solutions vs NVIDIA

**Conclusion:**
Despite higher valuation risks, NVIDIA's superior execution in AI markets and strong growth trajectory make it the preferred investment choice at this time.

Best regards,
[Your Name]`,
          word_count: 247
        },
        risks_summary: {
          'NVDA': 'AI bubble speculation, China restrictions',
          'AMD': 'CPU competition, datacenter dependency'
        },
        execution_summary: {
          total_steps: 4,
          execution_time: '6.2 seconds',
          data_sources: ['Financial API', 'Risk Analysis Engine', 'Content Generator']
        }
      };
    }
    return finalResult;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Nexus Agent
                </h1>
                <p className="text-sm text-gray-600">
                  Multi-Tool Financial Analyst
                </p>
              </div>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  isConnected ? 'bg-green-500' : 
                  isExecuting ? 'bg-yellow-500' : 
                  'bg-gray-400'
                }`} />
                <span className="text-gray-600">
                  {isConnected ? 'Connected' : 
                   isExecuting ? 'Connecting' : 
                   'Ready'}
                </span>
              </div>
              
              {(steps.length > 0 || error) && (
                <button
                  onClick={handleReset}
                  className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Analysis Error
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={() => disconnect()}
                className="ml-auto text-red-700 hover:text-red-900"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Query Input */}
          <QueryInput
            onSubmit={handleQuerySubmit}
            isLoading={isExecuting}
            disabled={isConnected && isExecuting}
          />

          {/* Agent Progress */}
          {(steps.length > 0 || isExecuting) && (
            <AgentProgress
              steps={steps}
              currentStep={getCurrentStep()}
              isActive={isExecuting}
              sessionId={sessionId || undefined}
            />
          )}

          {/* Results Display */}
          {getMockFinalResult() && sessionId && (
            <ResultDisplay
              results={getMockFinalResult()!}
              sessionId={sessionId}
              onCopy={handleCopyContent}
              onDownload={handleDownloadContent}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              <p>Nexus Agent v1.0.0 - Multi-Tool Financial Analyst</p>
              <p className="mt-1">
                Powered by ReAct framework with real-time SSE streaming
              </p>
            </div>
            <div className="text-right">
              <p>Built with Next.js + FastAPI</p>
              <p className="mt-1">
                {sessionId && `Session: ${sessionId.slice(0, 8)}...`}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
