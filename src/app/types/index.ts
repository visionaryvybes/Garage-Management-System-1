export interface Vehicle {
  id: string
  created_at: string
  make: string
  model: string
  year: number
  license_plate: string
  owner_name: string
  owner_phone: string
  status: 'pending' | 'in_progress' | 'completed' | 'delivered'
  notes?: string
  images?: Image[]
}

export interface Service {
  id: string
  created_at: string
  vehicle_id: string
  service_type: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  cost: number
  completed_at?: string
  technician_notes?: string
  images?: Image[]
}

export interface Image {
  id: string
  created_at: string
  vehicle_id?: string
  service_id?: string
  url: string
  type: 'vehicle' | 'service'
  caption?: string
} 