import React from 'react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-metal-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-racing-red"></div>
    </div>
  )
} 