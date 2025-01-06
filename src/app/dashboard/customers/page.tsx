'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Vehicle } from '@/app/types'
import { PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

interface Customer {
  name: string
  phone: string
  vehicles: Vehicle[]
  total_services: number
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Record<string, Customer>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      // Fetch vehicles with their services
      const { data: vehicles, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          services(count)
        `)

      if (error) throw error

      // Group vehicles by owner
      const customerMap: Record<string, Customer> = {}
      vehicles?.forEach((vehicle: any) => {
        const ownerKey = `${vehicle.owner_name}|${vehicle.owner_phone}`
        if (!customerMap[ownerKey]) {
          customerMap[ownerKey] = {
            name: vehicle.owner_name,
            phone: vehicle.owner_phone,
            vehicles: [],
            total_services: 0
          }
        }
        customerMap[ownerKey].vehicles.push(vehicle)
        customerMap[ownerKey].total_services += vehicle.services.count
      })

      setCustomers(customerMap)
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-metal-300">Loading customers...</div>
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-metal-100">Customer Management</h1>
          <p className="mt-2 text-sm text-metal-400">
            View and manage customer information and their vehicles
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(customers).map(([key, customer]) => (
          <div
            key={key}
            className="bg-oil-dark rounded-lg shadow-sm border border-metal-700 overflow-hidden hover:border-racing-red transition-colors"
          >
            <div className="p-6">
              <h3 className="text-lg font-medium text-metal-100">{customer.name}</h3>
              <div className="mt-2 flex items-center text-sm text-metal-400">
                <PhoneIcon className="h-5 w-5 text-metal-500 mr-2" />
                {customer.phone}
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-metal-300">Vehicles ({customer.vehicles.length})</h4>
                <ul className="mt-2 space-y-2">
                  {customer.vehicles.map((vehicle) => (
                    <li key={vehicle.id} className="text-sm text-metal-400">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                      <span className="ml-2 text-metal-500">({vehicle.license_plate})</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 pt-4 border-t border-metal-700">
                <div className="flex justify-between text-sm">
                  <span className="text-metal-400">Total Services</span>
                  <span className="text-metal-300 font-medium">{customer.total_services}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 