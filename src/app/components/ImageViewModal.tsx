'use client'

import React from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface ImageViewModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  title: string
  details?: {
    label: string
    value: string
  }[]
}

export default function ImageViewModal({ isOpen, onClose, imageUrl, title, details }: ImageViewModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border max-w-3xl shadow-lg rounded-lg bg-oil-dark border-metal-700">
        <div className="absolute top-4 right-4">
          <button
            onClick={onClose}
            className="text-metal-400 hover:text-metal-300 focus:outline-none"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="mt-3">
          <h3 className="text-lg font-medium leading-6 text-metal-100 mb-4">{title}</h3>
          <div className="relative h-96 w-full">
            <img
              src={imageUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-contain rounded-lg"
            />
          </div>
          {details && details.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              {details.map((detail, index) => (
                <div key={index} className="bg-metal-800 p-3 rounded-lg">
                  <dt className="text-sm font-medium text-metal-400">{detail.label}</dt>
                  <dd className="mt-1 text-sm text-metal-100">{detail.value}</dd>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 