'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Vehicle } from '@/app/types'
import { XMarkIcon } from '@heroicons/react/24/outline'
import ImageUpload from './ImageUpload'

interface AddServiceModalProps {
  isOpen: boolean
  onClose: () => void
  onServiceAdded: () => void
}

export default function AddServiceModal({ isOpen, onClose, onServiceAdded }: AddServiceModalProps) {
  const [loading, setLoading] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    vehicle_id: '',
    service_type: '',
    description: '',
    cost: 0,
    technician_notes: ''
  })

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setVehicles(data || [])
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Insert service
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .insert([
          {
            ...formData,
            status: 'pending'
          }
        ])
        .select()

      if (serviceError) throw serviceError

      // If we have an image, insert it into the images table
      if (imageUrl && serviceData?.[0]?.id) {
        const { error: imageError } = await supabase
          .from('images')
          .insert([
            {
              service_id: serviceData[0].id,
              url: imageUrl,
              type: 'service'
            }
          ])

        if (imageError) throw imageError
      }
      
      onServiceAdded()
      onClose()
      setFormData({
        vehicle_id: '',
        service_type: '',
        description: '',
        cost: 0,
        technician_notes: ''
      })
      setImageUrl(null)
    } catch (error) {
      console.error('Error adding service:', error)
      alert('Error adding service. Please try again.')
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
          <h3 className="text-lg font-medium leading-6 text-metal-100">Add New Service</h3>
          <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-metal-300">Service Image</label>
              <div className="mt-1">
                <ImageUpload
                  onUploadComplete={(url) => setImageUrl(url)}
                  type="service"
                />
              </div>
              {imageUrl && (
                <div className="mt-2">
                  <img
                    src={imageUrl}
                    alt="Service preview"
                    className="h-32 w-full object-cover rounded-md"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-metal-300">Vehicle</label>
              <select
                required
                className="mt-1 block w-full rounded-md bg-metal-800 border-metal-700 text-metal-100 shadow-sm focus:border-racing-red focus:ring-racing-red"
                value={formData.vehicle_id}
                onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
              >
                <option value="">Select a vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.license_plate}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-metal-300">Service Type</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md bg-metal-800 border-metal-700 text-metal-100 shadow-sm focus:border-racing-red focus:ring-racing-red"
                value={formData.service_type}
                onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-metal-300">Description</label>
              <textarea
                required
                rows={3}
                className="mt-1 block w-full rounded-md bg-metal-800 border-metal-700 text-metal-100 shadow-sm focus:border-racing-red focus:ring-racing-red"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-metal-300">Cost</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md bg-metal-800 border-metal-700 text-metal-100 shadow-sm focus:border-racing-red focus:ring-racing-red"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-metal-300">Technician Notes</label>
              <textarea
                className="mt-1 block w-full rounded-md bg-metal-800 border-metal-700 text-metal-100 shadow-sm focus:border-racing-red focus:ring-racing-red"
                rows={3}
                value={formData.technician_notes}
                onChange={(e) => setFormData({ ...formData, technician_notes: e.target.value })}
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
                {loading ? 'Adding...' : 'Add Service'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 