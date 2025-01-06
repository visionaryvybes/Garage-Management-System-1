'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Service, Vehicle } from '@/app/types'
import ScheduleServiceModal from '../components/ScheduleServiceModal'
import Image from 'next/image'

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching services data...');

      // First try a simple query to check if services table exists
      const { data: servicesCheck, error: checkError } = await supabase
        .from('services')
        .select('*')
        .limit(1);

      console.log('Services check:', { servicesCheck, checkError });

      // Then fetch services with vehicle details
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select(`
          id,
          vehicle_id,
          service_type,
          mechanic,
          cost,
          status,
          scheduled_date,
          completed_date,
          notes,
          created_at,
          updated_at,
          vehicle:vehicle_id (
            id,
            make,
            model,
            license_plate,
            image_url
          )
        `)
        .order('scheduled_date', { ascending: false });

      console.log('Services query:', {
        data: servicesData,
        error: servicesError
      });

      if (servicesError) {
        console.error('Error fetching services:', servicesError);
        throw new Error(`Failed to fetch services: ${servicesError.message}`);
      }

      // Transform the data to match our expected format
      const transformedServices = servicesData?.map(service => ({
        ...service,
        vehicles: service.vehicle ? {
          id: service.vehicle.id,
          make: service.vehicle.make,
          model: service.vehicle.model,
          license_plate: service.vehicle.license_plate,
          image_url: service.vehicle.image_url
        } : undefined
      })) || [];

      console.log('Transformed services:', transformedServices);
      setServices(transformedServices as Service[]);

    } catch (error: any) {
      console.error('Error in fetchData:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateServiceStatus = async (serviceId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ 
          status: newStatus,
          completed_date: newStatus === 'completed' ? new Date().toISOString() : null 
        })
        .eq('id', serviceId);

      if (error) throw error;
      fetchData();
    } catch (error: any) {
      console.error('Error updating service status:', error);
      setError('Failed to update service status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Service Management</h1>
        <button
          onClick={() => setIsScheduleModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Schedule Service
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading services...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No services scheduled. Schedule your first service to get started.</p>
        </div>
      ) : (
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 bg-opacity-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Service Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-opacity-10">
                {services.map((service) => (
                  <tr key={service.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {service.vehicles?.image_url ? (
                        <div className="h-16 w-16 relative rounded-lg overflow-hidden">
                          <Image
                            src={service.vehicles.image_url}
                            alt={`${service.vehicles.make} ${service.vehicles.model}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {service.vehicles?.make} {service.vehicles?.model}
                      <br />
                      <span className="text-sm text-gray-400">
                        {service.vehicles?.license_plate}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {service.service_type}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {service.notes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      ${service.cost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={service.status}
                        onChange={(e) => updateServiceStatus(service.id, e.target.value)}
                        className={`px-2 py-1 text-sm rounded-full border-0 ${getStatusColor(service.status)} cursor-pointer`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ScheduleServiceModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        vehicleId={selectedVehicleId}
        onServiceScheduled={fetchData}
      />
    </div>
  );
} 