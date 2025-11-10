/**
 * QueryInput Component - Handles user input for financial analysis queries
 * 
 * This component provides a text area for users to enter complex financial
 * queries and submit them to the Nexus Agent for processing.
 */

import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface QueryInputProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const QueryInput: React.FC<QueryInputProps> = ({
  onSubmit,
  isLoading,
  disabled = false
}) => {
  const [query, setQuery] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSubmit(query.trim());
    }
  };

  const exampleQueries = [
    "Compare the Q3 2024 revenue growth of NVIDIA and AMD, and then draft a summary email to my manager about which stock is a better buy right now, citing a key risk for each.",
    "Analyze Apple's latest quarterly earnings and create a risk assessment report for the next 6 months.",
    "Compare Tesla and Ford's electric vehicle market share and draft talking points for a board presentation."
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Financial Analysis Query
        </h2>
        <p className="text-gray-600 text-sm">
          Enter a complex financial question and watch the AI agent work through it step by step.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your financial analysis query..."
            className="w-full h-32 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={disabled || isLoading}
          />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {query.length}/1000 characters
          </span>
          
          <button
            type="submit"
            disabled={!query.trim() || isLoading || disabled}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Analyze
              </>
            )}
          </button>
        </div>
      </form>

      {!isLoading && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Example Queries:
          </h3>
          <div className="space-y-2">
            {exampleQueries.map((example, index) => (
              <button
                key={index}
                onClick={() => setQuery(example)}
                className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-md transition-colors border border-gray-200"
                disabled={disabled || isLoading}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
