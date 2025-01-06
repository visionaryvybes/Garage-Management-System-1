'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Vehicle } from '@/app/types'
import AddVehicleModal from '@/app/components/AddVehicleModal'
import { PlusIcon } from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

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
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-900 text-green-300'
      case 'in_progress':
        return 'bg-yellow-900 text-yellow-300'
      default:
        return 'bg-metal-700 text-metal-300'
    }
  }

  if (loading) {
    return <div className="text-metal-300">Loading vehicles...</div>
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-metal-100">Vehicle Management</h1>
          <p className="mt-2 text-sm text-metal-400">
            Track and manage all vehicles currently in the garage
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-racing-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Vehicle
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="overflow-hidden shadow ring-1 ring-metal-700 rounded-lg">
              <table className="min-w-full divide-y divide-metal-700">
                <thead className="bg-oil-light">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-metal-300 sm:pl-6">
                      Vehicle
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-metal-300">
                      License Plate
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-metal-300">
                      Owner
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-metal-300">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-metal-700 bg-oil-dark">
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-metal-800 cursor-pointer">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-metal-300 sm:pl-6">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-metal-400">
                        {vehicle.license_plate}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-metal-400">
                        {vehicle.owner_name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(vehicle.status)}`}>
                          {vehicle.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <AddVehicleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onVehicleAdded={fetchVehicles}
      />
    </div>
  )
} 