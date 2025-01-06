'use client'

import React from 'react'
import Image from 'next/image'

interface ImageViewModalProps {
  imageUrl: string
  isOpen: boolean
  onClose: () => void
}

const ImageViewModal: React.FC<ImageViewModalProps> = ({ imageUrl, isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="relative w-full h-[80vh]">
          <Image
            src={imageUrl}
            alt="Vehicle Image"
            fill
            className="object-contain rounded-lg"
          />
        </div>
      </div>
    </div>
  )
}

export default ImageViewModal 