'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Service, Vehicle } from '@/app/types'
import { PlusIcon } from '@heroicons/react/24/outline'
import AddServiceModal from '@/app/components/AddServiceModal'

interface ServiceWithVehicle extends Service {
  vehicle: Vehicle
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceWithVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          vehicle:vehicles(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
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
    return <div className="text-metal-300">Loading services...</div>
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-metal-100">Service Management</h1>
          <p className="mt-2 text-sm text-metal-400">
            Track and manage all service records
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-racing-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Service
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
                      Service Type
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-metal-300">
                      Description
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-metal-300">
                      Cost
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-metal-300">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-metal-700 bg-oil-dark">
                  {services.map((service) => (
                    <tr key={service.id} className="hover:bg-metal-800 cursor-pointer">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-metal-300 sm:pl-6">
                        {service.vehicle.year} {service.vehicle.make} {service.vehicle.model}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-metal-400">
                        {service.service_type}
                      </td>
                      <td className="px-3 py-4 text-sm text-metal-400">
                        {service.description}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-metal-400">
                        ${service.cost}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(service.status)}`}>
                          {service.status}
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

      <AddServiceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onServiceAdded={fetchServices}
      />
    </div>
  )
} 