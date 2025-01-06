'use client'

import React, { useState, useEffect } from 'react'
import { supabase, ensureStorageBucket } from '@/lib/supabase'
import ImageViewModal from './ImageViewModal'

interface AddVehicleModalProps {
  isOpen: boolean
  onClose: () => void
  onVehicleAdded: () => void
}

export default function AddVehicleModal({ isOpen, onClose, onVehicleAdded }: AddVehicleModalProps) {
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [licensePlate, setLicensePlate] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [isImageViewOpen, setIsImageViewOpen] = useState(false)
  const [assignedMechanic, setAssignedMechanic] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Ensure storage bucket exists when modal opens
  useEffect(() => {
    if (isOpen) {
      ensureStorageBucket().catch(console.error);
    }
  }, [isOpen]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB')
        return
      }
      setSelectedImage(file)
      setImageUrl(URL.createObjectURL(file))
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate required fields
      if (!make || !model || !year || !licensePlate || !ownerName || !ownerPhone) {
        throw new Error('Please fill in all required fields');
      }

      // Add vehicle to database without image for now
      const { error: vehicleError } = await supabase.from('vehicles').insert([
        {
          make,
          model,
          year: parseInt(year),
          license_plate: licensePlate,
          owner_name: ownerName,
          owner_phone: ownerPhone,
          assigned_mechanic: assignedMechanic || null
        }
      ]);

      if (vehicleError) {
        console.error('Vehicle insert error:', vehicleError);
        throw new Error(vehicleError.message);
      }

      onVehicleAdded();
      onClose();
      
      // Reset form
      setMake('');
      setModel('');
      setYear('');
      setLicensePlate('');
      setOwnerName('');
      setOwnerPhone('');
      setAssignedMechanic('');
      setSelectedImage(null);
      setImageUrl('');
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Failed to add vehicle');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Add New Vehicle</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Make</label>
              <input
                type="text"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white text-black focus:ring-2 focus:ring-blue-500"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Model</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white text-black focus:ring-2 focus:ring-blue-500"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white text-black focus:ring-2 focus:ring-blue-500"
                required
                min="1900"
                max={new Date().getFullYear() + 1}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">License Plate</label>
              <input
                type="text"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white text-black focus:ring-2 focus:ring-blue-500"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Owner Name</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white text-black focus:ring-2 focus:ring-blue-500"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Owner Phone</label>
              <input
                type="tel"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white text-black focus:ring-2 focus:ring-blue-500"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Assigned Mechanic</label>
              <input
                type="text"
                value={assignedMechanic}
                onChange={(e) => setAssignedMechanic(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white text-black focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Vehicle Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 block w-full"
                disabled={isLoading}
              />
              {imageUrl && (
                <div className="mt-2 relative h-40 w-full">
                  <img
                    src={imageUrl}
                    alt="Vehicle Preview"
                    className="h-full w-full object-cover rounded cursor-pointer"
                    onClick={() => setIsImageViewOpen(true)}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
      <ImageViewModal
        isOpen={isImageViewOpen}
        onClose={() => setIsImageViewOpen(false)}
        imageUrl={imageUrl}
      />
    </div>
  )
} 