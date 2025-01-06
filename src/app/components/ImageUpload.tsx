'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { PhotoIcon } from '@heroicons/react/24/outline'

interface ImageUploadProps {
  onUploadComplete: (url: string) => void
  type: 'vehicle' | 'service'
}

export default function ImageUpload({ onUploadComplete, type }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleUpload(e.dataTransfer.files[0])
    }
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleUpload(e.target.files[0])
    }
  }

  const handleUpload = async (file: File) => {
    try {
      setUploading(true)

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${type}/${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from('images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      onUploadComplete(publicUrl)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error uploading image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-6 ${
        dragActive
          ? 'border-racing-red bg-racing-red bg-opacity-10'
          : 'border-metal-700 hover:border-metal-600'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleChange}
        accept="image/*"
        disabled={uploading}
      />
      <div className="text-center">
        <PhotoIcon className="mx-auto h-12 w-12 text-metal-400" />
        <div className="mt-4 flex text-sm leading-6 text-metal-300">
          <span className="relative rounded-md font-semibold text-racing-red focus-within:outline-none focus-within:ring-2 focus-within:ring-racing-red focus-within:ring-offset-2">
            {uploading ? 'Uploading...' : 'Upload an image'}
          </span>
          <p className="pl-1">or drag and drop</p>
        </div>
        <p className="text-xs leading-5 text-metal-400">PNG, JPG, GIF up to 10MB</p>
      </div>
    </div>
  )
} 