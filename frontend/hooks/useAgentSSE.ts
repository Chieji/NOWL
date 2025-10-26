/**
 * useAgentSSE Hook - Manages Server-Sent Events connection for real-time agent updates
 * 
 * This custom hook handles the SSE connection to stream real-time progress updates
 * from the Nexus Agent during query execution.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

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

interface AgentResult {
  comparison: any[];
  recommendation: any;
  generated_content: any;
  risks_summary: Record<string, string>;
  execution_summary: any;
}

interface UseAgentSSEReturn {
  steps: AgentStep[];
  finalResult: AgentResult | null;
  isConnected: boolean;
  isExecuting: boolean;
  error: string | null;
  sessionId: string | null;
  executeQuery: (query: string) => void;
  disconnect: () => void;
  reset: () => void;
}

export const useAgentSSE = (): UseAgentSSEReturn => {
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [finalResult, setFinalResult] = useState<AgentResult | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsConnected(false);
    setIsExecuting(false);
  }, []);

  const reset = useCallback(() => {
    disconnect();
    setSteps([]);
    setFinalResult(null);
    setError(null);
    setSessionId(null);
  }, [disconnect]);

  const executeQuery = useCallback((query: string) => {
    if (isExecuting) {
      console.warn('Agent is already executing a query');
      return;
    }

    reset();
    setIsExecuting(true);
    setError(null);

    // Create abort controller for cleanup
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Create SSE connection to backend
      const eventSource = new EventSource(
        `/api/agent/run?query=${encodeURIComponent(query)}&streaming=true`,
        {
          // Note: EventSource doesn't support custom headers or request body in browser
          // The query is passed as URL parameter for SSE compatibility
        }
      );

      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('SSE connection opened');
        setIsConnected(true);
        setError(null);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('SSE message received:', data);

          switch (data.type) {
            case 'session_start':
              setSessionId(data.session_id);
              break;

            case 'step_update':
              setSteps(prevSteps => {
                const existingStepIndex = prevSteps.findIndex(
                  step => step.step === data.step && 
                  step.timestamp === data.timestamp
                );

                if (existingStepIndex >= 0) {
                  // Update existing step
                  const updatedSteps = [...prevSteps];
                  updatedSteps[existingStepIndex] = {
                    step: data.step,
                    thought: data.thought,
                    action: data.action,
                    observation: data.observation,
                    status: data.status,
                    timestamp: data.timestamp
                  };
                  return updatedSteps;
                } else {
                  // Add new step
                  return [...prevSteps, {
                    step: data.step,
                    thought: data.thought,
                    action: data.action,
                    observation: data.observation,
                    status: data.status,
                    timestamp: data.timestamp
                  }];
                }
              });
              break;

            case 'execution_complete':
              setFinalResult(data.final_result);
              setIsExecuting(false);
              disconnect();
              break;

            case 'error':
              setError(data.error || 'An unknown error occurred');
              setIsExecuting(false);
              disconnect();
              break;

            default:
              console.warn('Unknown SSE message type:', data.type);
          }
        } catch (parseError) {
          console.error('Failed to parse SSE message:', parseError);
          setError('Failed to parse server response');
        }
      };

      eventSource.onerror = (event) => {
        console.error('SSE connection error:', event);
        
        // Check if this is a network error or server error
        if (eventSource.readyState === EventSource.CLOSED) {
          setError('Connection to server lost');
        } else {
          setError('Failed to connect to analysis service');
        }
        
        setIsExecuting(false);
        setIsConnected(false);
        disconnect();
      };

    } catch (initError) {
      console.error('Failed to initialize SSE connection:', initError);
      setError('Failed to start analysis');
      setIsExecuting(false);
    }

    // Handle abort signal
    abortController.signal.addEventListener('abort', () => {
      disconnect();
      setError('Analysis was cancelled');
      setIsExecuting(false);
    });

  }, [isExecuting, reset, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Auto-reconnect logic (optional)
  useEffect(() => {
    if (error && !isExecuting && sessionId) {
      const reconnectTimer = setTimeout(() => {
        console.log('Attempting to reconnect...');
        setError(null);
      }, 5000);

      return () => clearTimeout(reconnectTimer);
    }
  }, [error, isExecuting, sessionId]);

  return {
    steps,
    finalResult,
    isConnected,
    isExecuting,
    error,
    sessionId,
    executeQuery,
    disconnect,
    reset
  };
};
