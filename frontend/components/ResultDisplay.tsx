/**
 * ResultDisplay Component - Shows the final results of agent analysis
 * 
 * This component presents the completed analysis results in a structured
 * format including financial comparisons, recommendations, and generated content.
 */

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  FileText, 
  Download,
  Copy,
  CheckCircle
} from 'lucide-react';

interface FinancialComparison {
  symbol: string;
  revenue: string;
  growth: string;
  risk_score: number;
  key_risk: string;
}

interface ResultData {
  comparison: FinancialComparison[];
  recommendation: {
    symbol: string;
    reasoning: string;
    confidence: number;
  };
  generated_content: {
    type: string;
    content: string;
    word_count: number;
  };
  risks_summary: {
    [symbol: string]: string;
  };
  execution_summary: {
    total_steps: number;
    execution_time: string;
    data_sources: string[];
  };
}

interface ResultDisplayProps {
  results: ResultData;
  sessionId: string;
  onCopy?: (content: string) => void;
  onDownload?: (content: string, filename: string) => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  results,
  sessionId,
  onCopy,
  onDownload
}) => {
  const [copiedContent, setCopiedContent] = React.useState<string | null>(null);

  const handleCopy = async (content: string, label: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedContent(label);
      onCopy?.(content);
      setTimeout(() => setCopiedContent(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    onDownload?.(content, filename);
  };

  const getGrowthIcon = (growth: string) => {
    const growthNum = parseFloat(growth.replace('%', ''));
    return growthNum > 0 ? 
      <TrendingUp className="w-4 h-4 text-green-500" /> : 
      <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore < 30) return 'text-green-600 bg-green-100';
    if (riskScore < 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Analysis Results
          </h2>
          <div className="text-sm text-gray-500 space-y-1">
            <div>Session: {sessionId.slice(0, 8)}...</div>
            <div>Completed in {results.execution_summary.execution_time}</div>
          </div>
        </div>
      </div>

      {/* Financial Comparison */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
          Financial Comparison
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.comparison.map((company, index) => (
            <div key={company.symbol} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-bold text-gray-800">
                  {company.symbol}
                </h4>
                <div className="flex items-center">
                  {getGrowthIcon(company.growth)}
                  <span className="ml-1 font-semibold text-gray-700">
                    {company.growth}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Q3 2024 Revenue:</span>
                  <span className="font-medium">{company.revenue}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Risk Score:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(company.risk_score)}`}>
                    {company.risk_score}/100
                  </span>
                </div>
                
                <div className="mt-3 p-3 bg-gray-50 rounded">
                  <div className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs text-gray-500">Key Risk:</span>
                      <p className="text-sm text-gray-700">{company.key_risk}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
          Investment Recommendation
        </h3>
        
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <div className="flex items-start">
            <div className="flex-1">
              <h4 className="text-lg font-bold text-blue-800 mb-2">
                Recommended: {results.recommendation.symbol}
              </h4>
              <p className="text-blue-700 mb-3">
                {results.recommendation.reasoning}
              </p>
              <div className="flex items-center">
                <span className="text-sm text-blue-600">Confidence Level:</span>
                <div className="ml-2 bg-blue-200 rounded-full w-24 h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${results.recommendation.confidence}%` }}
                  />
                </div>
                <span className="ml-2 text-sm font-medium text-blue-800">
                  {results.recommendation.confidence}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-purple-500" />
            Generated {results.generated_content.type.replace('_', ' ').toUpperCase()}
          </h3>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleCopy(results.generated_content.content, 'email')}
              className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              disabled={copiedContent === 'email'}
            >
              {copiedContent === 'email' ? (
                <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 mr-1" />
              )}
              {copiedContent === 'email' ? 'Copied!' : 'Copy'}
            </button>
            
            <button
              onClick={() => handleDownload(
                results.generated_content.content, 
                `nexus-agent-${results.generated_content.type}-${new Date().toISOString().split('T')[0]}.txt`
              )}
              className="flex items-center px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="mb-2 text-xs text-gray-500">
            {results.generated_content.word_count} words
          </div>
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-gray-800">
              {results.generated_content.content}
            </pre>
          </div>
        </div>
      </div>

      {/* Execution Summary */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Execution Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-gray-500 mb-1">Total Steps</div>
            <div className="text-xl font-bold text-gray-800">
              {results.execution_summary.total_steps}
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-gray-500 mb-1">Processing Time</div>
            <div className="text-xl font-bold text-gray-800">
              {results.execution_summary.execution_time}
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-gray-500 mb-1">Data Sources</div>
            <div className="text-sm text-gray-700">
              {results.execution_summary.data_sources.join(', ')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
