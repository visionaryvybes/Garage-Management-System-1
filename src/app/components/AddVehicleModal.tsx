'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Vehicle } from '@/app/types'
import { XMarkIcon } from '@heroicons/react/24/outline'
import ImageUpload from './ImageUpload'

interface AddVehicleModalProps {
  isOpen: boolean
  onClose: () => void
  onVehicleAdded: () => void
}

export default function AddVehicleModal({ isOpen, onClose, onVehicleAdded }: AddVehicleModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    license_plate: '',
    owner_name: '',
    owner_phone: '',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Insert vehicle
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .insert([
          {
            ...formData,
            status: 'pending'
          }
        ])
        .select()

      if (vehicleError) throw vehicleError

      // If we have an image, insert it into the images table
      if (imageUrl && vehicleData?.[0]?.id) {
        const { error: imageError } = await supabase
          .from('images')
          .insert([
            {
              vehicle_id: vehicleData[0].id,
              url: imageUrl,
              type: 'vehicle'
            }
          ])

        if (imageError) throw imageError
      }

      onVehicleAdded()
      onClose()
      setFormData({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        license_plate: '',
        owner_name: '',
        owner_phone: '',
        notes: ''
      })
      setImageUrl(null)
    } catch (error: any) {
      console.error('Detailed error:', error)
      setError(error.message || 'Error adding vehicle. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-oil-dark border-metal-700">
        <div className="absolute top-4 right-4">
          <button
            onClick={onClose}
            className="text-metal-400 hover:text-metal-300 focus:outline-none"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="mt-3">
          <h3 className="text-lg font-medium leading-6 text-metal-100">Add New Vehicle</h3>
          {error && (
            <div className="mt-2 p-2 text-sm text-red-300 bg-red-900 bg-opacity-50 rounded">
              {error}
            </div>
          )}
          <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-metal-300">Vehicle Image</label>
              <div className="mt-1">
                <ImageUpload
                  onUploadComplete={(url) => setImageUrl(url)}
                  type="vehicle"
                />
              </div>
              {imageUrl && (
                <div className="mt-2">
                  <img
                    src={imageUrl}
                    alt="Vehicle preview"
                    className="h-32 w-full object-cover rounded-md"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-metal-300">Make</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md bg-metal-800 border-metal-700 text-metal-100 shadow-sm focus:border-racing-red focus:ring-racing-red"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-metal-300">Model</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md bg-metal-800 border-metal-700 text-metal-100 shadow-sm focus:border-racing-red focus:ring-racing-red"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-metal-300">Year</label>
              <input
                type="number"
                required
                min="1900"
                max={new Date().getFullYear() + 1}
                className="mt-1 block w-full rounded-md bg-metal-800 border-metal-700 text-metal-100 shadow-sm focus:border-racing-red focus:ring-racing-red"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-metal-300">License Plate</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md bg-metal-800 border-metal-700 text-metal-100 shadow-sm focus:border-racing-red focus:ring-racing-red"
                value={formData.license_plate}
                onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-metal-300">Owner Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md bg-metal-800 border-metal-700 text-metal-100 shadow-sm focus:border-racing-red focus:ring-racing-red"
                value={formData.owner_name}
                onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-metal-300">Owner Phone</label>
              <input
                type="tel"
                required
                className="mt-1 block w-full rounded-md bg-metal-800 border-metal-700 text-metal-100 shadow-sm focus:border-racing-red focus:ring-racing-red"
                value={formData.owner_phone}
                onChange={(e) => setFormData({ ...formData, owner_phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-metal-300">Notes</label>
              <textarea
                className="mt-1 block w-full rounded-md bg-metal-800 border-metal-700 text-metal-100 shadow-sm focus:border-racing-red focus:ring-racing-red"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-metal-300 bg-metal-800 border border-metal-600 rounded-md hover:bg-metal-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                  loading
                    ? 'bg-metal-600 cursor-not-allowed'
                    : 'bg-racing-red hover:bg-red-700'
                }`}
              >
                {loading ? 'Adding...' : 'Add Vehicle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 