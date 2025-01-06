'use client'

import React, { useState, useEffect } from 'react'
import { Vehicle, Service, ServiceSummary } from '@/app/types'
import { supabase } from '@/lib/supabase'
import { ensureServiceTable } from '@/lib/supabase'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import ScheduleServiceModal from './ScheduleServiceModal'

interface VehicleDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  vehicle: Vehicle
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const STATUS_COLORS = {
  completed: 'bg-green-100 text-green-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  pending: 'bg-gray-100 text-gray-800'
};

export default function VehicleDetailsModal({ isOpen, onClose, vehicle }: VehicleDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && vehicle.id) {
      console.log('Modal opened for vehicle:', vehicle);
      ensureServiceTable().then(() => {
        fetchServices();
      }).catch(console.error);
    }
  }, [isOpen, vehicle.id]);

  const fetchServices = async () => {
    try {
      console.log('Fetching services for vehicle:', vehicle.id);
      const { data, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('vehicle_id', vehicle.id)
        .order('scheduled_date', { ascending: false });

      if (servicesError) {
        console.error('Services fetch error:', servicesError);
        throw servicesError;
      }

      console.log('Fetched services:', data);
      setServices(data || []);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load service history');
    } finally {
      setLoading(false);
    }
  };

  // Process service data for charts
  const processServiceData = () => {
    const serviceTypes = services.reduce((acc: { [key: string]: ServiceSummary }, service) => {
      if (!acc[service.service_type]) {
        acc[service.service_type] = {
          service_type: service.service_type,
          count: 0,
          total_cost: 0
        };
      }
      acc[service.service_type].count += 1;
      acc[service.service_type].total_cost += service.cost;
      return acc;
    }, {});

    return Object.values(serviceTypes).map(type => ({
      name: type.service_type,
      value: type.count,
      cost: type.total_cost
    }));
  };

  const processCostTrends = () => {
    const monthlyData: { [key: string]: number } = {};
    services.forEach(service => {
      const month = new Date(service.scheduled_date).toLocaleString('default', { month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + service.cost;
    });

    return Object.entries(monthlyData).map(([month, cost]) => ({
      month,
      cost
    }));
  };

  const processUpcomingServices = () => {
    return services
      .filter(service => service.status === 'pending')
      .map(service => ({
        name: service.service_type,
        days: Math.ceil((new Date(service.scheduled_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
      }))
      .filter(service => service.days > 0)
      .sort((a, b) => a.days - b.days)
      .slice(0, 5);
  };

  const serviceData = processServiceData();
  const costTrends = processCostTrends();
  const upcomingServices = processUpcomingServices();

  // Add function to update service status
  const updateServiceStatus = async (serviceId: number, newStatus: Service['status']) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ 
          status: newStatus,
          completed_date: newStatus === 'completed' ? new Date().toISOString() : null 
        })
        .eq('id', serviceId);

      if (error) throw error;
      fetchServices();
    } catch (err) {
      console.error('Error updating service status:', err);
      setError('Failed to update service status');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full m-4 p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {vehicle.make} {vehicle.model}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Vehicle ID: {vehicle.id} • Registered on {new Date(vehicle.created_at || '').toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'services', 'costs', 'schedule'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeTab === 'overview' && (
            <>
              {/* Vehicle Information */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Vehicle Details</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Year:</span> {vehicle.year}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">License Plate:</span> {vehicle.license_plate}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Owner:</span> {vehicle.owner_name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Contact:</span> {vehicle.owner_phone}
                  </p>
                  {vehicle.assigned_mechanic && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Mechanic:</span> {vehicle.assigned_mechanic}
                    </p>
                  )}
                </div>
              </div>

              {/* Service Distribution Chart */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Service Distribution</h3>
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <p>Loading service data...</p>
                  </div>
                ) : serviceData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={serviceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {serviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} services`, name]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p>No service data available</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'services' && (
            <>
              {/* Service History */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg md:col-span-2">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Service History</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Service</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Mechanic</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Cost</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {services.map((service) => (
                        <tr key={service.id}>
                          <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                            {new Date(service.scheduled_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                            {service.service_type}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                            {service.mechanic}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                            ${service.cost.toFixed(2)}
                          </td>
                          <td className="px-4 py-2">
                            <select
                              value={service.status}
                              onChange={(e) => updateServiceStatus(service.id, e.target.value as Service['status'])}
                              className={`px-2 py-1 text-xs font-medium rounded-full border-0 ${STATUS_COLORS[service.status]} cursor-pointer`}
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            {service.notes && (
                              <button
                                className="text-blue-600 hover:text-blue-800"
                                onClick={() => alert(service.notes)}
                                title="View Notes"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'costs' && (
            <>
              {/* Cost Trends */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg md:col-span-2">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Cost Trends</h3>
                {loading ? (
                  <div className="h-80 flex items-center justify-center">
                    <p>Loading cost data...</p>
                  </div>
                ) : costTrends.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={costTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}`, 'Cost']} />
                        <Legend />
                        <Line type="monotone" dataKey="cost" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <p>No cost data available</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'schedule' && (
            <>
              {/* Upcoming Services */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg md:col-span-2">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Upcoming Services</h3>
                {loading ? (
                  <div className="h-80 flex items-center justify-center">
                    <p>Loading schedule data...</p>
                  </div>
                ) : upcomingServices.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={upcomingServices}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} days`, 'Time until service']} />
                        <Legend />
                        <Bar dataKey="days" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <p>No upcoming services scheduled</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Schedule Service
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        {/* Schedule Service Modal */}
        <ScheduleServiceModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          vehicleId={vehicle.id}
          onServiceScheduled={fetchServices}
        />
      </div>
    </div>
  );
} 