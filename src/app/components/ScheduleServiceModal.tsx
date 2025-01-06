'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Vehicle } from '@/app/types'

interface ScheduleServiceModalProps {
  isOpen: boolean
  onClose: () => void
  vehicleId?: number | null
  onServiceScheduled: () => void
}

export default function ScheduleServiceModal({
  isOpen,
  onClose,
  vehicleId,
  onServiceScheduled
}: ScheduleServiceModalProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(vehicleId || null);
  const [serviceType, setServiceType] = useState('');
  const [mechanic, setMechanic] = useState('');
  const [cost, setCost] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchVehicles();
    }
  }, [isOpen]);

  useEffect(() => {
    if (vehicleId) {
      setSelectedVehicle(vehicleId);
    }
  }, [vehicleId]);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('make');

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setError('Failed to load vehicles');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!selectedVehicle) {
        throw new Error('Please select a vehicle');
      }

      const { error: insertError } = await supabase
        .from('services')
        .insert([
          {
            vehicle_id: selectedVehicle,
            service_type: serviceType,
            mechanic,
            cost: parseFloat(cost),
            status: 'pending',
            scheduled_date: new Date(scheduledDate).toISOString(),
            notes: notes || null
          }
        ]);

      if (insertError) throw insertError;

      onServiceScheduled();
      onClose();
      
      // Reset form
      setSelectedVehicle(null);
      setServiceType('');
      setMechanic('');
      setCost('');
      setScheduledDate('');
      setNotes('');
    } catch (error: any) {
      console.error('Error scheduling service:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Schedule Service</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Vehicle
            </label>
            <select
              value={selectedVehicle || ''}
              onChange={(e) => setSelectedVehicle(parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white text-black focus:ring-2 focus:ring-blue-500"
              required
              disabled={isLoading}
            >
              <option value="">Select a vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.make} {vehicle.model} ({vehicle.license_plate})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Service Type
            </label>
            <input
              type="text"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white text-black focus:ring-2 focus:ring-blue-500"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mechanic
            </label>
            <input
              type="text"
              value={mechanic}
              onChange={(e) => setMechanic(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white text-black focus:ring-2 focus:ring-blue-500"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cost
            </label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white text-black focus:ring-2 focus:ring-blue-500"
              required
              min="0"
              step="0.01"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Scheduled Date
            </label>
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white text-black focus:ring-2 focus:ring-blue-500"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white text-black focus:ring-2 focus:ring-blue-500"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end space-x-3">
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
              {isLoading ? 'Scheduling...' : 'Schedule Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 