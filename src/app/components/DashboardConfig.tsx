'use client'

import React, { useState } from 'react';
import { AIAgent } from '@/lib/aiAgent';

export default function DashboardConfig() {
  const [request, setRequest] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfigRequest = async () => {
    if (!request.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const agent = AIAgent.getInstance();
      const config = await agent.processRequest(request);
      
      // Emit event with new configuration
      const configEvent = new CustomEvent('dashboard-config-update', {
        detail: config
      });
      window.dispatchEvent(configEvent);
      
      setRequest('');
    } catch (err: any) {
      console.error('Configuration error:', err);
      setError(err.message || 'Failed to process configuration request');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 max-w-md">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder="How would you like to configure your dashboard?"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing}
          />
          <button
            onClick={handleConfigRequest}
            disabled={isProcessing || !request.trim()}
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isProcessing ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              'Configure'
            )}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
} 