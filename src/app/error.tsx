'use client'

import React from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-metal-900 flex items-center justify-center px-4">
      <div className="text-center">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-racing-red" />
        <h3 className="mt-2 text-lg font-medium text-metal-100">Something went wrong</h3>
        <p className="mt-1 text-sm text-metal-400">{error.message}</p>
        <div className="mt-6">
          <button
            onClick={reset}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-racing-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  )
} 