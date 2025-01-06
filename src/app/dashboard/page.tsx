'use client'

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ensureVehiclesTable, ensureServiceTable } from '@/lib/supabase';
import AddVehicleModal from '../components/AddVehicleModal';
import ImageViewModal from '../components/ImageViewModal';
import VehicleDetailsModal from '../components/VehicleDetailsModal';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Vehicle, Service } from '@/app/types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Dashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [isImageViewOpen, setIsImageViewOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch both vehicles and services
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Starting to fetch data...');

      // First check if tables exist
      const vehiclesCheck = await ensureVehiclesTable();
      const servicesCheck = await ensureServiceTable();
      console.log('Tables check:', { vehiclesCheck, servicesCheck });

      // Fetch vehicles with detailed logging
      console.log('Attempting to fetch vehicles...');
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*');

      // Log the raw response
      console.log('Raw vehicles response:', { data: vehiclesData, error: vehiclesError });

      if (vehiclesError) {
        console.error('Error fetching vehicles:', vehiclesError);
        throw new Error(`Failed to fetch vehicles: ${vehiclesError.message}`);
      }

      // Log the vehicles data
      console.log('Successfully fetched vehicles:', vehiclesData);
      console.log('Number of vehicles:', vehiclesData?.length || 0);

      // Update vehicles state
      setVehicles(vehiclesData || []);

      // Fetch services with detailed logging
      console.log('Attempting to fetch services...');
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*');

      // Log the raw response
      console.log('Raw services response:', { data: servicesData, error: servicesError });

      if (servicesError) {
        console.error('Error fetching services:', servicesError);
        throw new Error(`Failed to fetch services: ${servicesError.message}`);
      }

      // Log the services data
      console.log('Successfully fetched services:', servicesData);
      console.log('Number of services:', servicesData?.length || 0);

      // Update services state
      setServices(servicesData || []);

    } catch (error: any) {
      console.error('Error in fetchData:', error);
      setError(error.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    console.log('Dashboard mounted, fetching data...');
    fetchData();
  }, []);

  // Debug state changes
  useEffect(() => {
    console.log('Vehicles state updated:', vehicles);
  }, [vehicles]);

  useEffect(() => {
    console.log('Services state updated:', services);
  }, [services]);

  // Process data for charts
  const serviceData = services.reduce((acc: { name: string; value: number }[], service) => {
    const existing = acc.find(item => item.name === service.service_type);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: service.service_type, value: 1 });
    }
    return acc;
  }, []);

  const costTrends = services.reduce((acc: { month: string; cost: number }[], service) => {
    const month = new Date(service.scheduled_date).toLocaleString('default', { month: 'short' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.cost += service.cost;
    } else {
      acc.push({ month, cost: service.cost });
    }
    return acc;
  }, []);

  const upcomingServices = services
    .filter(service => service.status === 'pending')
    .map(service => ({
      name: service.service_type,
      days: Math.ceil((new Date(service.scheduled_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
    }))
    .filter(service => service.days > 0)
    .sort((a, b) => a.days - b.days)
    .slice(0, 5);

  const handleEdit = async (vehicle: Vehicle) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          license_plate: vehicle.license_plate,
          assigned_mechanic: vehicle.assigned_mechanic,
          owner_name: vehicle.owner_name,
          owner_phone: vehicle.owner_phone
        })
        .eq('id', vehicle.id);

      if (error) throw error;
      
      setEditingVehicle(null);
      fetchData();
    } catch (error) {
      console.error('Error updating vehicle:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vehicle Management</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Vehicle
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading data...</p>
        </div>
      ) : (
        <>
          {/* Dashboard Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg shadow-xl p-6">
              <h3 className="text-lg font-semibold mb-2">Total Vehicles</h3>
              <p className="text-2xl font-bold">{vehicles.length}</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg shadow-xl p-6">
              <h3 className="text-lg font-semibold mb-2">Active Services</h3>
              <p className="text-2xl font-bold">
                {services.filter(s => s.status === 'in_progress').length}
              </p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg shadow-xl p-6">
              <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
              <p className="text-2xl font-bold">
                ${services.reduce((sum, s) => sum + (s.cost || 0), 0).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Service Distribution */}
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg shadow-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Service Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer>
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
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cost Trends */}
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg shadow-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Cost Trends</h3>
              <div className="h-64">
                <ResponsiveContainer>
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
            </div>

            {/* Upcoming Services */}
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg shadow-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Upcoming Services</h3>
              <div className="h-64">
                <ResponsiveContainer>
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
            </div>
          </div>

          {/* Vehicle Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.length === 0 ? (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No vehicles found. Add your first vehicle to get started.</p>
              </div>
            ) : (
              vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg shadow-xl p-6 cursor-pointer hover:bg-opacity-20 transition-all"
                  onClick={() => setSelectedVehicle(vehicle)}
                >
                  {editingVehicle?.id === vehicle.id ? (
                    <div className="space-y-3" onClick={e => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingVehicle.make}
                        onChange={(e) => setEditingVehicle({ ...editingVehicle, make: e.target.value })}
                        className="w-full px-3 py-2 bg-white text-black rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={editingVehicle.model}
                        onChange={(e) => setEditingVehicle({ ...editingVehicle, model: e.target.value })}
                        className="w-full px-3 py-2 bg-white text-black rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        value={editingVehicle.year}
                        onChange={(e) => setEditingVehicle({ ...editingVehicle, year: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 bg-white text-black rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={editingVehicle.license_plate}
                        onChange={(e) => setEditingVehicle({ ...editingVehicle, license_plate: e.target.value })}
                        className="w-full px-3 py-2 bg-white text-black rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={editingVehicle.owner_name}
                        onChange={(e) => setEditingVehicle({ ...editingVehicle, owner_name: e.target.value })}
                        className="w-full px-3 py-2 bg-white text-black rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={editingVehicle.owner_phone}
                        onChange={(e) => setEditingVehicle({ ...editingVehicle, owner_phone: e.target.value })}
                        className="w-full px-3 py-2 bg-white text-black rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex justify-end space-x-2 mt-4">
                        <button
                          onClick={() => setEditingVehicle(null)}
                          className="px-3 py-1 text-white bg-gray-600 rounded hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleEdit(editingVehicle)}
                          className="px-3 py-1 text-white bg-blue-600 rounded hover:bg-blue-700"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {vehicle.make} {vehicle.model}
                      </h3>
                      <div className="space-y-2 text-gray-300">
                        <p>Year: {vehicle.year}</p>
                        <p>License: {vehicle.license_plate}</p>
                        <p>Owner: {vehicle.owner_name}</p>
                        <p>Phone: {vehicle.owner_phone}</p>
                        {vehicle.assigned_mechanic && (
                          <p>Mechanic: {vehicle.assigned_mechanic}</p>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingVehicle(vehicle);
                          }}
                          className="mt-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Modals */}
          <AddVehicleModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onVehicleAdded={fetchData}
          />

          <ImageViewModal
            isOpen={isImageViewOpen}
            onClose={() => setIsImageViewOpen(false)}
            imageUrl={selectedImage}
          />

          {selectedVehicle && (
            <VehicleDetailsModal
              isOpen={!!selectedVehicle}
              onClose={() => setSelectedVehicle(null)}
              vehicle={selectedVehicle}
            />
          )}
        </>
      )}
    </div>
  );
} 