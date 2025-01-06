export interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  owner_name: string;
  owner_phone: string;
  image_url?: string;
  assigned_mechanic?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id: number;
  vehicle_id: number;
  service_type: string;
  mechanic: string;
  cost: number;
  status: 'pending' | 'in_progress' | 'completed';
  scheduled_date: string;
  completed_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  vehicles?: {
    id: number;
    make: string;
    model: string;
    license_plate: string;
    image_url?: string;
  };
}

export interface ServiceSummary {
  service_type: string;
  count: number;
  total_cost: number;
} 